'use client'

import { useState, useEffect, useRef, useLayoutEffect } from 'react'

function RSVPDemo() {
  const words = "The ancient library stood silent in the moonlight. Sarah pushed open the heavy oak door and stepped inside. Dust particles floated through beams of silver light streaming from tall windows. She had been searching for this place for three years.".split(' ')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [wpm, setWpm] = useState(350)
  const [focalWidth, setFocalWidth] = useState(0)
  const focalRef = useRef(null)

  const calculateORP = (word) => {
    const len = word.length
    if (len <= 1) return 0
    if (len <= 3) return 1
    if (len <= 5) return 1
    if (len <= 7) return 2
    if (len <= 9) return 2
    if (len <= 11) return 3
    if (len <= 13) return 3
    return Math.floor(len * 0.3)
  }

  useEffect(() => {
    if (!isPlaying) return
    const ms = (60 / wpm) * 1000
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= words.length - 1) return 0
        return prev + 1
      })
    }, ms)
    return () => clearInterval(interval)
  }, [isPlaying, wpm, words.length])

  useEffect(() => {
    if (focalRef.current) {
      setFocalWidth(focalRef.current.getBoundingClientRect().width)
    }
  }, [currentIndex])

  const word = words[currentIndex]
  const orp = calculateORP(word)
  const before = word.slice(0, orp)
  const focal = word[orp] || ''
  const after = word.slice(orp + 1)
  const halfFocal = focalWidth / 2

  const fontStyle = { fontFamily: '"SF Pro Display", system-ui, sans-serif' }

  return (
    <div className="relative">
      <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-700/40 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/20">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <div className="text-emerald-400 text-sm font-medium tracking-wide">{wpm} WPM</div>
        </div>

        <div className="py-16 px-8 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-px h-24 bg-gradient-to-b from-transparent via-slate-700/30 to-transparent"></div>
          <div className="relative h-16 text-4xl md:text-5xl font-light tracking-tight" style={fontStyle}>
            <span
              className="absolute text-slate-400"
              style={{ right: `calc(50% + ${halfFocal}px)`, top: '50%', transform: 'translateY(-50%)', whiteSpace: 'nowrap' }}
            >
              {before}
            </span>
            <span
              ref={focalRef}
              className="absolute text-emerald-400 font-medium"
              style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap' }}
            >
              {focal}
              <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full opacity-60"></div>
            </span>
            <span
              className="absolute text-slate-400"
              style={{ left: `calc(50% + ${halfFocal}px)`, top: '50%', transform: 'translateY(-50%)', whiteSpace: 'nowrap' }}
            >
              {after}
            </span>
          </div>
        </div>

        <div className="h-1 bg-slate-800/50 mx-4 mb-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-200"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-3 pb-5">
          {[250, 350, 500, 700].map(speed => (
            <button
              key={speed}
              onClick={() => setWpm(speed)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${wpm === speed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {speed}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function AnimatedNumber({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const startTime = Date.now()
          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration, hasAnimated])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-800/8 rounded-full blur-3xl"></div>
      </div>

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-light" style={{ fontFamily: '"SF Pro Display", system-ui, sans-serif' }}>
            Speed<span className="text-emerald-400 font-medium">Read</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-slate-400 hover:text-slate-200 text-sm font-light transition-colors hidden md:block">Features</a>
            <a href="#how-it-works" className="text-slate-400 hover:text-slate-200 text-sm font-light transition-colors hidden md:block">How It Works</a>
            <a href="#pricing" className="text-slate-400 hover:text-slate-200 text-sm font-light transition-colors hidden md:block">Pricing</a>
            <a href="/app" className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-lg font-medium text-white text-sm shadow-lg hover:shadow-emerald-500/25 transition-all duration-200">
              Start Reading Free
            </a>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 text-xs font-medium tracking-wide uppercase">Backed by reading science</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light leading-tight" style={{ fontFamily: '"SF Pro Display", system-ui, sans-serif' }}>
                200 pages.
                <br />
                <span className="text-emerald-400 font-medium">1 hour.</span>
                <br />
                <span className="text-slate-500">Let's go.</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed max-w-lg">
                SpeedRead uses RSVP technology to eliminate eye movement overhead, letting your brain process text at
                <span className="text-slate-200 font-medium"> 2-3x your normal reading speed</span>. Upload your PDFs, DOCX files, or paste any text.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <a href="/app" className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-xl font-medium text-white text-lg shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105">
                  Start Reading Free
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <div className="text-slate-500 text-sm font-light pt-3">
                  No credit card required
                </div>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {['bg-emerald-600', 'bg-teal-600', 'bg-cyan-600', 'bg-emerald-700'].map((bg, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-slate-950 flex items-center justify-center text-xs font-medium text-white`}>
                      {['S', 'M', 'L', 'K'][i]}
                    </div>
                  ))}
                </div>
                <p className="text-slate-500 text-sm font-light">
                  Used by students at <span className="text-slate-300">UWA</span>, <span className="text-slate-300">Melbourne</span>, <span className="text-slate-300">Sydney</span>
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl blur-2xl"></div>
              <RSVPDemo />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800/50 bg-slate-900/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 3, suffix: 'x', label: 'Faster reading speed' },
              { value: 900, suffix: '+', label: 'Words per minute possible' },
              { value: 100, suffix: '%', label: 'Free to start' },
              { value: 30, suffix: 's', label: 'To upload & start reading' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-light text-emerald-400 mb-1" style={{ fontFamily: '"SF Pro Display", system-ui, sans-serif' }}>
                  <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-slate-500 text-sm font-light">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-light mb-6 leading-tight" style={{ fontFamily: '"SF Pro Display", system-ui, sans-serif' }}>
            You have <span className="text-emerald-400 font-medium">3 chapters</span> due tomorrow.
            <br />
            <span className="text-slate-500">Sound familiar?</span>
          </h2>
          <p className="text-lg text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
            The average university student spends 17 hours per week on assigned readings. Law students? Over 25. Your eyes waste time jumping between words, re-reading lines, losing focus. RSVP eliminates all of that by presenting words exactly where your brain expects them.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="py-24 md:py-32 bg-slate-900/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light mb-4" style={{ fontFamily: '"SF Pro Display", system-ui, sans-serif' }}>
              Three steps to <span className="text-emerald-400 font-medium">faster reading</span>
            </h2>
            <p className="text-slate-400 font-light max-w-lg mx-auto">No training required. No learning curve. Just upload and read.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload your document',
                description: 'Drop a PDF, DOCX, or TXT file. Or paste text directly. Your document is parsed and ready in seconds.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Set your speed',
                description: 'Start at 300 WPM and work up. Speed ramp gradually increases pace as you settle in. Adjust font size to your preference.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Read & retain',
                description: 'Words appear at the optimal recognition point. Your brain focuses on understanding, not scanning. Progress auto-saves.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 hover:border-emerald-500/20 rounded-2xl p-8 transition-all duration-300 hover:transform hover:scale-105">
                <div className="absolute -top-4 -left-2 text-6xl font-light text-slate-800/50 select-none" style={{ fontFamily: '"SF Pro Display", system-ui, sans-serif' }}>
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-5 group-hover:bg-emerald-500/20 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-medium text-slate-200 mb-3">{item.title}</h3>
                  <p className="text-slate-400 font-light leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light mb-4" style={{ fontFamily: '"SF Pro Display", system-ui, sans-serif' }}>
              Built for <span className="text-emerald-400 font-medium">serious students</span>
            </h2>
            <p className="text-slate-400 font-light max-w-lg mx-auto">Every feature designed around how students actually study.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Optimal Recognition Point', description: 'Each word is positioned so the key letter sits at your focal point. No eye movement, just pure comprehension.', icon: '◎' },
              { title: 'PDF & DOCX Support', description: 'Upload lecture slides, journal articles, textbook chapters. Text is extracted automatically.', icon: '📄' },
              { title: 'Speed Ramp', description: 'Start slow, gradually accelerate. Your brain adapts naturally without the jarring jump to high speeds.', icon: '⚡' },
              { title: 'Document Library', description: 'Save documents to your cloud library. Resume reading exactly where you left off across any device.', icon: '📚' },
              { title: 'Progress Tracking', description: 'Auto-saves your position every 10 seconds. See completion percentage and time remaining.', icon: '📊' },
              { title: 'Keyboard Shortcuts', description: 'Space to play, arrows to navigate, R to restart. Full control without touching the mouse.', icon: '⌨️' },
            ].map((feature, i) => (
              <div key={i} className="group bg-slate-900/30 border border-slate-800/40 hover:border-emerald-500/20 rounded-xl p-6 transition-all duration-300">
                <div className="text-2xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-medium text-slate-200 mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm font-light leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-slate-900/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light mb-4" style={{ fontFamily: '"SF Pro Display", system-ui, sans-serif' }}>
              Perfect for <span className="text-emerald-400 font-medium">your field</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { field: 'Law', description: 'Case briefs, legislation, journal articles. Cut through dense legal prose at 400+ WPM.', reading: '25+ hrs/week of reading', icon: '⚖️' },
              { field: 'Medicine', description: 'Research papers, clinical guidelines, pharmacology texts. More time for practice, less for reading.', reading: '20+ hrs/week of reading', icon: '🩺' },
              { field: 'Business', description: 'Case studies, market reports, financial analyses. Stay on top of the reading without falling behind.', reading: '15+ hrs/week of reading', icon: '📈' },
              { field: 'Humanities', description: 'Literature reviews, critical theory, historical texts. Process more sources for better essays.', reading: '18+ hrs/week of reading', icon: '📖' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800/40 rounded-xl p-6 hover:border-emerald-500/20 transition-all duration-300">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-medium text-slate-200 mb-1">{item.field}</h3>
                <p className="text-emerald-400 text-xs font-medium mb-3">{item.reading}</p>
                <p className="text-slate-400 text-sm font-light leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light mb-4" style={{ fontFamily: '"SF Pro Display", system-ui, sans-serif' }}>
              Start free. <span className="text-emerald-400 font-medium">Upgrade when ready.</span>
            </h2>
            <p className="text-slate-400 font-light">No tricks. No time limits. Free tier is genuinely useful.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8">
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Free</div>
              <div className="text-4xl font-light text-slate-200 mb-1" style={{ fontFamily: '"SF Pro Display", system-ui, sans-serif' }}>$0</div>
              <div className="text-slate-500 text-sm font-light mb-8">Forever</div>
              <ul className="space-y-3 mb-8">
                {[
                  'RSVP reader with all speed controls',
                  'Paste text directly',
                  'TXT file upload',
                  'Up to 5,000 words per document',
                  'Basic keyboard shortcuts',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <svg className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-300 font-light">{item}</span>
                  </li>
                ))}
              </ul>
              <a href="/app" className="block w-full py-3 text-center bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-sm font-medium text-slate-300 transition-all duration-200">
                Get Started
              </a>
            </div>

            <div className="relative bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-8 shadow-lg shadow-emerald-900/10">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full text-xs font-medium text-white">
                Most Popular
              </div>
              <div className="text-sm font-medium text-emerald-400 uppercase tracking-wider mb-2">Pro</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-light text-slate-200" style={{ fontFamily: '"SF Pro Display", system-ui, sans-serif' }}>$8</span>
                <span className="text-slate-400 text-sm font-light">/month</span>
              </div>
              <div className="text-slate-500 text-sm font-light mb-8">or $60/year (save 37%)</div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Free',
                  'PDF & DOCX upload',
                  'Unlimited document length',
                  'Cloud document library',
                  'Progress tracking & auto-save',
                  'Reading analytics dashboard',
                  'Offline mode',
                  'Custom themes & fonts',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-300 font-light">{item}</span>
                  </li>
                ))}
              </ul>
              <a href="/app" className="block w-full py-3 text-center bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-xl text-sm font-medium text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-200">
                Start Free Trial
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 to-transparent pointer-events-none"></div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-light mb-6 leading-tight" style={{ fontFamily: '"SF Pro Display", system-ui, sans-serif' }}>
            Stop spending <span className="text-emerald-400 font-medium">4 hours</span> on readings.
            <br />
            Finish in <span className="text-emerald-400 font-medium">1</span>.
          </h2>
          <p className="text-lg text-slate-400 font-light mb-10 max-w-lg mx-auto">
            Join thousands of students who read smarter, not slower. Free forever with no strings attached.
          </p>
          <a href="/app" className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-xl font-medium text-white text-lg shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105">
            Start Speed Reading Now
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>

      <footer className="border-t border-slate-800/50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-xl font-light" style={{ fontFamily: '"SF Pro Display", system-ui, sans-serif' }}>
              Speed<span className="text-emerald-400 font-medium">Read</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-slate-500 font-light">
              <a href="#features" className="hover:text-slate-300 transition-colors">Features</a>
              <a href="#pricing" className="hover:text-slate-300 transition-colors">Pricing</a>
              <a href="mailto:support@speedread.app" className="hover:text-slate-300 transition-colors">Contact</a>
            </div>
            <div className="text-sm text-slate-600 font-light">
              © 2026 SpeedRead. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}