import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const HISTORY_LIMIT = 15

// GET - Fetch chat history
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('tests')
      .select('id, prompt_text, results, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(HISTORY_LIMIT)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }

    const history = data.map(item => ({
      id: item.id,
      prompt: item.prompt_text,
      responses: item.results || [],
      timestamp: item.created_at
    }))

    return NextResponse.json({ history })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Save new chat history item
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, responses } = await request.json()

    if (!prompt || !responses) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tests')
      .insert({
        user_id: user.id,
        prompt_text: prompt,
        selected_models: responses.map((r: any) => r.modelId),
        results: responses,
        metrics: responses.map((r: any) => r.metrics)
      })
      .select('id, prompt_text, results, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to save history' }, { status: 500 })
    }

    // Delete old items beyond limit
    const { data: allItems } = await supabase
      .from('tests')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (allItems && allItems.length > HISTORY_LIMIT) {
      const itemsToDelete = allItems.slice(HISTORY_LIMIT).map(item => item.id)
      await supabase.from('tests').delete().in('id', itemsToDelete)
    }

    return NextResponse.json({
      item: {
        id: data.id,
        prompt: data.prompt_text,
        responses: data.results || [],
        timestamp: data.created_at
      }
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
