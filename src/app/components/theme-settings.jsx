'use client'

import { useState, useEffect, useRef, useLayoutEffect } from 'react'

// ═══════════════════════════════════════════════════════
// THEME DEFINITIONS
// ═══════════════════════════════════════════════════════

const THEMES = {
  emerald: {
    name: 'Emerald',
    label: 'Default',
    bg: '#0a0f1a',
    surface: '#0f172a',
    surfaceHover: '#1e293b',
    border: '#1e293b',
    text: '#e2e8f0',
    textMuted: '#94a3b8',
    accent: '#34d399',
    accentHover: '#6ee7b7',
    accentGlow: 'rgba(52, 211, 153, 0.15)',
    accentBorder: 'rgba(52, 211, 153, 0.3)',
    progress: 'linear-gradient(to right, #10b981, #34d399)',
    buttonGradient: 'linear-gradient(to right, #059669, #10b981)',
    buttonGradientHover: 'linear-gradient(to right, #10b981, #34d399)',
    buttonShadow: 'rgba(16, 185, 129, 0.25)',
    sliderThumb: 'linear-gradient(135deg, #10b981, #059669)',
    sliderThumbBorder: '#064e3b',
    sliderThumbShadow: 'rgba(16, 185, 129, 0.4)',
    swatch: '#34d399',
  },
  midnight: {
    name: 'Midnight',
    label: 'Deep Focus',
    bg: '#030712',
    surface: '#0a0f1e',
    surfaceHover: '#111827',
    border: '#1f2937',
    text: '#e5e7eb',
    textMuted: '#6b7280',
    accent: '#60a5fa',
    accentHover: '#93c5fd',
    accentGlow: 'rgba(96, 165, 250, 0.15)',
    accentBorder: 'rgba(96, 165, 250, 0.3)',
    progress: 'linear-gradient(to right, #3b82f6, #60a5fa)',
    buttonGradient: 'linear-gradient(to right, #2563eb, #3b82f6)',
    buttonGradientHover: 'linear-gradient(to right, #3b82f6, #60a5fa)',
    buttonShadow: 'rgba(59, 130, 246, 0.25)',
    sliderThumb: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    sliderThumbBorder: '#1e3a5f',
    sliderThumbShadow: 'rgba(59, 130, 246, 0.4)',
    swatch: '#60a5fa',
  },
  parchment: {
    name: 'Parchment',
    label: 'Light Mode',
    bg: '#faf6f1',
    surface: '#f5efe8',
    surfaceHover: '#ebe4d9',
    border: '#d6cfc4',
    text: '#2c2416',
    textMuted: '#8a7e6f',
    accent: '#b45309',
    accentHover: '#d97706',
    accentGlow: 'rgba(180, 83, 9, 0.1)',
    accentBorder: 'rgba(180, 83, 9, 0.3)',
    progress: 'linear-gradient(to right, #d97706, #f59e0b)',
    buttonGradient: 'linear-gradient(to right, #b45309, #d97706)',
    buttonGradientHover: 'linear-gradient(to right, #d97706, #f59e0b)',
    buttonShadow: 'rgba(217, 119, 6, 0.25)',
    sliderThumb: 'linear-gradient(135deg, #d97706, #b45309)',
    sliderThumbBorder: '#92400e',
    sliderThumbShadow: 'rgba(217, 119, 6, 0.4)',
    swatch: '#d97706',
  },
  rose: {
    name: 'Rosé',
    label: 'Warm',
    bg: '#0f0a12',
    surface: '#1a1020',
    surfaceHover: '#261830',
    border: '#2d1f3a',
    text: '#ede5f0',
    textMuted: '#9f8aad',
    accent: '#f472b6',
    accentHover: '#f9a8d4',
    accentGlow: 'rgba(244, 114, 182, 0.15)',
    accentBorder: 'rgba(244, 114, 182, 0.3)',
    progress: 'linear-gradient(to right, #ec4899, #f472b6)',
    buttonGradient: 'linear-gradient(to right, #db2777, #ec4899)',
    buttonGradientHover: 'linear-gradient(to right, #ec4899, #f472b6)',
    buttonShadow: 'rgba(236, 72, 153, 0.25)',
    sliderThumb: 'linear-gradient(135deg, #ec4899, #db2777)',
    sliderThumbBorder: '#831843',
    sliderThumbShadow: 'rgba(236, 72, 153, 0.4)',
    swatch: '#f472b6',
  },
  ocean: {
    name: 'Ocean',
    label: 'Cool',
    bg: '#05101a',
    surface: '#0a1628',
    surfaceHover: '#0f1f38',
    border: '#163050',
    text: '#d4e4f7',
    textMuted: '#6e8cad',
    accent: '#22d3ee',
    accentHover: '#67e8f9',
    accentGlow: 'rgba(34, 211, 238, 0.12)',
    accentBorder: 'rgba(34, 211, 238, 0.3)',
    progress: 'linear-gradient(to right, #06b6d4, #22d3ee)',
    buttonGradient: 'linear-gradient(to right, #0891b2, #06b6d4)',
    buttonGradientHover: 'linear-gradient(to right, #06b6d4, #22d3ee)',
    buttonShadow: 'rgba(6, 182, 212, 0.25)',
    sliderThumb: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    sliderThumbBorder: '#164e63',
    sliderThumbShadow: 'rgba(6, 182, 212, 0.4)',
    swatch: '#22d3ee',
  },
  noir: {
    name: 'Noir',
    label: 'High Contrast',
    bg: '#000000',
    surface: '#0a0a0a',
    surfaceHover: '#171717',
    border: '#262626',
    text: '#fafafa',
    textMuted: '#737373',
    accent: '#ffffff',
    accentHover: '#e5e5e5',
    accentGlow: 'rgba(255, 255, 255, 0.08)',
    accentBorder: 'rgba(255, 255, 255, 0.2)',
    progress: 'linear-gradient(to right, #d4d4d4, #ffffff)',
    buttonGradient: 'linear-gradient(to right, #a3a3a3, #d4d4d4)',
    buttonGradientHover: 'linear-gradient(to right, #d4d4d4, #ffffff)',
    buttonShadow: 'rgba(255, 255, 255, 0.15)',
    sliderThumb: 'linear-gradient(135deg, #ffffff, #d4d4d4)',
    sliderThumbBorder: '#525252',
    sliderThumbShadow: 'rgba(255, 255, 255, 0.3)',
    swatch: '#ffffff',
  },
}

