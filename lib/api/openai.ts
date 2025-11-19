/**
 * OpenAI API client for ForkBench
 * Used by the executor to call GPT models directly
 */

import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})
