/**
 * Parallel LLM Execution Engine
 * Runs the same prompt across multiple models simultaneously
 */

import type { ModelId, ModelResponse, StreamEvent } from '@/types/bench'
import { calculateCost, getModelConfig } from './models'
import { openai } from '@/lib/api/openai'
import { openrouter } from '@/lib/api/openrouter'

interface ExecutionOptions {
  onStream?: (event: StreamEvent) => void
  temperature?: number
  maxTokens?: number
}

/**
 * Execute a prompt on a single model
 */
async function executeModel(
  modelId: ModelId,
  prompt: string,
  options: ExecutionOptions = {}
): Promise<ModelResponse> {
  const startTime = Date.now()
  const model = getModelConfig(modelId)

  try {
    let response = ''
    let inputTokens = 0
    let outputTokens = 0

    options.onStream?.({ type: 'start', modelId })

    // Select API client based on provider
    const client = model.provider === 'openai' ? openai : openrouter

    const stream = await client.chat.completions.create({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        response += content
        options.onStream?.({ type: 'chunk', modelId, data: content })
      }
      if (chunk.usage) {
        inputTokens = chunk.usage.prompt_tokens
        outputTokens = chunk.usage.completion_tokens
      }
    }

    // Estimate tokens if not provided
    if (!inputTokens) {
      inputTokens = Math.ceil(prompt.length / 4)
      outputTokens = Math.ceil(response.length / 4)
    }

    const latency = Date.now() - startTime
    const result: ModelResponse = {
      modelId,
      response,
      metrics: {
        latency,
        tokensUsed: { input: inputTokens, output: outputTokens, total: inputTokens + outputTokens },
        cost: calculateCost(modelId, inputTokens, outputTokens),
        tokensPerSecond: (outputTokens / latency) * 1000,
      },
      timestamp: new Date(),
    }

    options.onStream?.({ type: 'complete', modelId, metrics: result.metrics })
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    options.onStream?.({ type: 'error', modelId, error: errorMessage })

    return {
      modelId,
      response: '',
      metrics: {
        latency: Date.now() - startTime,
        tokensUsed: { input: 0, output: 0, total: 0 },
        cost: 0,
        tokensPerSecond: 0,
      },
      timestamp: new Date(),
      error: errorMessage,
    }
  }
}

/**
 * Execute a prompt across multiple models in parallel
 */
export async function executePromptAcrossModels(
  modelIds: ModelId[],
  prompt: string,
  options: ExecutionOptions = {}
): Promise<ModelResponse[]> {
  const results = await Promise.all(
    modelIds.map((modelId) => executeModel(modelId, prompt, options))
  )
  return results
}
