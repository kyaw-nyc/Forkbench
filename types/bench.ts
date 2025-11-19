/**
 * TypeScript types for LLM Bench functionality
 */

export type ModelId =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'anthropic/claude-3.5-sonnet'
  | 'anthropic/claude-3-opus'
  | 'anthropic/claude-3-haiku'
  | 'deepseek/deepseek-chat'
  | 'google/gemini-2.0-flash-exp:free'
  | 'google/gemini-flash-1.5-8b'
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

export interface BenchTest {
  id: string
  userId: string
  promptText: string
  selectedModels: ModelId[]
  results: ModelResponse[]
  createdAt: Date
  updatedAt: Date
}

export interface StreamEvent {
  type: 'start' | 'chunk' | 'complete' | 'error'
  modelId: ModelId
  data?: string
  error?: string
  metrics?: ModelResponse['metrics']
}

// Database types (matching Supabase schema)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      tests: {
        Row: {
          id: string
          user_id: string
          prompt_text: string
          selected_models: ModelId[]
          results: ModelResponse[] | null
          metrics: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt_text: string
          selected_models: ModelId[]
          results?: ModelResponse[] | null
          metrics?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt_text?: string
          selected_models?: ModelId[]
          results?: ModelResponse[] | null
          metrics?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
