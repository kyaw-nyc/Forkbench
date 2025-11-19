'use client'

import { useState } from 'react'
import type { ModelId, ModelConfig } from '@/types/bench'
import { getAllModels, getModelsByProvider } from '@/lib/bench/models'
import { Check, LayoutGrid, Layers, BarChart3 } from 'lucide-react'

export type ViewMode = 'parallel' | 'tabbed'

interface ModelSelectorProps {
  selectedModels: ModelId[]
  onSelectionChange: (models: ModelId[]) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  showPerformance: boolean
  onShowPerformanceChange: (show: boolean) => void
  maxModels?: number
}

export function ModelSelector({ selectedModels, onSelectionChange, viewMode, onViewModeChange, showPerformance, onShowPerformanceChange, maxModels = 4 }: ModelSelectorProps) {
  const [groupBy, setGroupBy] = useState<'all' | 'provider'>('provider')
  const allModels = getAllModels()

  const toggleModel = (modelId: ModelId) => {
    if (selectedModels.includes(modelId)) {
      onSelectionChange(selectedModels.filter((id) => id !== modelId))
    } else {
      if (selectedModels.length < maxModels) {
        onSelectionChange([...selectedModels, modelId])
      }
    }
  }

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      openai: 'bg-white/20 text-white border-white/50',
      anthropic: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      deepseek: 'bg-green-500/20 text-green-400 border-green-500/30',
      google: 'bg-red-500/20 text-red-400 border-red-500/30',
      openrouter: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    }
    return colors[provider] || 'bg-white/10 text-white/80 border-white/20'
  }

  const modelsByProvider: Record<string, ModelConfig[]> = groupBy === 'provider' ? {
    openai: getModelsByProvider('openai'),
    anthropic: getModelsByProvider('anthropic'),
    deepseek: getModelsByProvider('deepseek'),
    google: getModelsByProvider('google'),
    openrouter: getModelsByProvider('openrouter'),
  } : { all: allModels }

  return (
    <div className="p-6">
      {/* View Mode Toggle */}
      <div className="mb-4">
        <div className="text-xs text-white/60 mb-2">View Mode</div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewModeChange('parallel')}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition flex-1 ${
              viewMode === 'parallel'
                ? 'bg-white text-black'
                : 'border border-white/20 bg-transparent text-white/70 hover:bg-white/10'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Parallel
          </button>
          <button
            onClick={() => onViewModeChange('tabbed')}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition flex-1 ${
              viewMode === 'tabbed'
                ? 'bg-white text-black'
                : 'border border-white/20 bg-transparent text-white/70 hover:bg-white/10'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Tabbed
          </button>
        </div>
      </div>

      {/* Show Performance Toggle */}
      <div className="mb-4">
        <button
          onClick={() => onShowPerformanceChange(!showPerformance)}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition w-full ${
            showPerformance
              ? 'bg-white text-black'
              : 'border border-white/20 bg-transparent text-white/70 hover:bg-white/10'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          {showPerformance ? 'Performance On' : 'Show Performance'}
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Select Models</h3>
        <div className="text-sm text-white/60">
          {selectedModels.length}/{maxModels} selected
        </div>
      </div>

      {/* Group by toggle */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setGroupBy('provider')}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            groupBy === 'provider'
              ? 'bg-white text-black'
              : 'border border-white/20 bg-transparent text-white/70 hover:bg-white/10'
          }`}
        >
          By Provider
        </button>
        <button
          onClick={() => setGroupBy('all')}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            groupBy === 'all'
              ? 'bg-white text-black'
              : 'border border-white/20 bg-transparent text-white/70 hover:bg-white/10'
          }`}
        >
          All Models
        </button>
      </div>

      {/* Model grid */}
      <div className="space-y-4">
        {Object.entries(modelsByProvider).map(([provider, models]) => (
          <div key={provider}>
            {groupBy === 'provider' && (
              <h4 className="mb-2 text-sm font-medium capitalize text-white/80">{provider}</h4>
            )}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {models.map((model) => {
                const isSelected = selectedModels.includes(model.id)
                const isDisabled = !isSelected && selectedModels.length >= maxModels

                return (
                  <button
                    key={model.id}
                    onClick={() => toggleModel(model.id)}
                    disabled={isDisabled}
                    className={`group relative rounded-lg border p-4 text-left transition ${
                      isSelected
                        ? `${getProviderColor(model.provider)} border-2`
                        : isDisabled
                          ? 'border-white/10 bg-white/5 opacity-50 cursor-not-allowed'
                          : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-white">{model.name}</span>
                          {isSelected && (
                            <div className="rounded-full bg-white p-0.5">
                              <Check className="h-3 w-3 text-black" />
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-white/70 leading-relaxed">{model.description}</p>

                      {showPerformance && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="rounded-md border border-white/20 bg-black/30 px-2.5 py-2">
                            <div className="text-[10px] uppercase tracking-wide text-white/40 mb-0.5">Input</div>
                            <div className="text-xs font-semibold text-white">
                              ${model.costPer1kTokens.input.toFixed(4)}
                            </div>
                            <div className="text-[10px] text-white/40">/1k tokens</div>
                          </div>
                          <div className="rounded-md border border-white/20 bg-black/30 px-2.5 py-2">
                            <div className="text-[10px] uppercase tracking-wide text-white/40 mb-0.5">Output</div>
                            <div className="text-xs font-semibold text-white">
                              ${model.costPer1kTokens.output.toFixed(4)}
                            </div>
                            <div className="text-[10px] text-white/40">/1k tokens</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedModels.length === 0 && (
        <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
          Select at least one model to start testing
        </div>
      )}
    </div>
  )
}
