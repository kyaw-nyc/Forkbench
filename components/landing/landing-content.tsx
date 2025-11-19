'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const PixelBlast = dynamic(() => import('@/components/PixelBlast'), {
  ssr: false,
})

export function LandingContent() {
  const router = useRouter()

  const handleGetStarted = () => {
    sessionStorage.removeItem('pendingPrompt')
    router.push('/login')
  }

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-[#0a0a0a] text-white">
      <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#B19EEF"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid={false}
          speed={0.6}
          edgeFade={0.25}
          transparent
          autoPauseOffscreen={false}
        />
      </div>

      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col">
        <header className="relative flex items-center justify-center px-8 py-6 lg:px-16">
          <div className="pointer-events-auto flex w-full max-w-3xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-white">LLM-Bench</span>
            </div>
            <nav className="flex items-center">
              <button
                type="button"
                onClick={handleGetStarted}
                className="cursor-pointer text-sm font-medium text-white/80 transition hover:text-white"
              >
                Login
              </button>
            </nav>
          </div>
        </header>

        <main className="relative flex flex-1 items-center justify-center px-6 pb-16 pt-4 text-center lg:px-10">
          <div className="pointer-events-auto mx-auto flex w-full max-w-4xl flex-col items-center gap-8">
            <h1 className="text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Benchmark LLMs <br></br>Effortlessly
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleGetStarted}
                className="cursor-pointer rounded-full bg-white px-8 py-3 text-base font-semibold text-[#0a0a0a] shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                Get Started
              </button>
              <Link
                href="/learn-more"
                className="rounded-full border border-white/15 bg-white/5 px-8 py-3 text-base font-semibold text-white/80 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10"
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
