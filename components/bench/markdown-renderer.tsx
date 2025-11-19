'use client'

import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

// Convert various LaTeX delimiters to standard format for remark-math
function preprocessLatex(text: string): string {
  // Convert \( ... \) to $ ... $ (inline math)
  let processed = text.replace(/\\\(([^)]+)\\\)/g, '$$$1$$')

  // Convert \[ ... \] to $$ ... $$ (display math)
  processed = processed.replace(/\\\[([^\]]+)\\\]/g, '$$$$$1$$$$')

  // Convert [ ... ] used as display math (common in some LLM outputs)
  // Only convert if it contains LaTeX commands like \vec, \frac, etc.
  processed = processed.replace(/\[\s*([^\]]*\\(?:vec|frac|hat|sqrt|sin|cos|tan|int|sum|prod|lim|text|left|right)[^\]]*)\s*\]/g, '$$$$$1$$$$')

  return processed
}

interface MarkdownRendererProps {
  content: string
}

// Memoize the markdown renderer to prevent unnecessary re-renders
export const MarkdownRenderer = memo(function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
    >
      {preprocessLatex(content)}
    </ReactMarkdown>
  )
})
