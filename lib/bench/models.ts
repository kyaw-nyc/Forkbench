/**
 * Model configurations for LLM Bench
 * Defines available models, their providers, and cost structures
 */

import type { ModelConfig, ModelId } from '@/types/bench'

export const AVAILABLE_MODELS: Record<ModelId, ModelConfig> = {
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'OpenAI flagship model - Fast, multimodal',
    color: 'blue',
    costPer1kTokens: {
      input: 0.0025,
      output: 0.01,
    },
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Smaller, faster GPT-4o - Cost-effective',
    color: 'blue',
    costPer1kTokens: {
      input: 0.00015,
      output: 0.0006,
    },
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Previous gen flagship - 128k context',
    color: 'blue',
    costPer1kTokens: {
      input: 0.01,
      output: 0.03,
    },
  },
  'anthropic/claude-3.5-sonnet': {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Anthropic flagship - Best reasoning',
    color: 'purple',
    costPer1kTokens: {
      input: 0.003,
      output: 0.015,
    },
  },
  'anthropic/claude-3-opus': {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Highest quality - Complex tasks',
    color: 'purple',
    costPer1kTokens: {
      input: 0.015,
      output: 0.075,
    },
  },
  'anthropic/claude-3-haiku': {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    description: 'Fastest Claude - Low latency',
    color: 'purple',
    costPer1kTokens: {
      input: 0.00025,
      output: 0.00125,
    },
  },
  'deepseek/deepseek-chat': {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    description: 'Open model - Very affordable',
    color: 'green',
    costPer1kTokens: {
      input: 0.00014,
      output: 0.00028,
    },
  },
  'google/gemini-2.0-flash-exp:free': {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    description: 'Latest Gemini - Free tier',
    color: 'orange',
    costPer1kTokens: {
      input: 0,
      output: 0,
    },
  },
  'google/gemini-flash-1.5-8b': {
    id: 'google/gemini-flash-1.5-8b',
    name: 'Gemini 1.5 Flash 8B',
    provider: 'google',
    description: 'Smaller Gemini - Very affordable',
    color: 'orange',
    costPer1kTokens: {
      input: 0.000075,
      output: 0.0003,
    },
  },
  'openrouter/sherlock-think-alpha': {
    id: 'openrouter/sherlock-think-alpha',
    name: 'Sherlock Think Alpha',
    provider: 'openrouter',
    description: 'Reasoning specialist - Chain-of-thought',
    color: 'red',
    costPer1kTokens: {
      input: 0.002,
      output: 0.008,
    },
  },
}

export function getModelConfig(modelId: ModelId): ModelConfig {
  return AVAILABLE_MODELS[modelId]
}

export function getAllModels(): ModelConfig[] {
  return Object.values(AVAILABLE_MODELS)
}

export function getModelsByProvider(provider: ModelConfig['provider']): ModelConfig[] {
  return Object.values(AVAILABLE_MODELS).filter((model) => model.provider === provider)
}

export function calculateCost(modelId: ModelId, inputTokens: number, outputTokens: number): number {
  const config = getModelConfig(modelId)
  const inputCost = (inputTokens / 1000) * config.costPer1kTokens.input
  const outputCost = (outputTokens / 1000) * config.costPer1kTokens.output
  return inputCost + outputCost
}
