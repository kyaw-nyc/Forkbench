# ForkGrid - Side-by-Side Model Comparison Tool

A developer-focused platform for testing and comparing multiple Large Language Models in real-time. Run the same prompt across GPT-4, Claude, DeepSeek, and more—see response quality, track costs, and measure performance metrics side-by-side.

## Features

- **Side-by-Side Comparison** - Test up to 4 models simultaneously with one prompt
- **Real-time Streaming** - Watch responses generate live as models think
- **Performance Metrics** - Track latency, tokens/sec, cost, and token usage
- **Cost Transparency** - See exact costs per request for each model
- **Multi-Provider Support** - OpenAI, Anthropic, DeepSeek, Google, and OpenRouter
- **Test History** - Save and review past comparisons (coming soon)
- **Beautiful UI** - Glassmorphic design with smooth animations

## Supported Models

### OpenAI
- GPT-4o
- GPT-4o Mini
- GPT-4 Turbo

### Anthropic
- Claude 3.5 Sonnet
- Claude 3 Opus
- Claude 3 Haiku

### DeepSeek
- DeepSeek Chat

### Google (via OpenRouter)
- Gemini 2.0 Flash (free tier)
- Gemini 1.5 Flash 8B

### OpenRouter
- Sherlock Think Alpha (reasoning specialist)

## How It Works

```
┌─────────────────────────────────────────────────┐
│  1. User enters a prompt                        │
│  2. Selects 2-4 models to test                  │
│  3. Clicks "Run Test"                           │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  Parallel Execution Engine                      │
│  • Calls all models simultaneously              │
│  • Streams responses via Server-Sent Events     │
│  • Tracks metrics (time, tokens, cost)          │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  Comparison Grid                                │
│  • Side-by-side response display                │
│  • Individual model metrics                     │
│  • Performance summary with rankings            │
└─────────────────────────────────────────────────┘
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL + Auth)
- **AI APIs**:
  - OpenAI SDK (direct API)
  - OpenRouter SDK (multi-model access)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **UI Components**: Radix UI
- **State**: Zustand

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/productscout.git
cd productscout
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Add your API keys:

```env
# Required
OPENAI_API_KEY=your_openai_key
OPENROUTER_API_KEY=your_openrouter_key

# Supabase (for auth and history)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up Supabase database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL commands in `supabase/schema.sql` in your Supabase SQL editor
3. This creates:
   - `profiles` table (user data)
   - `tests` table (test history)
   - Row Level Security policies

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Keys

### OpenAI API Key
- Get it from: https://platform.openai.com/api-keys
- Used for: GPT-4o, GPT-4o Mini, GPT-4 Turbo
- Cost: Pay per token used

### OpenRouter API Key
- Get it from: https://openrouter.ai/keys
- Used for: Claude, DeepSeek, Gemini, Sherlock
- Cost: Pay per token used (varies by model, some models are free)
- Benefit: Single API for multiple providers including Gemini

## Project Structure

```
├── app/
│   ├── bench/              # Main testing interface
│   ├── api/bench/          # API routes for test execution
│   ├── login/              # Authentication pages
│   └── page.tsx            # Landing page
├── components/
│   ├── bench/              # Bench-specific components
│   │   ├── model-selector.tsx
│   │   ├── comparison-grid.tsx
│   │   └── metrics-panel.tsx
│   ├── ui/                 # Reusable UI components
│   ├── landing/            # Landing page components
│   └── auth/               # Auth components
├── lib/
│   ├── bench/              # Core bench logic
│   │   ├── models.ts       # Model configurations
│   │   └── executor.ts     # Parallel execution engine
│   ├── api/                # API client wrappers
│   └── supabase/           # Database client
└── types/                  # TypeScript type definitions
```

## Performance Optimizations

- **Parallel Execution** - All models run simultaneously
- **Streaming Responses** - Server-Sent Events for real-time updates
- **Token Limits** - Configurable max tokens (default: 2000)
- **Temperature Control** - Adjustable per request (default: 0.7)
- **Cost Calculation** - Accurate pricing based on actual token usage

## Cost Transparency

All costs are calculated in real-time based on:
- Input tokens (from your prompt)
- Output tokens (from model response)
- Model-specific pricing per 1k tokens

Example costs (approximate):
- GPT-4o: $0.0025/1k input, $0.01/1k output
- Claude 3.5 Sonnet: $0.003/1k input, $0.015/1k output
- DeepSeek Chat: $0.00014/1k input, $0.00028/1k output

## Use Cases

- **Model Selection** - Compare models before choosing one for production
- **Quality Evaluation** - See which model handles specific tasks best
- **Cost Optimization** - Find the most cost-effective model for your use case
- **Latency Testing** - Identify fastest models for time-sensitive applications
- **Prompt Engineering** - Test prompt variations across different models
- **Developer Research** - Explore capabilities of different AI providers

## Roadmap

- [ ] Export test results as CSV/JSON
- [ ] Test suite management (save collections of prompts)
- [ ] Benchmark leaderboards
- [ ] Custom model configurations
- [ ] Response quality scoring
- [ ] A/B testing framework
- [ ] Cost analytics dashboard
- [ ] Public test sharing
- [ ] API access for programmatic testing

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org)
- [OpenAI](https://openai.com)
- [OpenRouter](https://openrouter.ai)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
