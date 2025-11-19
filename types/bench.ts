/**
 * TypeScript types for ForkGrid functionality
 */

export type ModelId =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'anthropic/claude-3.5-sonnet'
  | 'anthropic/claude-3-opus'
  | 'anthropic/claude-3-haiku'
  | 'deepseek/deepseek-chat'
  | 'google/gemini-2.5-flash-preview'
  | 'google/gemini-2.0-flash-001'
  | 'openrouter/sherlock-think-alpha'

export interface ModelConfig {
  id: ModelId
  name: string
  provider: 'openai' | 'anthropic' | 'deepseek' | 'google' | 'openrouter'
  description: string
  color: string // For UI styling
  costPer1kTokens: {
    input: number
    output: number
  }
}

export interface ModelResponse {
  modelId: ModelId
  response: string
  metrics: {
    latency: number // milliseconds
    tokensUsed: {
      input: number
      output: number
      total: number
    }
    cost: number // USD
    tokensPerSecond: number
  }
  timestamp: Date
  error?: string
}

export interface StreamEvent {
  type: 'start' | 'chunk' | 'complete' | 'error'
  modelId: ModelId
  data?: string
  error?: string
  metrics?: ModelResponse['metrics']
}