// ═══════════════════════════════════════════════════════
// FONT DEFINITIONS
// ═══════════════════════════════════════════════════════

const FONTS = {
  system: {
    name: 'System',
    label: 'Clean & Fast',
    family: '"SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    weight: 300,
    letterSpacing: '-0.01em',
    category: 'sans-serif',
  },
  georgia: {
    name: 'Georgia',
    label: 'Classic Serif',
    family: 'Georgia, "Times New Roman", serif',
    weight: 400,
    letterSpacing: '0em',
    category: 'serif',
  },
  literata: {
    name: 'Literata',
    label: 'Designed for Reading',
    family: '"Literata", Georgia, serif',
    weight: 400,
    letterSpacing: '0.01em',
    googleFont: 'Literata:wght@300;400;500;600',
    category: 'serif',
  },
  jetbrains: {
    name: 'JetBrains Mono',
    label: 'Monospace',
    family: '"JetBrains Mono", "Fira Code", monospace',
    weight: 300,
    letterSpacing: '-0.02em',
    googleFont: 'JetBrains+Mono:wght@300;400;500',
    category: 'mono',
  },
  atkinson: {
    name: 'Atkinson',
    label: 'High Legibility',
    family: '"Atkinson Hyperlegible", Verdana, sans-serif',
    weight: 400,
    letterSpacing: '0.01em',
    googleFont: 'Atkinson+Hyperlegible:wght@400;700',
    category: 'accessibility',
  },
  opendyslexic: {
    name: 'OpenDyslexic',
    label: 'Dyslexia-Friendly',
    family: '"OpenDyslexic", Comic Sans MS, sans-serif',
    weight: 400,
    letterSpacing: '0.02em',
    category: 'accessibility',
  },
}

// ═══════════════════════════════════════════════════════
// FONT LOADER
// ═══════════════════════════════════════════════════════

