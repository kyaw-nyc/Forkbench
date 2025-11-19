import OpenAI from 'openai'

/**
 * OpenRouter API client for PolyModels
 * Access 100+ AI models through a single API
 * Used by the executor to call Claude, DeepSeek, Gemini, and other models
 * Docs: https://openrouter.ai/docs/quickstart
 */

export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'PolyModels',
  },
})
