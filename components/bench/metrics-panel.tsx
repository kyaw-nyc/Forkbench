'use client'

import type { ModelResponse } from '@/types/bench'
import { getModelConfig } from '@/lib/bench/models'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, Zap, DollarSign, Clock } from 'lucide-react'

interface MetricsPanelProps {
  responses: ModelResponse[]
}

export function MetricsPanel({ responses }: MetricsPanelProps) {
  if (responses.length === 0) {
    return null
  }

  // Filter out responses with errors
  const validResponses = responses.filter(r => !r.error && r.metrics)

  if (validResponses.length === 0) {
    return null
  }

  // Calculate rankings
  const fastestResponse = [...validResponses].sort((a, b) => a.metrics.latency - b.metrics.latency)[0]
  const cheapestResponse = [...validResponses].sort((a, b) => a.metrics.cost - b.metrics.cost)[0]
  const highestTPS = [...validResponses].sort((a, b) => b.metrics.tokensPerSecond - a.metrics.tokensPerSecond)[0]

  // Calculate totals
  const totalCost = validResponses.reduce((sum, r) => sum + r.metrics.cost, 0)
  const avgLatency = validResponses.reduce((sum, r) => sum + r.metrics.latency, 0) / validResponses.length
  const totalTokens = validResponses.reduce((sum, r) => sum + r.metrics.tokensUsed.total, 0)

  const maxLatency = Math.max(...validResponses.map(r => r.metrics.latency))
  const maxCost = Math.max(...validResponses.map(r => r.metrics.cost))

  return (
    <Card className="border-white/20 bg-white/5 p-6 backdrop-blur-sm">
      <h3 className="mb-4 text-lg font-semibold text-white">Performance Summary</h3>

      {/* Winners */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
          <Zap className="h-5 w-5 text-green-400" />
          <div className="flex-1">
            <div className="text-xs text-white/60">Fastest Response</div>
            <div className="text-sm font-medium text-white">
              {getModelConfig(fastestResponse.modelId).name} - {(fastestResponse.metrics.latency / 1000).toFixed(2)}s
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
          <DollarSign className="h-5 w-5 text-blue-400" />
          <div className="flex-1">
            <div className="text-xs text-white/60">Most Cost-Effective</div>
            <div className="text-sm font-medium text-white">
              {getModelConfig(cheapestResponse.modelId).name} - ${cheapestResponse.metrics.cost.toFixed(5)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-purple-500/30 bg-purple-500/10 p-3">
          <Trophy className="h-5 w-5 text-purple-400" />
          <div className="flex-1">
            <div className="text-xs text-white/60">Highest Tokens/sec</div>
            <div className="text-sm font-medium text-white">
              {getModelConfig(highestTPS.modelId).name} - {highestTPS.metrics.tokensPerSecond.toFixed(1)} t/s
            </div>
          </div>
        </div>
      </div>

      {/* Comparative bars */}
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-sm font-medium text-white">Latency Comparison</div>
          {validResponses.map((response) => {
            const model = getModelConfig(response.modelId)
            const percentage = (response.metrics.latency / maxLatency) * 100

            return (
              <div key={response.modelId} className="mb-2">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-white/70">{model.name}</span>
                  <span className="text-white/60">{(response.metrics.latency / 1000).toFixed(2)}s</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </div>

        <div>
          <div className="mb-2 text-sm font-medium text-white">Cost Comparison</div>
          {validResponses.map((response) => {
            const model = getModelConfig(response.modelId)
            const percentage = (response.metrics.cost / maxCost) * 100

            return (
              <div key={response.modelId} className="mb-2">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-white/70">{model.name}</span>
                  <span className="text-white/60">${response.metrics.cost.toFixed(5)}</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </div>
      </div>

      {/* Totals */}
      <div className="mt-6 grid grid-cols-3 gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
        <div>
          <div className="text-xs text-white/60">Total Cost</div>
          <div className="mt-1 text-sm font-medium text-white">${totalCost.toFixed(5)}</div>
        </div>
        <div>
          <div className="text-xs text-white/60">Avg Latency</div>
          <div className="mt-1 text-sm font-medium text-white">{(avgLatency / 1000).toFixed(2)}s</div>
        </div>
        <div>
          <div className="text-xs text-white/60">Total Tokens</div>
          <div className="mt-1 text-sm font-medium text-white">{totalTokens.toLocaleString()}</div>
        </div>
      </div>
    </Card>
  )
}
