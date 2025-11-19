'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Squares from './squares'

export function LandingContent() {
  const router = useRouter()

  const handleGetStarted = () => {
    sessionStorage.removeItem('pendingPrompt')
    router.push('/login')
  }

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-[#0a0a0a] text-white">
      <Squares
        direction="diagonal"
        speed={0.5}
        squareSize={40}
        borderColor="rgba(255,255,255,0.1)"
        hoverFillColor="rgba(255,255,255,0.05)"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-100"
      />

      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col">
        <header className="relative flex items-center justify-between px-8 py-6 lg:px-16">
          <div className="pointer-events-auto flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight text-white">LLM Bench</span>
          </div>
          <nav className="pointer-events-auto flex items-center gap-6">
            <Link
              href="/learn-more"
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              Learn More
            </Link>
            <button
              type="button"
              onClick={handleGetStarted}
              className="rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/15"
            >
              Login
            </button>
          </nav>
        </header>

        <main className="relative flex flex-1 items-center justify-center px-6 pb-16 pt-4 text-center lg:px-10">
          <div className="pointer-events-auto mx-auto flex w-full max-w-4xl flex-col items-center gap-8">
            <h1 className="text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Benchmark LLMs Effortlessly
            </h1>
            <p className="max-w-2xl text-lg text-white/85">
              Launch LLM Bench, compare providers, and get to the right model in minutes.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleGetStarted}
                className="rounded-xl bg-white px-6 py-3 text-base font-semibold text-[#0a0a0a] shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                Get Started
              </button>
              <Link
                href="/learn-more"
                className="rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/20"
              >
                Learn More
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
