'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { ModelId, ModelResponse, StreamEvent } from '@/types/bench'
import { ModelSelector, type ViewMode } from '@/components/bench/model-selector'
import { ComparisonGrid } from '@/components/bench/comparison-grid'
import Squares from '@/components/landing/squares'
import { Send, Loader2, Menu, X, MessageSquare } from 'lucide-react'

// Chat history item type
interface ChatHistoryItem {
  id: string
  prompt: string
  responses: ModelResponse[]
  timestamp: Date
}

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
  const [viewMode, setViewMode] = useState<ViewMode>('parallel')
  const [showPerformance, setShowPerformance] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [currentPrompt, setCurrentPrompt] = useState('')

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

    // Fetch chat history from Supabase
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history')
        if (response.ok) {
          const data = await response.json()
          setChatHistory(data.history || [])
        }
      } catch (error) {
        console.error('Failed to fetch history:', error)
      }
    }
    fetchHistory()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleRunTest = async () => {
    if (!prompt.trim() || selectedModels.length === 0 || isLoading) return

    const currentPromptText = prompt.trim()
    setCurrentPrompt(currentPromptText)
    setIsLoading(true)
    setResponses([])
    setStreamingData({})
    setPrompt('')

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const response = await fetch('/api/bench/run-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentPromptText,
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
                // Save to Supabase and update local state
                fetch('/api/history', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    prompt: currentPromptText,
                    responses: event.results
                  })
                })
                  .then(async saveResponse => {
                    if (saveResponse.ok) {
                      return saveResponse.json()
                    }
                    const errorData = await saveResponse.json()
                    console.error('Save history error:', errorData)
                    throw new Error(errorData.error || 'Failed to save')
                  })
                  .then(({ item }) => {
                    setChatHistory(prev => [item, ...prev].slice(0, 15))
                  })
                  .catch(error => {
                    console.error('Failed to save history:', error)
                  })
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
    if (hour < 12) return 'Good Morning,'
    if (hour < 18) return 'Good Afternoon,'
    return 'Good Evening,'
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

      {/* Fixed Left Sidebar - Chat History */}
      <aside className={`fixed left-0 top-0 z-20 flex h-full flex-col border-r border-white/10 bg-black/90 backdrop-blur-sm transition-all duration-300 ${sidebarOpen ? 'w-[320px]' : 'w-[60px]'}`}>
        {/* Header with toggle */}
        <div className={`flex items-center p-4 border-b border-white/10 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen && (
            <Link href="/" className="text-lg font-semibold text-white">
              LLM Bench
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-md p-2 text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
          </button>
        </div>

        {/* Chat History */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto p-4">
            {chatHistory.length > 0 ? (
              <div className="space-y-3">
                {chatHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setResponses(item.responses)
                      setCurrentPrompt(item.prompt)
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition hover:bg-white/10 ${
                      currentPrompt === item.prompt && responses === item.responses
                        ? 'border-white/40 bg-white/10'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <p className="text-sm text-white line-clamp-2 mb-1">
                      {item.prompt}
                    </p>
                    <p className="text-xs text-white/40">
                      {item.responses.length} model{item.responses.length !== 1 ? 's' : ''} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40">Your chat history will appear here</p>
            )}
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
      <main className={`relative z-10 min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-[320px]' : 'ml-[60px]'} ${rightPanelOpen ? 'mr-[420px]' : 'mr-[60px]'}`}>
        {responses.length === 0 && !isLoading ? (
          // Welcome Screen
          <div className="flex min-h-screen flex-col items-center justify-center px-8">
            <div className="w-full max-w-2xl text-center">
              <h1 className="text-4xl font-light tracking-tight text-white mb-2">
                {getGreeting()} {getUserName()}
              </h1>
              <p className="text-white/60 mb-8">Get multiple answer variations from different AI models</p>

              {/* Prompt Input */}
              <div className="relative rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your question or problem..."
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
                  Select models from the right panel to begin
                </p>
              )}
            </div>
          </div>
        ) : (
          // Results View with bottom input
          <div className="flex min-h-screen flex-col">
            {/* Scrollable Results */}
            <div className="flex-1 overflow-y-auto p-8 pb-32">
              <ComparisonGrid responses={displayResponses} isLoading={isLoading} viewMode={viewMode} showPerformance={showPerformance} />
            </div>

            {/* Fixed Bottom Input */}
            <div className="fixed bottom-0 left-0 z-30 bg-gradient-to-t from-black via-black to-transparent pt-8 pb-6 px-8 transition-all duration-300" style={{ marginLeft: sidebarOpen ? '320px' : '60px', right: rightPanelOpen ? '420px' : '60px' }}>
              <div className="max-w-4xl mx-auto">
                <div className="rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value)
                      // Auto-resize textarea
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask another question... (Cmd/Ctrl + Enter to send)"
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
                      className="rounded-lg bg-white p-2 text-black transition hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Fixed Right Sidebar - Model Selector */}
      <aside className={`fixed right-0 top-0 z-20 flex h-full flex-col border-l border-white/10 bg-black/90 backdrop-blur-sm transition-all duration-300 ${rightPanelOpen ? 'w-[420px]' : 'w-[60px]'}`}>
        {/* Header with toggle */}
        <div className={`flex items-center p-4 border-b border-white/10 ${rightPanelOpen ? 'justify-between' : 'justify-center'}`}>
          {rightPanelOpen && (
            <h3 className="text-sm font-semibold text-white">Models</h3>
          )}
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="rounded-md p-2 text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            {rightPanelOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Model Selector */}
        {rightPanelOpen && (
          <div className="flex-1 overflow-y-auto">
            <ModelSelector
              selectedModels={selectedModels}
              onSelectionChange={setSelectedModels}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showPerformance={showPerformance}
              onShowPerformanceChange={setShowPerformance}
            />
          </div>
        )}
      </aside>
    </div>
  )
}
