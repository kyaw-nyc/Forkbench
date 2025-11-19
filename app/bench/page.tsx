'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { ModelId, ModelResponse, StreamEvent } from '@/types/bench'
import { ModelSelector } from '@/components/bench/model-selector'
import { ComparisonGrid } from '@/components/bench/comparison-grid'
import { MetricsPanel } from '@/components/bench/metrics-panel'
import Squares from '@/components/landing/squares'
import { Send, Loader2, Menu, X } from 'lucide-react'

export default function BenchPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [selectedModels, setSelectedModels] = useState<ModelId[]>([])
  const [responses, setResponses] = useState<ModelResponse[]>([])
  const [streamingData, setStreamingData] = useState<Record<string, string>>({})
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)

  // Check auth
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    // Check initial auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
    })

    // Check for pending prompt from landing page
    const pendingPrompt = sessionStorage.getItem('pendingPrompt')
    if (pendingPrompt) {
      setPrompt(pendingPrompt)
      sessionStorage.removeItem('pendingPrompt')
    }

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleRunTest = async () => {
    if (!prompt.trim() || selectedModels.length === 0 || isLoading) return

    setIsLoading(true)
    setResponses([])
    setStreamingData({})
    setPrompt('')

    try {
      const response = await fetch('/api/bench/run-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          modelIds: selectedModels,
          temperature: 0.7,
          maxTokens: 2000,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start test')
      }

      // Read SSE stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response stream')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const eventData = line.slice(6)
            try {
              const event: StreamEvent | { type: 'done'; results: ModelResponse[] } =
                JSON.parse(eventData)

              if (event.type === 'done' && 'results' in event) {
                setResponses(event.results)
                setStreamingData({})
                setIsLoading(false)
              } else if (event.type === 'chunk') {
                const streamEvent = event as StreamEvent
                setStreamingData((prev) => ({
                  ...prev,
                  [streamEvent.modelId]: (prev[streamEvent.modelId] || '') + (streamEvent.data || ''),
                }))
              } else if (event.type === 'error') {
                console.error('Stream error:', event)
              }
            } catch (e) {
              console.error('Failed to parse SSE event:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error running test:', error)
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isLoading) {
      handleRunTest()
    }
  }

  // Create preview responses while streaming
  const displayResponses: ModelResponse[] = isLoading
    ? selectedModels.map((modelId) => ({
        modelId,
        response: streamingData[modelId] || '',
        metrics: {
          latency: 0,
          tokensUsed: { input: 0, output: 0, total: 0 },
          cost: 0,
          tokensPerSecond: 0,
        },
        timestamp: new Date(),
      }))
    : responses

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  // Get user's first name
  const getUserName = () => {
    if (!user) return ''
    return user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || ''
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  // Check if we should show squares (only on welcome screen)
  const showSquares = responses.length === 0 && !isLoading

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Background Squares - only on welcome screen */}
      {showSquares && (
        <div className="absolute inset-0 z-0">
          <Squares
            direction="diagonal"
            speed={0.45}
            squareSize={46}
            borderColor="rgba(255,255,255,0.14)"
            hoverFillColor="rgba(255,255,255,0.06)"
            className="h-full w-full"
          />
        </div>
      )}

      {/* Fixed Left Sidebar */}
      <aside className={`fixed left-0 top-0 z-20 flex h-full flex-col border-r border-white/10 bg-black/90 backdrop-blur-sm transition-all duration-300 ${sidebarOpen ? 'w-[420px]' : 'w-[60px]'}`}>
        {/* Header with toggle */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {sidebarOpen && (
            <Link href="/" className="text-lg font-semibold text-white">
              LLM Bench
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-md p-2 text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Model Selector */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto p-4">
            <ModelSelector selectedModels={selectedModels} onSelectionChange={setSelectedModels} />
          </div>
        )}

        {/* Bottom Links */}
        {sidebarOpen && (
          <div className="border-t border-white/10 p-4 space-y-2">
            <Link
              href="/"
              className="block text-sm text-white/60 hover:text-white transition"
            >
              ← Back to Home
            </Link>
            <button
              onClick={() => router.push('/logout')}
              className="block text-sm text-white/60 hover:text-white transition"
            >
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`relative z-10 min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-[420px]' : 'ml-[60px]'}`}>
        {responses.length === 0 && !isLoading ? (
          // Welcome Screen
          <div className="flex min-h-screen flex-col items-center justify-center px-8">
            <div className="w-full max-w-2xl text-center">
              <h1 className="text-4xl font-light tracking-tight text-white mb-2">
                {getGreeting()} {getUserName()}
              </h1>
              <p className="text-white/60 mb-8">How can I help you today?</p>

              {/* Prompt Input */}
              <div className="relative rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tell me what you need..."
                  rows={4}
                  className="w-full resize-none bg-transparent text-sm text-white placeholder-white/40 outline-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleRunTest}
                    disabled={!prompt.trim() || selectedModels.length === 0 || isLoading}
                    className="rounded-lg bg-white/10 p-2 text-white transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {selectedModels.length === 0 && (
                <p className="mt-4 text-xs text-white/40">
                  Select models from the sidebar to begin
                </p>
              )}
            </div>
          </div>
        ) : (
          // Results View with bottom input and right panel
          <div className="flex min-h-screen">
            {/* Main Results Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${rightPanelOpen ? 'pr-[320px]' : 'pr-[60px]'}`}>
              {/* Scrollable Results */}
              <div className="flex-1 overflow-y-auto p-8 pb-32">
                <ComparisonGrid responses={displayResponses} isLoading={isLoading} />
              </div>

              {/* Fixed Bottom Input */}
              <div className="fixed bottom-0 left-0 z-30 bg-gradient-to-t from-black via-black to-transparent pt-8 pb-6 px-8 transition-all duration-300" style={{ marginLeft: sidebarOpen ? '420px' : '60px', right: rightPanelOpen ? '320px' : '60px' }}>
                <div className="max-w-4xl mx-auto">
                  <div className="rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
                    <textarea
                      value={prompt}
                      onChange={(e) => {
                        setPrompt(e.target.value)
                        // Auto-resize textarea
                        e.target.style.height = 'auto'
                        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter your prompt here... (Cmd/Ctrl + Enter to run)"
                      rows={1}
                      className="w-full resize-none bg-transparent text-sm text-white placeholder-white/40 outline-none overflow-hidden"
                      style={{ minHeight: '24px', maxHeight: '200px' }}
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-white/60">
                        {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
                      </div>
                      <button
                        onClick={handleRunTest}
                        disabled={!prompt.trim() || selectedModels.length === 0 || isLoading}
                        className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Run Test
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Right Panel - Performance Summary */}
            <aside className={`fixed right-0 top-0 z-20 h-full flex flex-col border-l border-white/10 bg-black backdrop-blur-sm transition-all duration-300 ${rightPanelOpen ? 'w-[320px]' : 'w-[60px]'}`}>
              {/* Header with toggle */}
              <div className={`flex items-center p-4 border-b border-white/10 ${rightPanelOpen ? 'justify-between' : 'justify-center'}`}>
                {rightPanelOpen && (
                  <h3 className="text-sm font-semibold text-white">Performance Summary</h3>
                )}
                <button
                  onClick={() => setRightPanelOpen(!rightPanelOpen)}
                  className="rounded-md p-2 text-white/60 hover:text-white hover:bg-white/10 transition"
                >
                  {rightPanelOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>

              {/* Content */}
              {rightPanelOpen && (
                <div className="flex-1 overflow-y-auto p-4">
                  {responses.length > 0 && !isLoading ? (
                    <MetricsPanel responses={responses} />
                  ) : (
                    <p className="text-sm text-white/40">Run a test to see performance metrics</p>
                  )}
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
