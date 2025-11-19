import Link from 'next/link'
import Image from 'next/image'

export default function LearnMorePage() {
  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-[#0a0a0a] text-white">
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="relative flex items-center justify-center px-8 py-6 lg:px-16">
          <div className="flex w-full max-w-6xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-md">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="ForkBench" width={24} height={24} className="invert" />
              <span className="text-base font-semibold tracking-tight text-white">ForkBench</span>
            </Link>
            <nav className="flex items-center">
              <Link
                href="/login"
                className="text-sm font-medium text-white/80 transition hover:text-white"
              >
                Login
              </Link>
            </nav>
          </div>
        </header>

        <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 pb-12 pt-6 lg:px-10">
          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Developer Tools</p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Compare LLMs Side-by-Side
            </h1>
            <p className="max-w-3xl text-base text-white/80">
              Test the same prompt across multiple AI models simultaneously. See quality, cost, and latency in real-time. Make informed decisions about which model to use.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Key Features</h2>
            <ul className="space-y-2 text-sm text-white/85">
              <li>• Side-by-side comparison of up to 4 models at once</li>
              <li>• Real-time streaming responses</li>
              <li>• Transparent cost tracking per request</li>
              <li>• Performance metrics (latency, tokens/sec, cost)</li>
            </ul>
          </section>

          <section id="models" className="space-y-4 border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white">Supported Models</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: 'OpenAI', detail: 'GPT-4o, GPT-4o Mini, GPT-4 Turbo' },
                { title: 'Anthropic', detail: 'Claude 3.5 Sonnet, Opus, Haiku' },
                { title: 'Google & More', detail: 'Gemini, DeepSeek, Sherlock' },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border border-white/15 p-4">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-white/75">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="flow" className="space-y-4 border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white">How It Works</h3>
            <ol className="space-y-3 text-sm text-white/85">
              <li>1) Enter your prompt in the text area</li>
              <li>2) Select 2-4 models you want to compare</li>
              <li>3) Click "Run Test" and watch responses stream in real-time</li>
              <li>4) Review metrics to find the best model for your use case</li>
            </ol>
          </section>

          <section className="space-y-3 border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white">Metrics Tracked</h3>
            <ul className="space-y-2 text-sm text-white/85">
              <li>• Response latency (how fast each model responds)</li>
              <li>• Token usage (input + output tokens)</li>
              <li>• Cost per request (based on actual usage)</li>
              <li>• Tokens per second (generation speed)</li>
            </ul>
          </section>

          <section id="get-started" className="space-y-4 border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white">Get Started</h3>
            <p className="text-sm text-white/80">
              Sign up for a free account and add your API keys. You'll need an OpenAI key and an OpenRouter key to access all models.
            </p>
            <p className="text-sm text-white/75">
              OpenRouter gives you access to Claude, Gemini, DeepSeek, and more through a single API.
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}
