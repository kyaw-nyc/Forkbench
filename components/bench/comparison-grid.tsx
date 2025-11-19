'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import type { ViewMode } from '@/components/bench/model-selector'

// Dynamically import ReactMarkdown with KaTeX support
const MarkdownRenderer = dynamic(
  () => import('./markdown-renderer').then(mod => ({ default: mod.MarkdownRenderer })),
  {
    ssr: false,
    loading: () => <div className="animate-pulse text-white/40">Loading...</div>
  }
)
import type { ModelResponse } from '@/types/bench'
import { getModelConfig } from '@/lib/bench/models'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, DollarSign, Zap, AlertCircle } from 'lucide-react'

interface ComparisonGridProps {
  responses: ModelResponse[]
  isLoading?: boolean
  viewMode?: ViewMode
  showPerformance?: boolean
}

export function ComparisonGrid({ responses, isLoading = false, viewMode = 'parallel', showPerformance = false }: ComparisonGridProps) {
  const [activeTab, setActiveTab] = useState(0)
  if (responses.length === 0 && !isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm">
        <div className="text-center">
          <p className="text-white/60">Enter your question and select models to get answer variations</p>
        </div>
      </div>
    )
  }

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      openai: 'border-white/50',
      anthropic: 'border-orange-500/50',
      deepseek: 'border-green-500/50',
      google: 'border-red-500/50',
      openrouter: 'border-purple-500/50',
    }
    return colors[provider] || 'border-white/20'
  }

  // Render a single model card
  const renderModelCard = (response: ModelResponse, index: number, isTabbed: boolean = false) => {
    const model = getModelConfig(response.modelId)
    const hasError = !!response.error

    // Skip animation for tabbed view
    if (isTabbed) {
      return (
        <div key={response.modelId}>
          <Card className={`border-2 ${getProviderColor(model.provider)} bg-white/5 p-4 backdrop-blur-sm min-h-[400px]`}>
            {/* Model header */}
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                <p className="text-xs text-white/60">{model.description}</p>
              </div>
              <Badge className="bg-white/10 text-white/80 border-white/20">
                {model.provider}
              </Badge>
            </div>

            {/* Response or Error */}
            {hasError ? (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-red-200">Error</div>
                    <div className="text-xs text-red-300/80">{response.error}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-3 max-h-[500px]">
                <div className="prose prose-sm prose-invert max-w-none text-white/90 [&_.katex]:text-white [&_p]:my-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1">
                  {response.response ? (
                    <MarkdownRenderer content={response.response} />
                  ) : (
                    <p>{isLoading ? 'Generating...' : 'No response'}</p>
                  )}
                </div>
              </div>
            )}

            {/* Metrics - only shown when showPerformance is enabled */}
            {showPerformance && !hasError && response.metrics && (
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border border-white/10 bg-white/5 p-2">
                  <div className="flex items-center gap-1.5 text-xs text-white/60">
                    <Clock className="h-3 w-3" />
                    Latency
                  </div>
                  <div className="mt-1 text-sm font-medium text-white">
                    {(response.metrics.latency / 1000).toFixed(2)}s
                  </div>
                </div>
                <div className="rounded-md border border-white/10 bg-white/5 p-2">
                  <div className="flex items-center gap-1.5 text-xs text-white/60">
                    <Zap className="h-3 w-3" />
                    Tokens/sec
                  </div>
                  <div className="mt-1 text-sm font-medium text-white">
                    {response.metrics.tokensPerSecond.toFixed(1)}
                  </div>
                </div>
                <div className="rounded-md border border-white/10 bg-white/5 p-2">
                  <div className="flex items-center gap-1.5 text-xs text-white/60">
                    <DollarSign className="h-3 w-3" />
                    Cost
                  </div>
                  <div className="mt-1 text-sm font-medium text-white">
                    ${response.metrics.cost.toFixed(5)}
                  </div>
                </div>
                <div className="rounded-md border border-white/10 bg-white/5 p-2">
                  <div className="flex items-center gap-1.5 text-xs text-white/60">
                    Tokens
                  </div>
                  <div className="mt-1 text-sm font-medium text-white">
                    {response.metrics.tokensUsed.total}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )
    }

    return (
      <motion.div
        key={response.modelId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card className={`border-2 ${getProviderColor(model.provider)} bg-white/5 p-4 backdrop-blur-sm ${isTabbed ? 'min-h-[400px]' : ''}`}>
          {/* Model header */}
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{model.name}</h3>
              <p className="text-xs text-white/60">{model.description}</p>
            </div>
            <Badge className="bg-white/10 text-white/80 border-white/20">
              {model.provider}
            </Badge>
          </div>

          {/* Response or Error */}
          {hasError ? (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-red-200">Error</div>
                  <div className="text-xs text-red-300/80">{response.error}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`mb-4 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-3 ${isTabbed ? 'max-h-[500px]' : 'max-h-[300px]'}`}>
              <div className="prose prose-sm prose-invert max-w-none text-white/90 [&_.katex]:text-white [&_p]:my-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1">
                {response.response ? (
                  <MarkdownRenderer content={response.response} />
                ) : (
                  <p>{isLoading ? 'Generating...' : 'No response'}</p>
                )}
              </div>
            </div>
          )}

          {/* Metrics - only shown when showPerformance is enabled */}
          {showPerformance && !hasError && response.metrics && (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-white/10 bg-white/5 p-2">
                <div className="flex items-center gap-1.5 text-xs text-white/60">
                  <Clock className="h-3 w-3" />
                  Latency
                </div>
                <div className="mt-1 text-sm font-medium text-white">
                  {(response.metrics.latency / 1000).toFixed(2)}s
                </div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-2">
                <div className="flex items-center gap-1.5 text-xs text-white/60">
                  <Zap className="h-3 w-3" />
                  Tokens/sec
                </div>
                <div className="mt-1 text-sm font-medium text-white">
                  {response.metrics.tokensPerSecond.toFixed(1)}
                </div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-2">
                <div className="flex items-center gap-1.5 text-xs text-white/60">
                  <DollarSign className="h-3 w-3" />
                  Cost
                </div>
                <div className="mt-1 text-sm font-medium text-white">
                  ${response.metrics.cost.toFixed(5)}
                </div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-2">
                <div className="flex items-center gap-1.5 text-xs text-white/60">
                  Tokens
                </div>
                <div className="mt-1 text-sm font-medium text-white">
                  {response.metrics.tokensUsed.total}
                </div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    )
  }

  // Tabbed view
  if (viewMode === 'tabbed') {
    return (
      <div>
        {/* Tab buttons at the top */}
        <div className="mb-4 flex gap-2 flex-wrap">
          {responses.map((response, index) => {
            const model = getModelConfig(response.modelId)
            return (
              <button
                key={response.modelId}
                onClick={() => setActiveTab(index)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === index
                    ? 'bg-white text-black'
                    : 'border border-white/20 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {model.name}
              </button>
            )
          })}
        </div>

        {/* Active tab content */}
        {responses[activeTab] && renderModelCard(responses[activeTab], activeTab, true)}
      </div>
    )
  }

  // Parallel/grid view (default)
  return (
    <div className={`grid gap-4 ${
      responses.length === 1 ? 'grid-cols-1' :
      responses.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
      responses.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
    }`}>
      {responses.map((response, index) => renderModelCard(response, index))}
    </div>
  )
}
