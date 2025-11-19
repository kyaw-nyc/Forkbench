/**
 * OpenAI API client for PolyModels
 * Used by the executor to call GPT models directly
 */

import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})
