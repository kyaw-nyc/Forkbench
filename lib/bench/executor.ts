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

    // Send start event
    options.onStream?.({
      type: 'start',
      modelId,
    })

    // Route to correct provider
    if (model.provider === 'openai') {
      // Use OpenAI direct API
      const stream = await openai.chat.completions.create({
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
          options.onStream?.({
            type: 'chunk',
            modelId,
            data: content,
          })
        }

        // Get usage from the final chunk
        if (chunk.usage) {
          inputTokens = chunk.usage.prompt_tokens
          outputTokens = chunk.usage.completion_tokens
        }
      }

      // If usage wasn't in stream, estimate
      if (!inputTokens) {
        inputTokens = Math.ceil(prompt.length / 4) // Rough estimation
        outputTokens = Math.ceil(response.length / 4)
      }
    } else {
      // Use OpenRouter for all other models (Anthropic, Claude, DeepSeek, Google/Gemini, Sherlock, etc.)
      const stream = await openrouter.chat.completions.create({
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
          options.onStream?.({
            type: 'chunk',
            modelId,
            data: content,
          })
        }

        if (chunk.usage) {
          inputTokens = chunk.usage.prompt_tokens
          outputTokens = chunk.usage.completion_tokens
        }
      }

      if (!inputTokens) {
        inputTokens = Math.ceil(prompt.length / 4)
        outputTokens = Math.ceil(response.length / 4)
      }
    }

    const endTime = Date.now()
    const latency = endTime - startTime
    const tokensPerSecond = (outputTokens / latency) * 1000
    const cost = calculateCost(modelId, inputTokens, outputTokens)

    const result: ModelResponse = {
      modelId,
      response,
      metrics: {
        latency,
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens,
        },
        cost,
        tokensPerSecond,
      },
      timestamp: new Date(),
    }

    // Send complete event
    options.onStream?.({
      type: 'complete',
      modelId,
      metrics: result.metrics,
    })

    return result
  } catch (error) {
    // Send error event
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    options.onStream?.({
      type: 'error',
      modelId,
      error: errorMessage,
    })

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
  // Execute all models in parallel
  const promises = modelIds.map((modelId) => executeModel(modelId, prompt, options))

  // Wait for all to complete
  const results = await Promise.all(promises)

  return results
}

