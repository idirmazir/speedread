'use client'

import { useState, useEffect, useRef } from 'react'

// ─── RSVP Demo ─────────────────────────────────────────────
function RSVPDemo() {
  const text = "The ancient library stood silent in the moonlight. Sarah pushed open the heavy oak door and stepped inside. Dust particles floated through beams of silver light streaming from tall windows. She had been searching for this place for three years."
  const words = text.split(' ')
  const [idx, setIdx] = useState(0)
  const [speed, setSpeed] = useState(350)

  const orp = (w) => { const l = w.length; if (l <= 2) return 0; if (l <= 5) return 1; if (l <= 9) return 2; if (l <= 13) return 3; return Math.floor(l * 0.3) }

  useEffect(() => {
    const iv = setInterval(() => setIdx(p => p >= words.length - 1 ? 0 : p + 1), (60 / speed) * 1000)
    return () => clearInterval(iv)
  }, [speed, words.length])

  const w = words[idx], o = orp(w), bef = w.slice(0, o), foc = w[o] || '', aft = w.slice(o + 1)

  return (
    <div className="relative">
      <div className="absolute -inset-3 bg-emerald-500/[0.03] rounded-3xl blur-2xl" />
      <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: '#0a0a0a', border: '1px solid #262626' }}>
        {/* Window bar */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
          <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" /><div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" /><div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" /></div>
          <div className="text-emerald-400 text-[11px] font-semibold tabular-nums tracking-wide">{speed} WPM</div>
        </div>
        {/* Word display */}
        <div className="flex items-center justify-center py-14 px-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-20" style={{ background: 'linear-gradient(transparent, rgba(255,255,255,0.06), transparent)' }} />
          <div className="text-4xl md:text-5xl font-light tracking-tight select-none" style={{ fontFamily: '"SF Pro Display", system-ui, sans-serif', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
            <span className="text-[#737373]" style={{ textAlign: 'right' }}>{bef}</span>
            <span className="text-emerald-400 font-semibold relative text-center px-[1px]">{foc}<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-emerald-400 rounded-full opacity-40" /></span>
            <span className="text-[#737373]" style={{ textAlign: 'left' }}>{aft}</span>
          </div>
        </div>
        {/* Progress */}
        <div className="h-[2px] mx-4 mb-4" style={{ backgroundColor: '#1a1a1a' }}><div className="h-full bg-emerald-500/60 rounded-full transition-all duration-150" style={{ width: `${((idx + 1) / words.length) * 100}%` }} /></div>
        {/* Speed buttons */}
        <div className="flex items-center justify-center gap-2 pb-4">
          {[250, 350, 500, 700].map(s => (
            <button key={s} onClick={() => setSpeed(s)} className="px-3 py-1 rounded-full text-[11px] font-medium transition-all"
              style={{ backgroundColor: speed === s ? 'rgba(52,211,153,0.12)' : 'transparent', color: speed === s ? '#34d399' : '#525252', border: speed === s ? '1px solid rgba(52,211,153,0.2)' : '1px solid transparent' }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Animated Counter ──────────────────────────────────────
function Counter({ target, suffix = '' }) {
  const [n, setN] = useState(0)
  const [go, setGo] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !go) { setGo(true); const s = Date.now(); const a = () => { const p = Math.min((Date.now() - s) / 1800, 1); setN(Math.floor((1 - Math.pow(1 - p, 3)) * target)); if (p < 1) requestAnimationFrame(a) }; requestAnimationFrame(a) } }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target, go])
  return <span ref={ref}>{n}{suffix}</span>
}

// ═══════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════
export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h) }, [])

  const font = '"SF Pro Display", -apple-system, system-ui, sans-serif'

  return (
    <div className="min-h-screen text-[#e4e4e7] overflow-x-hidden" style={{ backgroundColor: '#09090b', fontFamily: font }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px]" style={{ backgroundColor: 'rgba(52,211,153,0.04)' }} />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full blur-[150px]" style={{ backgroundColor: 'rgba(52,211,153,0.03)' }} />
      </div>

      {/* ─── Nav ─────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 40 ? 'backdrop-blur-xl' : ''}`} style={{ borderBottom: scrollY > 40 ? '1px solid #27272a' : '1px solid transparent', backgroundColor: scrollY > 40 ? 'rgba(9,9,11,0.85)' : 'transparent' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-[22px] tracking-tight"><span className="font-light">Speed</span><span className="text-emerald-400 font-semibold">Read</span></div>
          <div className="flex items-center gap-5">
            <a href="#features" className="text-[#71717a] hover:text-[#e4e4e7] text-[13px] transition-colors hidden md:block">Features</a>
            <a href="#how" className="text-[#71717a] hover:text-[#e4e4e7] text-[13px] transition-colors hidden md:block">How It Works</a>
            <a href="#pricing" className="text-[#71717a] hover:text-[#e4e4e7] text-[13px] transition-colors hidden md:block">Pricing</a>
            <a href="/app" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-lg font-semibold text-[13px] text-black shadow-lg transition-all hover:scale-[1.02]">Start Free</a>
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-[10px] font-semibold tracking-[0.12em] uppercase">Backed by reading science</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-[68px] font-light leading-[1.08] tracking-tight">
                200 pages.<br />
                <span className="text-emerald-400 font-semibold">1 hour.</span><br />
                <span className="text-[#52525b]">Let's go.</span>
              </h1>
              <p className="text-lg text-[#71717a] font-light leading-relaxed max-w-md">
                RSVP technology eliminates eye movement overhead. Your brain processes text at <span className="text-[#e4e4e7] font-medium">2–3× normal speed</span>. Upload PDFs, DOCX files, or paste text.
              </p>
              <div className="flex items-center gap-4">
                <a href="/app" className="group px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 rounded-xl font-semibold text-[15px] text-black shadow-xl hover:shadow-emerald-500/20 transition-all hover:scale-[1.02]">
                  Start Reading Free <span className="inline-block ml-1 group-hover:translate-x-0.5 transition-transform">→</span>
                </a>
                <span className="text-[#52525b] text-[12px]">No credit card</span>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-1.5">
                  {['#10b981', '#059669', '#047857', '#065f46'].map((c, i) => (
                    <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white" style={{ backgroundColor: c, border: '2px solid #09090b' }}>{['S', 'M', 'L', 'K'][i]}</div>
                  ))}
                </div>
                <p className="text-[#52525b] text-[12px]">Used at <span className="text-[#a1a1aa]">UWA</span>, <span className="text-[#a1a1aa]">Perth</span>, <span className="text-[#a1a1aa]">Western Australia</span></p>
              </div>
            </div>
            <RSVPDemo />
          </div>
        </div>
      </section>

      {/* ─── Stats ───────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid #27272a', borderBottom: '1px solid #27272a', backgroundColor: 'rgba(24,24,27,0.3)' }}>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[{ v: 3, s: '×', l: 'Faster reading' }, { v: 900, s: '+', l: 'WPM possible' }, { v: 100, s: '%', l: 'Free to start' }, { v: 30, s: 's', l: 'To start reading' }].map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-light text-emerald-400 mb-0.5"><Counter target={s.v} suffix={s.s} /></div>
                <div className="text-[11px] text-[#52525b]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pain Point ──────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-[44px] font-light leading-tight tracking-tight mb-5">
            You have <span className="text-emerald-400 font-semibold">3 chapters</span> due tomorrow.<br />
            <span className="text-[#52525b]">Sound familiar?</span>
          </h2>
          <p className="text-[15px] text-[#71717a] font-light leading-relaxed max-w-xl mx-auto">
            The average student spends 17 hours per week on readings. Law students? Over 25. Your eyes waste time jumping between words, re-reading lines, losing focus. RSVP eliminates all of that.
          </p>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────── */}
      <section id="how" className="py-20 md:py-28" style={{ backgroundColor: 'rgba(24,24,27,0.2)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-3">Three steps to <span className="text-emerald-400 font-semibold">faster reading</span></h2>
            <p className="text-[14px] text-[#71717a] font-light">No training. No learning curve. Upload and read.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { n: '01', title: 'Upload your document', desc: 'Drop a PDF, DOCX, or TXT file. Or paste text. Ready in seconds.', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /> },
              { n: '02', title: 'Set your speed', desc: 'Start at 300 WPM and ramp up. Adjust font size and speed ramp to your preference.', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /> },
              { n: '03', title: 'Read & retain', desc: 'Words appear at the optimal recognition point. Focus on understanding, not scanning.', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
            ].map((item, i) => (
              <div key={i} className="group relative rounded-xl p-7 transition-all duration-300 hover:scale-[1.02]" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
                <div className="absolute -top-3 -left-1 text-[48px] font-light select-none" style={{ color: '#27272a' }}>{item.n}</div>
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#e4e4e7] mb-2">{item.title}</h3>
                  <p className="text-[13px] text-[#71717a] font-light leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────── */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-3">Built for <span className="text-emerald-400 font-semibold">serious students</span></h2>
            <p className="text-[14px] text-[#71717a] font-light">Every feature designed around how students actually study.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { t: 'Optimal Recognition Point', d: 'Each word positioned so the key letter sits at your focal point. No eye movement needed.', i: '◎' },
              { t: 'PDF & DOCX Support', d: 'Upload lecture slides, journal articles, textbook chapters. Extracted automatically.', i: '📄' },
              { t: 'Speed Ramp', d: 'Start slow, gradually accelerate. Your brain adapts naturally.', i: '⚡' },
              { t: 'Document Library', d: 'Save to your cloud library. Resume across any device.', i: '📚' },
              { t: 'Progress Tracking', d: 'Auto-saves every 10 seconds. See completion and time remaining.', i: '📊' },
              { t: 'Keyboard Shortcuts', d: 'Space to play, arrows to navigate, R to restart. Full keyboard control.', i: '⌨️' },
            ].map((f, i) => (
              <div key={i} className="rounded-xl p-5 transition-all duration-200 hover:scale-[1.01]" style={{ backgroundColor: 'rgba(24,24,27,0.4)', border: '1px solid #27272a' }}>
                <div className="text-xl mb-3">{f.i}</div>
                <h3 className="text-[14px] font-semibold text-[#e4e4e7] mb-1.5">{f.t}</h3>
                <p className="text-[12px] text-[#71717a] font-light leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Use Cases ───────────────────────────────────── */}
      <section className="py-20 md:py-28" style={{ backgroundColor: 'rgba(24,24,27,0.2)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-3">Perfect for <span className="text-emerald-400 font-semibold">your field</span></h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { f: 'Law', d: 'Case briefs, legislation, journal articles. Cut through dense legal prose.', h: '25+ hrs/week', i: '⚖️' },
              { f: 'Medicine', d: 'Research papers, clinical guidelines, pharmacology texts.', h: '20+ hrs/week', i: '🩺' },
              { f: 'Business', d: 'Case studies, market reports, financial analyses.', h: '15+ hrs/week', i: '📈' },
              { f: 'Humanities', d: 'Literature reviews, critical theory, historical texts.', h: '18+ hrs/week', i: '📖' },
            ].map((x, i) => (
              <div key={i} className="rounded-xl p-5 transition-all duration-200 hover:scale-[1.01]" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
                <div className="text-2xl mb-2.5">{x.i}</div>
                <h3 className="text-[14px] font-semibold text-[#e4e4e7] mb-0.5">{x.f}</h3>
                <p className="text-emerald-400 text-[10px] font-semibold mb-2">{x.h} reading</p>
                <p className="text-[12px] text-[#71717a] font-light leading-relaxed">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─────────────────────────────────────── */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-3">Start free. <span className="text-emerald-400 font-semibold">Upgrade when ready.</span></h2>
            <p className="text-[14px] text-[#71717a] font-light">No tricks. Free tier is genuinely useful.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Free */}
            <div className="rounded-xl p-7" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
              <div className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#52525b] mb-1.5">Free</div>
              <div className="text-3xl font-light text-[#e4e4e7] mb-0.5">$0</div>
              <div className="text-[11px] text-[#52525b] mb-6">Forever</div>
              <div className="space-y-2.5 mb-6">
                {['RSVP reader with all controls', 'Paste text directly', 'TXT file upload', 'Up to 5,000 words', 'Keyboard shortcuts'].map((x, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[12px]">
                    <svg className="w-4 h-4 text-[#52525b] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-[#a1a1aa] font-light">{x}</span>
                  </div>
                ))}
              </div>
              <a href="/app" className="block w-full py-2.5 text-center rounded-lg text-[12px] font-semibold transition-all hover:opacity-80" style={{ backgroundColor: '#27272a', color: '#a1a1aa', border: '1px solid #3f3f46' }}>Get Started</a>
            </div>
            {/* Pro */}
            <div className="relative rounded-xl p-7 shadow-lg" style={{ backgroundColor: '#18181b', border: '1px solid rgba(52,211,153,0.25)', boxShadow: '0 0 40px rgba(52,211,153,0.05)' }}>
              <div className="absolute -top-2.5 left-5 px-2.5 py-0.5 bg-emerald-500 rounded-full text-[10px] font-semibold text-black">Popular</div>
              <div className="text-[10px] font-semibold tracking-[0.15em] uppercase text-emerald-400 mb-1.5">Pro</div>
              <div className="flex items-baseline gap-0.5 mb-0.5"><span className="text-3xl font-light text-[#e4e4e7]">$8</span><span className="text-[12px] text-[#71717a]">/mo</span></div>
              <div className="text-[11px] text-[#52525b] mb-6">or $60/year (save 37%)</div>
              <div className="space-y-2.5 mb-6">
                {['Everything in Free', 'PDF & DOCX upload', 'Unlimited documents', 'Cloud library', 'Progress & auto-save', 'Reading analytics', 'Custom themes & fonts', 'Offline mode'].map((x, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[12px]">
                    <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-[#e4e4e7] font-light">{x}</span>
                  </div>
                ))}
              </div>
              <a href="/app" className="block w-full py-2.5 text-center bg-emerald-500 hover:bg-emerald-400 rounded-lg text-[12px] font-semibold text-black shadow-lg transition-all hover:scale-[1.01]">Start Free Trial</a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────── */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(52,211,153,0.03), transparent)' }} />
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-light leading-tight tracking-tight mb-5">
            Stop spending <span className="text-emerald-400 font-semibold">4 hours</span> on readings.<br />
            Finish in <span className="text-emerald-400 font-semibold">1</span>.
          </h2>
          <p className="text-[15px] text-[#71717a] font-light mb-8 max-w-md mx-auto">
            Join students who read smarter. Free forever, no strings attached.
          </p>
          <a href="/app" className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 rounded-xl font-semibold text-[15px] text-black shadow-xl hover:shadow-emerald-500/20 transition-all hover:scale-[1.02]">
            Start Speed Reading Now
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </a>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #27272a' }} className="py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[18px] tracking-tight"><span className="font-light">Speed</span><span className="text-emerald-400 font-semibold">Read</span></div>
          <div className="flex items-center gap-6 text-[12px] text-[#52525b]">
            <a href="#features" className="hover:text-[#a1a1aa] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#a1a1aa] transition-colors">Pricing</a>
            <a href="mailto:support@speedread.app" className="hover:text-[#a1a1aa] transition-colors">Contact</a>
          </div>
          <div className="text-[11px] text-[#3f3f46]">© 2026 SpeedRead</div>
        </div>
      </footer>
    </div>
  )
}