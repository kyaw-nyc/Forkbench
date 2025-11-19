/**
 * API Route: POST /api/bench/run-test
 * Executes a prompt across multiple LLMs and streams results back
 */

import { NextRequest } from 'next/server'
import type { ModelId, StreamEvent } from '@/types/bench'
import { executePromptAcrossModels } from '@/lib/bench/executor'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds max

interface RunTestRequest {
  prompt: string
  modelIds: ModelId[]
  temperature?: number
  maxTokens?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: RunTestRequest = await request.json()
    const { prompt, modelIds, temperature, maxTokens } = body

    // Validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!modelIds || !Array.isArray(modelIds) || modelIds.length === 0) {
      return new Response(JSON.stringify({ error: 'At least one model must be selected' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (modelIds.length > 6) {
      return new Response(JSON.stringify({ error: 'Maximum 6 models allowed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create a TransformStream for SSE
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Send SSE event
    const sendEvent = async (event: StreamEvent) => {
      const data = `data: ${JSON.stringify(event)}\n\n`
      await writer.write(encoder.encode(data))
    }

    // Execute models in parallel with streaming
    executePromptAcrossModels(modelIds, prompt, {
      temperature,
      maxTokens,
      onStream: sendEvent,
    })
      .then(async (results) => {
        // Send final results
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: 'done', results })}\n\n`)
        )
        await writer.close()
      })
      .catch(async (error) => {
        console.error('Error executing models:', error)
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`
          )
        )
        await writer.close()
      })

    // Return SSE stream
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error in run-test route:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