function useFontLoader(activeFont) {
  const loadedRef = useRef(new Set())

  useEffect(() => {
    const font = FONTS[activeFont]
    if (!font) return

    if (font.googleFont && !loadedRef.current.has(font.googleFont)) {
      const link = document.createElement('link')
      link.href = `https://fonts.googleapis.com/css2?family=${font.googleFont}&display=swap`
      link.rel = 'stylesheet'
      document.head.appendChild(link)
      loadedRef.current.add(font.googleFont)
    }

    if (activeFont === 'opendyslexic' && !loadedRef.current.has('opendyslexic')) {
      const style = document.createElement('style')
      style.textContent = `
        @font-face {
          font-family: 'OpenDyslexic';
          src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Regular.woff') format('woff');
          font-weight: 400; font-style: normal; font-display: swap;
        }
        @font-face {
          font-family: 'OpenDyslexic';
          src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Bold.woff') format('woff');
          font-weight: 700; font-style: normal; font-display: swap;
        }
      `
      document.head.appendChild(style)
      loadedRef.current.add('opendyslexic')
    }
  }, [activeFont])
}

// ═══════════════════════════════════════════════════════
// SETTINGS PANEL
// ═══════════════════════════════════════════════════════

export function ThemeSettingsPanel({ settings, onChange, isOpen, onClose }) {
  const theme = THEMES[settings.theme] || THEMES.emerald
  const panelRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div ref={panelRef} style={{
        width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
        margin: '0 16px', backgroundColor: theme.surface,
        border: `1px solid ${theme.border}`, borderRadius: 20, padding: 0,
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: `1px solid ${theme.border}`,
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: theme.text }}>Appearance</div>
            <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>Customize your reading experience</div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: theme.textMuted,
            cursor: 'pointer', padding: 8, borderRadius: 8, fontSize: 20, lineHeight: 1,
          }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Theme Selector */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Theme</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {Object.entries(THEMES).map(([key, t]) => (
                <button key={key} onClick={() => onChange({ ...settings, theme: key })} style={{
                  background: t.bg, border: `2px solid ${settings.theme === key ? t.accent : t.border}`,
                  borderRadius: 12, padding: '14px 12px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: t.text, opacity: 0.6 }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: t.accent }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: t.textMuted, opacity: 0.4 }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>{t.label}</div>
                  {settings.theme === key && (
                    <div style={{
                      position: 'absolute', top: 8, right: 8, width: 18, height: 18,
                      borderRadius: '50%', backgroundColor: t.accent,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: t.bg, fontWeight: 700,
                    }}>✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font Selector */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Font</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(FONTS).map(([key, f]) => (
                <button key={key} onClick={() => onChange({ ...settings, font: key })} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: settings.font === key ? theme.accentGlow : 'transparent',
                  border: `1px solid ${settings.font === key ? theme.accentBorder : theme.border}`,
                  borderRadius: 10, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontFamily: f.family, fontSize: 20, fontWeight: f.weight, color: settings.font === key ? theme.accent : theme.text, lineHeight: 1, width: 32 }}>Aa</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: theme.text, textAlign: 'left' }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: theme.textMuted, textAlign: 'left' }}>{f.label}</div>
                    </div>
                  </div>
                  {f.category === 'accessibility' && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: theme.accent,
                      backgroundColor: theme.accentGlow, border: `1px solid ${theme.accentBorder}`,
                      padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>A11Y</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Focal Point Color */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Focal Point Color</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { key: 'theme', label: 'Theme', color: theme.accent },
                { key: '#ef4444', label: 'Red', color: '#ef4444' },
                { key: '#f97316', label: 'Orange', color: '#f97316' },
                { key: '#eab308', label: 'Yellow', color: '#eab308' },
                { key: '#22c55e', label: 'Green', color: '#22c55e' },
                { key: '#3b82f6', label: 'Blue', color: '#3b82f6' },
                { key: '#a855f7', label: 'Purple', color: '#a855f7' },
                { key: '#ec4899', label: 'Pink', color: '#ec4899' },
              ].map((c) => (
                <button key={c.key} onClick={() => onChange({ ...settings, focalColor: c.key })} title={c.label} style={{
                  width: 36, height: 36, borderRadius: '50%', backgroundColor: c.color,
                  border: `3px solid ${(settings.focalColor || 'theme') === c.key ? theme.text : 'transparent'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                  transform: (settings.focalColor || 'theme') === c.key ? 'scale(1.1)' : 'scale(1)',
                }} />
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Preview</div>
            <RSVPPreview settings={settings} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: `1px solid ${theme.border}`,
          display: 'flex', justifyContent: 'flex-end', gap: 10,
        }}>
          <button onClick={() => onChange({ theme: 'emerald', font: 'system', focalColor: 'theme' })} style={{
            padding: '8px 16px', borderRadius: 8, border: `1px solid ${theme.border}`,
            background: 'transparent', color: theme.textMuted, fontSize: 13, cursor: 'pointer',
          }}>Reset</button>
          <button onClick={onClose} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: theme.accent, color: theme.bg, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Done</button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// LIVE RSVP PREVIEW
// ═══════════════════════════════════════════════════════

function RSVPPreview({ settings }) {
  const theme = THEMES[settings.theme] || THEMES.emerald
  const font = FONTS[settings.font] || FONTS.system
  const focalColor = settings.focalColor === 'theme' || !settings.focalColor ? theme.accent : settings.focalColor

  const words = ['Constitutional', 'law', 'requires', 'careful', 'analysis']
  const [idx, setIdx] = useState(0)
  const containerRef = useRef(null)
  const focalRef = useRef(null)
  const wordRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => setIdx(prev => (prev + 1) % words.length), 500)
    return () => clearInterval(interval)
  }, [])

  const word = words[idx]
  const orp = word.length <= 3 ? 1 : word.length <= 7 ? 2 : 3
  const before = word.slice(0, orp)
  const focal = word[orp]
  const after = word.slice(orp + 1)

  useLayoutEffect(() => {
    if (!containerRef.current || !focalRef.current || !wordRef.current) return
    wordRef.current.style.transform = 'translateX(0px)'
    const containerRect = containerRef.current.getBoundingClientRect()
    const focalRect = focalRef.current.getBoundingClientRect()
    const containerCenter = containerRect.left + containerRect.width / 2
    const focalCenter = focalRect.left + focalRect.width / 2
    wordRef.current.style.transform = `translateX(${containerCenter - focalCenter}px)`
  }, [idx])

  return (
    <div ref={containerRef} style={{
      backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 14,
      padding: '32px 20px',
      fontFamily: font.family, fontWeight: font.weight, letterSpacing: font.letterSpacing,
      overflow: 'hidden',
    }}>
      <div ref={wordRef} style={{ fontSize: 32, lineHeight: 1.2, whiteSpace: 'nowrap', textAlign: 'center' }}>
        <span style={{ color: theme.textMuted }}>{before}</span>
        <span ref={focalRef} style={{ display: 'inline-block', color: focalColor, fontWeight: 500, position: 'relative' }}>
          {focal}
          <span style={{
            position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%)',
            width: 10, height: 2, backgroundColor: focalColor, borderRadius: 1, opacity: 0.6,
          }} />
        </span>
        <span style={{ color: theme.textMuted }}>{after}</span>
      </div>
      <div style={{ marginTop: 16, height: 3, backgroundColor: theme.border, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          width: `${((idx + 1) / words.length) * 100}%`, height: '100%',
          background: theme.progress, borderRadius: 2, transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════

export function useThemeSettings() {
  const [settings, setSettings] = useState({ theme: 'emerald', font: 'system', focalColor: 'theme' })
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('speedread-theme-settings')
      if (saved) setSettings(JSON.parse(saved))
    } catch {}
    setHydrated(true)
  }, [])

  useFontLoader(settings.font)

  // Persist
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem('speedread-theme-settings', JSON.stringify(settings)) } catch {}
  }, [settings, hydrated])

  const theme = THEMES[settings.theme] || THEMES.emerald
  const font = FONTS[settings.font] || FONTS.system
  const focalColor = settings.focalColor === 'theme' || !settings.focalColor ? theme.accent : settings.focalColor

  return { settings, setSettings, theme, font, focalColor }
}

export { THEMES, FONTS }