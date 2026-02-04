'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '../../lib/supabase-client'

// ════════════════════════════════════════════════════════════
// TOAST SYSTEM
// ════════════════════════════════════════════════════════════
function Toast({ toasts, removeToast, theme }) {
  const t = theme
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none" style={{ maxWidth: 340 }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl shadow-2xl animate-slide-in-right"
          style={{
            backgroundColor: toast.type === 'error' ? 'rgba(127,29,29,0.85)' : toast.type === 'success' ? (t.bg + 'ee') : (t.surface + 'ee'),
            border: `1px solid ${toast.type === 'error' ? '#991b1b' : toast.type === 'success' ? t.accent + '40' : t.border}`,
            color: toast.type === 'error' ? '#fca5a5' : toast.type === 'success' ? t.accent : t.textMuted,
          }}
        >
          {toast.type === 'success' && (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: t.accent }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg className="w-4 h-4 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {toast.type === 'info' && (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: t.textFaint }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="text-[12px] font-medium leading-snug">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-auto flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// CONFIRM MODAL
// ════════════════════════════════════════════════════════════
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmLabel, theme }) {
  if (!isOpen) return null
  const t = theme
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-6">
      <div className="absolute inset-0 backdrop-blur-md" style={{ backgroundColor: t.bg + 'cc' }} onClick={onCancel} />
      <div className="relative rounded-2xl p-6 w-full max-w-[340px] shadow-2xl" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}>
        <h3 className="text-[15px] font-semibold tracking-tight mb-1.5" style={{ color: t.text }}>{title}</h3>
        <p className="text-[13px] leading-relaxed mb-5" style={{ color: t.textMuted }}>{message}</p>
        <div className="flex items-center justify-end gap-2.5">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-[12px] font-medium transition-all hover:opacity-80" style={{ backgroundColor: t.surfaceHover, border: `1px solid ${t.border}`, color: t.textMuted }}>Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-all hover:opacity-90 shadow-lg" style={{ backgroundColor: '#dc2626' }}>{confirmLabel || 'Delete'}</button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUT OVERLAY
// ════════════════════════════════════════════════════════════
function ShortcutOverlay({ isOpen, onClose, theme }) {
  if (!isOpen) return null
  const t = theme
  const shortcuts = [
    { key: 'Space', action: 'Play / Pause' },
    { key: '↑', action: 'Speed up (+50 WPM)' },
    { key: '↓', action: 'Slow down (-50 WPM)' },
    { key: '←', action: 'Back 10 words' },
    { key: '→', action: 'Forward 10 words' },
    { key: 'R', action: 'Restart' },
    { key: '[', action: 'Smaller font' },
    { key: ']', action: 'Larger font' },
    { key: '/', action: 'Toggle this panel' },
  ]
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-6">
      <div className="absolute inset-0 backdrop-blur-md" style={{ backgroundColor: t.bg + 'cc' }} onClick={onClose} />
      <div className="relative rounded-2xl p-6 w-full max-w-[320px] shadow-2xl" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold tracking-tight" style={{ color: t.text }}>Keyboard Shortcuts</h3>
          <button onClick={onClose} className="w-6 h-6 rounded flex items-center justify-center hover:opacity-70 transition-opacity" style={{ color: t.textFaint }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: t.textMuted }}>{s.action}</span>
              <kbd className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium" style={{ backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.textFaint }}>{s.key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// ONBOARDING BANNER
// ════════════════════════════════════════════════════════════
const SAMPLE_TEXT = `The ancient library stood silent in the moonlight. Sarah pushed open the heavy oak door and stepped inside. Dust particles floated through beams of silver light streaming from tall windows. She had been searching for this place for three years. The shelves stretched impossibly high, filled with volumes no one had touched in decades. Her fingers traced the spines of forgotten books, each one holding secrets that could change everything she thought she knew about the world. This was the beginning of something extraordinary.`

function OnboardingBanner({ onLoadSample, onDismiss, theme }) {
  const t = theme
  return (
    <div className="rounded-xl p-5 mb-8" style={{ backgroundColor: t.accentGlow, border: `1px solid ${t.accent}20` }}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: t.accent + '15', border: `1px solid ${t.accent}20` }}>
          <svg className="w-5 h-5" style={{ color: t.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-semibold tracking-tight mb-1" style={{ color: t.text }}>Welcome to SpeedRead</h3>
          <p className="text-[12px] leading-relaxed mb-3.5" style={{ color: t.textMuted }}>
            Words appear one at a time, right where your eyes are focused. No scanning, no re-reading — just pure comprehension at 2-3x your normal speed.
          </p>
          <div className="flex items-center gap-2.5">
            <button onClick={onLoadSample} className="px-4 py-2 rounded-lg text-[12px] font-semibold shadow-lg transition-all hover:opacity-90" style={{ backgroundColor: t.accent, color: t.btnText }}>Try Sample Text</button>
            <button onClick={onDismiss} className="px-3 py-2 text-[12px] transition-opacity hover:opacity-70" style={{ color: t.textFaint }}>Skip</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// EMPTY LIBRARY STATE
// ════════════════════════════════════════════════════════════
function EmptyLibrary({ theme }) {
  const t = theme
  return (
    <div className="text-center py-12 px-6">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: t.surfaceHover }}>
        <svg className="w-6 h-6" style={{ color: t.textFaint }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <h3 className="text-[14px] font-medium mb-1" style={{ color: t.textMuted }}>Your library is empty</h3>
      <p className="text-[12px] max-w-xs mx-auto" style={{ color: t.textFaint }}>Upload a document or paste text below to save your first read.</p>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════
export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [text, setText] = useState('')
  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [wpm, setWpm] = useState(300)
  const [showReader, setShowReader] = useState(false)
  const [rampSpeed, setRampSpeed] = useState(0)
  const [maxWpm, setMaxWpm] = useState(600)
  const [fontSize, setFontSize] = useState(4)
  const [documents, setDocuments] = useState([])
  const [currentDocId, setCurrentDocId] = useState(null)
  const [docTitle, setDocTitle] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadSuccess, setShowUploadSuccess] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('')
  const [showThemePanel, setShowThemePanel] = useState(false)
  const [themeKey, setThemeKey] = useState('emerald')
  const [fontKey, setFontKey] = useState('system')
  const [focalColor, setFocalColor] = useState('theme')

  // NEW STATE
  const [toasts, setToasts] = useState([])
  const toastIdRef = useRef(0)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, docId: null, docTitle: '' })
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [savingDoc, setSavingDoc] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(false)

  const intervalRef = useRef(null)
  const supabase = createClient()

  // Toast helpers
  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])
  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), [])

  // Theme system (unchanged)
  const THEMES = {
    emerald:   { name: 'Emerald',   label: 'Default',   bg: '#09090b', surface: '#18181b', surfaceHover: '#27272a', border: '#27272a', borderLight: '#3f3f46', text: '#e4e4e7', textMuted: '#71717a', textFaint: '#52525b', accent: '#34d399', accentHover: '#6ee7b7', accentGlow: 'rgba(52,211,153,0.07)', progress: '#10b981', btnText: '#000000' },
    midnight:  { name: 'Midnight',  label: 'Deep Focus', bg: '#030712', surface: '#0f172a', surfaceHover: '#1e293b', border: '#1e293b', borderLight: '#334155', text: '#e2e8f0', textMuted: '#64748b', textFaint: '#475569', accent: '#60a5fa', accentHover: '#93c5fd', accentGlow: 'rgba(96,165,250,0.07)', progress: '#3b82f6', btnText: '#000000' },
    parchment: { name: 'Parchment', label: 'Light',      bg: '#faf6f1', surface: '#f0ebe4', surfaceHover: '#e6e0d6', border: '#d6cfc4', borderLight: '#c4bdb2', text: '#2c2416', textMuted: '#8a7e6f', textFaint: '#a89d8e', accent: '#b45309', accentHover: '#d97706', accentGlow: 'rgba(180,83,9,0.06)', progress: '#d97706', btnText: '#ffffff' },
    rose:      { name: 'Rosé',      label: 'Warm',       bg: '#0f0a12', surface: '#1a1020', surfaceHover: '#261830', border: '#2d1f3a', borderLight: '#3d2d4f', text: '#ede5f0', textMuted: '#9f8aad', textFaint: '#7a6888', accent: '#f472b6', accentHover: '#f9a8d4', accentGlow: 'rgba(244,114,182,0.07)', progress: '#ec4899', btnText: '#000000' },
    ocean:     { name: 'Ocean',     label: 'Cool',       bg: '#0a1628', surface: '#0f1d32', surfaceHover: '#162a46', border: '#1e3a5f', borderLight: '#2a4a73', text: '#e0e7ff', textMuted: '#7089aa', textFaint: '#5a7394', accent: '#22d3ee', accentHover: '#67e8f9', accentGlow: 'rgba(34,211,238,0.07)', progress: '#06b6d4', btnText: '#0a1628' },
    noir:      { name: 'Noir',      label: 'Contrast',   bg: '#000000', surface: '#0a0a0a', surfaceHover: '#171717', border: '#262626', borderLight: '#404040', text: '#fafafa', textMuted: '#737373', textFaint: '#525252', accent: '#e5e5e5', accentHover: '#ffffff', accentGlow: 'rgba(255,255,255,0.05)', progress: '#a3a3a3', btnText: '#000000' },
  }
  const FONTS = {
    system:      { name: 'System',       label: 'Default', family: '"SF Pro Display", -apple-system, system-ui, sans-serif', weight: 300, ls: '-0.03em' },
    georgia:     { name: 'Georgia',      label: 'Serif',   family: 'Georgia, "Times New Roman", serif', weight: 400, ls: '0em' },
    literata:    { name: 'Literata',     label: 'Reading', family: '"Literata", Georgia, serif', weight: 400, ls: '0.01em', gf: 'Literata:wght@300;400;500;600' },
    jetbrains:   { name: 'JetBrains',   label: 'Mono',    family: '"JetBrains Mono", monospace', weight: 300, ls: '-0.02em', gf: 'JetBrains+Mono:wght@300;400;500' },
    atkinson:    { name: 'Atkinson',    label: 'Legible', family: '"Atkinson Hyperlegible", Verdana, sans-serif', weight: 400, ls: '0.01em', gf: 'Atkinson+Hyperlegible:wght@400;700' },
    opendyslexic:{ name: 'OpenDyslexic',label: 'Dyslexia',family: '"OpenDyslexic", sans-serif', weight: 400, ls: '0.02em', cdn: 'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/open-dyslexic-regular.css' },
  }
  const FOCAL_COLORS = [
    { key: 'theme', label: 'Theme' },
    { key: '#ef4444', label: 'Red', c: '#ef4444' },
    { key: '#f97316', label: 'Orange', c: '#f97316' },
    { key: '#eab308', label: 'Yellow', c: '#eab308' },
    { key: '#22c55e', label: 'Green', c: '#22c55e' },
    { key: '#3b82f6', label: 'Blue', c: '#3b82f6' },
    { key: '#a855f7', label: 'Purple', c: '#a855f7' },
    { key: '#ec4899', label: 'Pink', c: '#ec4899' },
  ]

  const t = THEMES[themeKey] || THEMES.emerald
  const f = FONTS[fontKey] || FONTS.system
  const fc = focalColor === 'theme' ? t.accent : focalColor
  const mainFont = '"SF Pro Display", -apple-system, system-ui, sans-serif'

  // Persist prefs
  useEffect(() => { try { const s = localStorage.getItem('sr-prefs'); if (s) { const p = JSON.parse(s); if (p.t && THEMES[p.t]) setThemeKey(p.t); if (p.f && FONTS[p.f]) setFontKey(p.f); if (p.fc) setFocalColor(p.fc) } } catch {} }, [])
  useEffect(() => { try { localStorage.setItem('sr-prefs', JSON.stringify({ t: themeKey, f: fontKey, fc: focalColor })) } catch {} }, [themeKey, fontKey, focalColor])
  useEffect(() => { const fn = FONTS[fontKey]; if (!fn) return; if (fn.gf) { const id = `gf-${fontKey}`; if (!document.getElementById(id)) { const l = document.createElement('link'); l.id = id; l.rel = 'stylesheet'; l.href = `https://fonts.googleapis.com/css2?family=${fn.gf}&display=swap`; document.head.appendChild(l) } } if (fn.cdn) { const id = `cf-${fontKey}`; if (!document.getElementById(id)) { const l = document.createElement('link'); l.id = id; l.rel = 'stylesheet'; l.href = fn.cdn; document.head.appendChild(l) } } }, [fontKey])

  const fsc = { 1: 'text-3xl md:text-4xl', 2: 'text-4xl md:text-5xl', 3: 'text-5xl md:text-6xl', 4: 'text-6xl md:text-7xl', 5: 'text-7xl md:text-8xl', 6: 'text-8xl md:text-9xl' }
  const fsl = { 1: 'XS', 2: 'S', 3: 'M', 4: 'L', 5: 'XL', 6: 'XXL' }

  // Auth & Data
  useEffect(() => { const g = async () => { const { data: { session } } = await supabase.auth.getSession(); setUser(session?.user ?? null); setLoading(false) }; g(); const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => { setUser(s?.user ?? null); setLoading(false) }); return () => subscription.unsubscribe() }, [])
  useEffect(() => { if (user) { loadDocuments(); loadProfile() } }, [user])

  // Onboarding check
  useEffect(() => {
    if (!loading && !text && !showReader) {
      if (!user || (user && documents.length === 0 && !loadingDocs)) setShowOnboarding(true)
    }
  }, [loading, user, documents.length, loadingDocs, text, showReader])

  const loadProfile = async () => { try { const { data } = await supabase.from('profiles').select('is_pro').eq('id', user.id).single(); if (data) setIsPro(data.is_pro === true) } catch {} }

  const loadDocuments = async () => {
    setLoadingDocs(true)
    const { data, error } = await supabase.from('documents').select('*').order('updated_at', { ascending: false })
    if (error) { console.error('Error loading documents:', error); addToast('Failed to load documents', 'error') }
    else setDocuments(data || [])
    setLoadingDocs(false)
  }

  const handleAuth = async (e) => {
    e.preventDefault(); setLoading(true)
    const { error } = isSignUp ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password })
    if (error) addToast(error.message, 'error')
    else { setShowAuth(false); setEmail(''); setPassword(''); addToast(isSignUp ? 'Account created!' : 'Welcome back!', 'success') }
    setLoading(false)
  }

  const handleSignOut = async () => { await supabase.auth.signOut(); setDocuments([]); setCurrentDocId(null); addToast('Signed out', 'info') }

  const saveDocument = async () => {
    if (!user || !text.trim()) return; setSavingDoc(true)
    const wc = parseText(text).length; const d = { user_id: user.id, title: docTitle || 'Untitled', content: text, word_count: wc, current_position: currentIndex, total_words: words.length || wc }
    if (currentDocId) { const { error } = await supabase.from('documents').update({ ...d, updated_at: new Date().toISOString() }).eq('id', currentDocId); if (error) addToast('Failed to save', 'error'); else addToast('Document saved', 'success') }
    else { const { data, error } = await supabase.from('documents').insert(d).select(); if (error) addToast('Failed to save', 'error'); else { setCurrentDocId(data[0].id); addToast('Saved to library', 'success') } }
    setSavingDoc(false); loadDocuments()
  }

  const loadDocument = (doc) => { setText(doc.content); setDocTitle(doc.title); setCurrentDocId(doc.id); setCurrentIndex(doc.current_position || 0); setShowOnboarding(false); addToast(`Loaded "${doc.title}"`, 'info') }

  // Delete with confirmation
  const requestDelete = (id, title) => setConfirmModal({ isOpen: true, docId: id, docTitle: title })
  const confirmDelete = async () => {
    const { docId } = confirmModal; setConfirmModal({ isOpen: false, docId: null, docTitle: '' })
    const { error } = await supabase.from('documents').delete().eq('id', docId)
    if (error) addToast('Failed to delete', 'error')
    else { addToast('Document deleted', 'info'); loadDocuments(); if (currentDocId === docId) { setCurrentDocId(null); setText(''); setDocTitle('') } }
  }
  const cancelDelete = () => setConfirmModal({ isOpen: false, docId: null, docTitle: '' })

  // Reading
  const calculateORP = (w) => { const l = w.length; if (l <= 2) return 0; if (l <= 5) return 1; if (l <= 9) return 2; if (l <= 13) return 3; return Math.floor(l * 0.3) }
  const parseText = (x) => x.replace(/\s+/g, ' ').trim().split(' ').filter(w => w.length > 0)

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 10 * 1024 * 1024) { addToast('File too large — max 10MB.', 'error'); e.target.value = ''; return }
    const pdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')
    const docx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')
    if ((pdf || docx) && !isPro) { setUpgradeReason('pdf'); setShowUpgradeModal(true); e.target.value = ''; return }
    setUploadProgress(10)
    try {
      if (pdf) {
        setUploadProgress(30); const fd = new FormData(); fd.append('file', file); setUploadProgress(50)
        const res = await fetch('/api/extract-pdf', { method: 'POST', body: fd }); const r = await res.json(); setUploadProgress(80)
        if (res.ok) { setText(r.text); setDocTitle(file.name.replace('.pdf', '')); setShowOnboarding(false); setUploadProgress(100); setShowUploadSuccess(true); addToast(`PDF loaded — ${r.text.split(/\s+/).length.toLocaleString()} words`, 'success'); setTimeout(() => { setShowUploadSuccess(false); setUploadProgress(0) }, 2000) }
        else { addToast(r.error || 'Failed to process PDF', 'error'); setUploadProgress(0) }
      } else if (docx) {
        setUploadProgress(30); const m = await import('mammoth'); const ab = await file.arrayBuffer(); setUploadProgress(60)
        const r = await m.extractRawText({ arrayBuffer: ab })
        if (r.value?.trim()) { setText(r.value.trim()); setDocTitle(file.name.replace('.docx', '')); setShowOnboarding(false); setUploadProgress(100); setShowUploadSuccess(true); addToast(`DOCX loaded — ${r.value.trim().split(/\s+/).length.toLocaleString()} words`, 'success'); setTimeout(() => { setShowUploadSuccess(false); setUploadProgress(0) }, 2000) }
        else throw new Error('empty')
      } else if (file.type === 'text/plain') {
        setUploadProgress(60); const tx = await file.text(); setText(tx); setDocTitle(file.name.replace('.txt', '')); setShowOnboarding(false); setUploadProgress(100); setShowUploadSuccess(true); addToast(`File loaded — ${tx.split(/\s+/).length.toLocaleString()} words`, 'success'); setTimeout(() => { setShowUploadSuccess(false); setUploadProgress(0) }, 2000)
      } else { addToast('Unsupported file type. Use PDF, DOCX, or TXT.', 'error'); setUploadProgress(0) }
    } catch { addToast('Unable to process file. It may be image-based, protected, or corrupted.', 'error'); setUploadProgress(0) }
    e.target.value = ''
  }

  const startReading = () => { const pw = parseText(text); if (!pw.length) return; if (!isPro && pw.length > 5000) { setUpgradeReason('wordcount'); setShowUpgradeModal(true); return }; setWords(pw); setShowReader(true); if (user) saveDocument() }
  const togglePlay = useCallback(() => setIsPlaying(p => !p), [])
  const loadSampleText = () => { setText(SAMPLE_TEXT); setDocTitle('Sample: The Ancient Library'); setShowOnboarding(false); addToast('Sample loaded — hit Start Reading!', 'success') }

  useEffect(() => { if (isPlaying && words.length > 0) { intervalRef.current = setInterval(() => { setCurrentIndex(p => { if (p >= words.length - 1) { setIsPlaying(false); return p } return p + 1 }); if (rampSpeed > 0) setWpm(p => Math.min(maxWpm, p + rampSpeed * 0.05)) }, (60 / wpm) * 1000) } return () => { if (intervalRef.current) clearInterval(intervalRef.current) } }, [isPlaying, wpm, words.length, rampSpeed, maxWpm])

  // Silent auto-save (no toast)
  useEffect(() => {
    if (user && isPro && currentDocId && showReader) {
      const i = setInterval(async () => { await supabase.from('documents').update({ current_position: currentIndex, total_words: words.length, updated_at: new Date().toISOString() }).eq('id', currentDocId) }, 10000)
      return () => clearInterval(i)
    }
  }, [user, isPro, currentDocId, showReader, currentIndex, words.length])

  // Keyboard — guard inputs
  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (showThemePanel) return
      if (e.code === 'Space' && showReader) { e.preventDefault(); togglePlay() }
      if (e.code === 'ArrowUp') { e.preventDefault(); setWpm(p => Math.min(1000, p + 50)) }
      if (e.code === 'ArrowDown') { e.preventDefault(); setWpm(p => Math.max(100, p - 50)) }
      if (e.code === 'ArrowLeft') setCurrentIndex(p => Math.max(0, p - 10))
      if (e.code === 'ArrowRight') setCurrentIndex(p => Math.min(words.length - 1, p + 10))
      if (e.code === 'KeyR' && showReader) { setCurrentIndex(0); setIsPlaying(false) }
      if (e.code === 'BracketLeft') setFontSize(p => Math.max(1, p - 1))
      if (e.code === 'BracketRight') setFontSize(p => Math.min(6, p + 1))
      if (e.code === 'Slash' && showReader) { e.preventDefault(); setShowShortcuts(p => !p) }
    }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [showReader, showThemePanel, togglePlay, words.length])

  // Components
  const renderWord = (word) => {
    if (!word) return null
    const orp = calculateORP(word); const bef = word.slice(0, orp); const foc = word[orp] || ''; const aft = word.slice(orp + 1)
    return (
      <div className={`${fsc[fontSize]} select-none`} style={{ fontFamily: f.family, fontWeight: f.weight, letterSpacing: f.ls, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
        <span style={{ color: t.textMuted, textAlign: 'right' }}>{bef}</span>
        <span className="font-semibold relative text-center px-[1px]" style={{ color: fc }}>{foc}<div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full" style={{ backgroundColor: fc, opacity: 0.4 }} /></span>
        <span style={{ color: t.textMuted, textAlign: 'left' }}>{aft}</span>
      </div>
    )
  }

  const Slider = ({ value, min, max, step, onChange }) => {
    const pct = ((value - min) / (max - min)) * 100
    return (
      <div className="relative w-full h-6 flex items-center group">
        <div className="absolute inset-x-0 h-[5px] rounded-full" style={{ backgroundColor: t.border }} />
        <div className="absolute left-0 h-[5px] rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: t.accent, opacity: 0.7 }} />
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" />
        <div className="absolute h-4 w-4 rounded-full shadow-md transition-all pointer-events-none" style={{ left: `calc(${pct}% - 8px)`, backgroundColor: t.accent, boxShadow: `0 0 0 3px ${t.surface}, 0 2px 8px rgba(0,0,0,0.3)` }} />
      </div>
    )
  }

  const PaintbrushIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>)

  const ThemePanel = ({ overlay }) => (
    <div className={overlay ? 'fixed inset-0 z-40' : 'absolute right-0 top-0 bottom-0 z-30'}>
      {overlay && <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: t.bg + 'cc' }} onClick={() => setShowThemePanel(false)} />}
      <div className="absolute right-0 top-0 bottom-0 w-[300px] overflow-y-auto" style={{ backgroundColor: t.surface, borderLeft: `1px solid ${t.border}`, boxShadow: '-12px 0 40px rgba(0,0,0,0.25)' }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[13px] font-semibold tracking-tight" style={{ color: t.text }}>Appearance</span>
            <button onClick={() => setShowThemePanel(false)} className="w-7 h-7 rounded-md flex items-center justify-center hover:opacity-70 transition-opacity" style={{ color: t.textMuted }}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="mb-6">
            <div className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2.5" style={{ color: t.textFaint }}>Theme</div>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(THEMES).map(([k, th]) => (
                <button key={k} onClick={() => setThemeKey(k)} className="rounded-lg p-2.5 text-left transition-all hover:scale-[1.02]" style={{ backgroundColor: th.bg, border: `2px solid ${themeKey === k ? th.accent : th.border}`, boxShadow: themeKey === k ? `0 0 12px ${th.accentGlow}` : 'none' }}>
                  <div className="flex gap-1 mb-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: th.textMuted }} /><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: th.accent }} /></div>
                  <div className="text-[10px] font-medium leading-tight" style={{ color: th.text }}>{th.name}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <div className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2.5" style={{ color: t.textFaint }}>Font</div>
            <div className="flex flex-col gap-1">
              {Object.entries(FONTS).map(([k, fn]) => (
                <button key={k} onClick={() => setFontKey(k)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-all" style={{ backgroundColor: fontKey === k ? t.accentGlow : 'transparent', border: `1px solid ${fontKey === k ? t.accent + '40' : 'transparent'}` }}>
                  <span style={{ fontFamily: fn.family, fontSize: 16, fontWeight: fn.weight, color: fontKey === k ? t.accent : t.textMuted, width: 24 }}>Aa</span>
                  <div><div className="text-[11px] font-medium text-left" style={{ color: t.text }}>{fn.name}</div></div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2.5" style={{ color: t.textFaint }}>Focal Color</div>
            <div className="flex flex-wrap gap-1.5">
              {FOCAL_COLORS.map((c) => (
                <button key={c.key} onClick={() => setFocalColor(c.key)} title={c.label} className="w-7 h-7 rounded-full transition-all hover:scale-110" style={{ backgroundColor: c.c || t.accent, border: `2.5px solid ${focalColor === c.key ? t.text : 'transparent'}`, boxShadow: focalColor === c.key ? `0 0 0 1.5px ${t.bg}` : 'none' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ═══════════════════════════ LOADING ═══════════════════════════
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: t.bg }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10"><div className="absolute inset-0 rounded-full border-2" style={{ borderColor: t.border }} /><div className="absolute inset-0 rounded-full border-2 animate-spin" style={{ borderColor: t.accent, borderTopColor: 'transparent' }} /></div>
        <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: t.textFaint }}>Loading</div>
      </div>
    </div>
  )

  // ═══════════════════════════ AUTH ═══════════════════════════
  if (showAuth) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: t.bg, fontFamily: mainFont }}>
      <Toast toasts={toasts} removeToast={removeToast} theme={t} />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: t.accentGlow }} />
      <div className="relative backdrop-blur-2xl rounded-2xl p-9 w-full max-w-[360px] shadow-2xl" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}>
        <div className="text-center mb-9">
          <h1 className="text-[28px] tracking-tight mb-1"><span className="font-light" style={{ color: t.text }}>Speed</span><span className="font-semibold" style={{ color: t.accent }}>Read</span></h1>
          <p className="text-[13px]" style={{ color: t.textMuted }}>{isSignUp ? 'Create your account' : 'Welcome back'}</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-2.5">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl text-[13px] focus:outline-none transition-all" style={{ backgroundColor: t.surfaceHover, border: `1px solid ${t.border}`, color: t.text, caretColor: t.accent }} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl text-[13px] focus:outline-none transition-all" style={{ backgroundColor: t.surfaceHover, border: `1px solid ${t.border}`, color: t.text, caretColor: t.accent }} required />
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-[13px] transition-all shadow-lg mt-1" style={{ backgroundColor: t.accent, color: t.btnText }}>{loading ? '...' : (isSignUp ? 'Create Account' : 'Sign In')}</button>
        </form>
        <div className="mt-7 text-center space-y-3">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-[12px] transition-colors hover:opacity-80" style={{ color: t.textMuted }}>{isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}</button>
          <div className="flex items-center gap-4"><div className="flex-1 h-px" style={{ backgroundColor: t.border }} /><span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: t.textFaint }}>or</span><div className="flex-1 h-px" style={{ backgroundColor: t.border }} /></div>
          <button onClick={() => setShowAuth(false)} className="text-[12px] transition-colors hover:opacity-80" style={{ color: t.textFaint }}>Continue without account</button>
        </div>
      </div>
      <style jsx>{`@keyframes slideInRight { from { opacity: 0; transform: translateX(80px); } to { opacity: 1; transform: translateX(0); } } .animate-slide-in-right { animation: slideInRight 0.25s ease-out forwards; }`}</style>
    </div>
  )

  // ═══════════════════════════ READER ═══════════════════════════
  if (showReader) {
    const progress = ((currentIndex + 1) / words.length) * 100
    const remMin = Math.ceil((words.length - currentIndex) / wpm)
    return (
      <main className="min-h-screen flex flex-col overflow-hidden" style={{ backgroundColor: t.bg, color: t.text, fontFamily: mainFont }}>
        <Toast toasts={toasts} removeToast={removeToast} theme={t} />
        <ShortcutOverlay isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} theme={t} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-[100px] pointer-events-none" style={{ backgroundColor: t.accentGlow }} />
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-7 py-4" style={{ borderBottom: `1px solid ${t.border}` }}>
          <button onClick={() => { setShowReader(false); setIsPlaying(false); if (user && isPro && currentDocId) { supabase.from('documents').update({ current_position: currentIndex, total_words: words.length, updated_at: new Date().toISOString() }).eq('id', currentDocId) } }} className="flex items-center gap-2 transition-all hover:opacity-70 group" style={{ color: t.textMuted }}>
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="text-[13px] hidden sm:inline">Library</span>
          </button>
          <div className="flex items-center gap-3 md:gap-5 text-[12px]">
            <span style={{ color: t.textMuted }}><span className="font-semibold tabular-nums" style={{ color: t.text }}>{Math.round(wpm)}</span> <span className="hidden sm:inline">wpm</span></span>
            <span style={{ color: t.textMuted }}>{fsl[fontSize]}</span>
            <span style={{ color: t.textMuted }}><span className="font-semibold tabular-nums" style={{ color: t.text }}>{remMin}</span> <span className="hidden sm:inline">min</span></span>
            <button onClick={() => setShowShortcuts(true)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.textFaint }} title="Shortcuts (/)"><span className="text-[11px] font-mono font-bold">?</span></button>
            <button onClick={() => setShowThemePanel(!showThemePanel)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ backgroundColor: showThemePanel ? t.accentGlow : 'transparent', border: `1px solid ${showThemePanel ? t.accent + '40' : 'transparent'}`, color: showThemePanel ? t.accent : t.textMuted }}><PaintbrushIcon /></button>
          </div>
        </div>
        {showThemePanel && <ThemePanel />}
        {/* Word — tap to play */}
        <div className="flex-1 flex items-center justify-center relative px-4 md:px-8 cursor-pointer" onClick={togglePlay}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-24" style={{ background: `linear-gradient(transparent, ${t.border}50, transparent)` }} />
          <div className="relative z-10 w-[90vw] max-w-[700px] py-14">
            {renderWord(words[currentIndex])}
            {!isPlaying && currentIndex === 0 && <div className="text-center mt-6 text-[11px]" style={{ color: t.textFaint, opacity: 0.5 }}>tap to start</div>}
          </div>
        </div>
        {/* Progress */}
        <div className="h-[2px] mx-5 md:mx-7" style={{ backgroundColor: t.border }}><div className="h-full transition-all duration-150" style={{ width: `${progress}%`, backgroundColor: t.progress }} /></div>
        {/* Controls */}
        <div className="px-5 md:px-7 py-5 md:py-7">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2.5 mb-6">
              <button onClick={() => { setCurrentIndex(0); setIsPlaying(false) }} className="w-11 h-11 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all hover:opacity-80" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.textMuted }}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
              <button onClick={() => setCurrentIndex(p => Math.max(0, p - 10))} className="w-11 h-11 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all hover:opacity-80" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.textMuted }}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg></button>
              <button onClick={togglePlay} className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105" style={{ backgroundColor: isPlaying ? '#f59e0b' : t.accent, color: isPlaying ? '#000' : t.btnText, boxShadow: `0 4px 20px ${isPlaying ? 'rgba(245,158,11,0.25)' : t.accentGlow}` }}>{isPlaying ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M14,19H18V5H14M6,19H10V5H6V19Z" /></svg> : <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg>}</button>
              <button onClick={() => setCurrentIndex(p => Math.min(words.length - 1, p + 10))} className="w-11 h-11 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all hover:opacity-80" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.textMuted }}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" /></svg></button>
            </div>
            <div className="flex items-center justify-center gap-7 text-[11px]">
              <div className="flex items-center gap-1.5">
                <button onClick={() => setFontSize(p => Math.max(1, p - 1))} className="w-8 h-8 md:w-7 md:h-7 rounded-md flex items-center justify-center transition-all hover:opacity-80" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.textMuted }}><span className="text-[10px] font-bold">A−</span></button>
                <span className="w-7 text-center" style={{ color: t.textFaint }}>Size</span>
                <button onClick={() => setFontSize(p => Math.min(6, p + 1))} className="w-8 h-8 md:w-7 md:h-7 rounded-md flex items-center justify-center transition-all hover:opacity-80" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.textMuted }}><span className="text-[10px] font-bold">A+</span></button>
              </div>
              <div className="w-px h-3.5" style={{ backgroundColor: t.border }} />
              <div className="flex items-center gap-1.5">
                <button onClick={() => setWpm(p => Math.max(100, p - 25))} className="w-8 h-8 md:w-7 md:h-7 rounded-md flex items-center justify-center transition-all hover:opacity-80" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.textMuted }}><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg></button>
                <span className="w-9 text-center" style={{ color: t.textFaint }}>Speed</span>
                <button onClick={() => setWpm(p => Math.min(1000, p + 25))} className="w-8 h-8 md:w-7 md:h-7 rounded-md flex items-center justify-center transition-all hover:opacity-80" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.textMuted }}><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg></button>
              </div>
            </div>
            <div className="flex justify-center items-center gap-5 mt-5 text-[11px]" style={{ color: t.textFaint }}>
              <span><span className="font-semibold tabular-nums" style={{ color: t.text }}>{currentIndex + 1}</span> <span style={{ opacity: 0.4 }}>/</span> <span className="tabular-nums">{words.length}</span></span>
              {user && isPro && currentDocId && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: t.accent }} />Saving</span>}
            </div>
          </div>
        </div>
        <style jsx>{`@keyframes slideInRight { from { opacity: 0; transform: translateX(80px); } to { opacity: 1; transform: translateX(0); } } .animate-slide-in-right { animation: slideInRight 0.25s ease-out forwards; }`}</style>
      </main>
    )
  }

  // ═══════════════════════════ LIBRARY ═══════════════════════════
  return (
    <main className="min-h-screen" style={{ backgroundColor: t.bg, color: t.text, fontFamily: mainFont }}>
      <Toast toasts={toasts} removeToast={removeToast} theme={t} />
      <ConfirmModal isOpen={confirmModal.isOpen} title="Delete Document" message={`Are you sure you want to delete "${confirmModal.docTitle}"? This cannot be undone.`} onConfirm={confirmDelete} onCancel={cancelDelete} confirmLabel="Delete" theme={t} />
      <div className="fixed inset-0 pointer-events-none overflow-hidden"><div className="absolute -top-40 left-1/3 w-[600px] h-[600px] rounded-full blur-[150px]" style={{ backgroundColor: t.accentGlow }} /></div>
      <div className="relative max-w-5xl mx-auto px-4 md:px-6 lg:px-10 py-6 md:py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 md:mb-12">
          <div>
            <h1 className="text-[28px] tracking-tight mb-0.5"><span className="font-light" style={{ color: t.text }}>Speed</span><span className="font-semibold" style={{ color: t.accent }}>Read</span></h1>
            <p className="text-[10px] tracking-[0.15em] uppercase" style={{ color: t.textFaint }}>RSVP Speed Reading</p>
          </div>
          <div className="flex items-center gap-2.5">
            {user ? (<>
              {!isPro && <button onClick={() => { setUpgradeReason('general'); setShowUpgradeModal(true) }} className="px-3.5 py-[7px] rounded-lg text-[11px] font-semibold tracking-wide transition-all hover:opacity-90" style={{ backgroundColor: t.accentGlow, border: `1px solid ${t.accent}30`, color: t.accent }}>Upgrade</button>}
              <div className="text-right mr-1 hidden sm:block">
                <div className="text-[13px] font-medium" style={{ color: t.text }}>{user.email}</div>
                <div className="text-[10px] tracking-wide font-semibold" style={{ color: isPro ? t.accent : t.textFaint }}>{isPro ? 'Pro' : 'Free'}</div>
              </div>
              <button onClick={() => setShowThemePanel(true)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.textMuted }} title="Appearance"><PaintbrushIcon /></button>
              <button onClick={handleSignOut} className="px-3 py-[7px] rounded-lg text-[11px] transition-all hover:opacity-80" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.textMuted }}>Sign Out</button>
            </>) : (<>
              <button onClick={() => setShowThemePanel(true)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.textMuted }} title="Appearance"><PaintbrushIcon /></button>
              <button onClick={() => setShowAuth(true)} className="px-5 py-2 rounded-lg font-semibold text-[13px] shadow-lg transition-all hover:opacity-90" style={{ backgroundColor: t.accent, color: t.btnText }}>Sign In</button>
            </>)}
          </div>
        </header>

        {/* Onboarding */}
        {showOnboarding && !text && <OnboardingBanner onLoadSample={loadSampleText} onDismiss={() => setShowOnboarding(false)} theme={t} />}

        {/* Library */}
        {user && isPro && (
          <section className="mb-8 md:mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold tracking-tight" style={{ color: t.text }}>Library</h2>
              {documents.length > 0 && <span className="text-[11px]" style={{ color: t.textFaint }}>{documents.length} doc{documents.length !== 1 ? 's' : ''}</span>}
            </div>
            {loadingDocs ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3"><div className="relative w-5 h-5"><div className="absolute inset-0 rounded-full border-2 animate-spin" style={{ borderColor: t.accent, borderTopColor: 'transparent' }} /></div><span className="text-[12px]" style={{ color: t.textFaint }}>Loading library...</span></div>
              </div>
            ) : documents.length === 0 ? (
              <EmptyLibrary theme={t} />
            ) : (
              <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
                {documents.map((doc) => {
                  const dp = doc.current_position > 0 ? Math.round((doc.current_position / doc.total_words) * 100) : 0
                  return (
                    <div key={doc.id} className="group rounded-xl p-4 transition-all duration-200 hover:scale-[1.01]" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-[13px] truncate mr-2" style={{ color: t.text }}>{doc.title}</h3>
                        <button onClick={(e) => { e.stopPropagation(); requestDelete(doc.id, doc.title) }} className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center transition-all hover:opacity-70" style={{ color: t.textFaint }}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                      <div className="text-[11px] mb-2.5" style={{ color: t.textFaint }}>{doc.word_count?.toLocaleString()} words · {dp > 0 ? `${dp}%` : 'New'}</div>
                      {dp > 0 && <div className="w-full rounded-full h-[3px] mb-3" style={{ backgroundColor: t.border }}><div className="h-full rounded-full" style={{ width: `${Math.min(dp, 100)}%`, backgroundColor: t.progress, opacity: 0.6 }} /></div>}
                      <button onClick={() => loadDocument(doc)} className="w-full py-[7px] rounded-lg text-[11px] font-semibold tracking-wide transition-all hover:opacity-80" style={{ backgroundColor: t.surfaceHover, border: `1px solid ${t.border}`, color: t.textMuted }}>{dp > 0 ? 'Continue' : 'Read'}</button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* Input */}
        <section className="grid lg:grid-cols-2 gap-5 mb-8">
          <div>
            <h3 className="text-[12px] font-semibold tracking-wide mb-2.5" style={{ color: t.textFaint }}>Upload</h3>
            <div className="relative">
              <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" id="fileInput" />
              <label htmlFor="fileInput" className="group block border border-dashed rounded-xl p-7 md:p-9 text-center cursor-pointer transition-all duration-200 hover:opacity-80" style={{ borderColor: t.border }}>
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: t.surfaceHover }}><svg className="w-5 h-5" style={{ color: t.textFaint }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg></div>
                  <div><div className="text-[13px] font-medium mb-0.5" style={{ color: t.textMuted }}>Drop a file here</div><div className="text-[11px]" style={{ color: t.textFaint }}>{isPro ? 'PDF, DOCX, TXT · Max 10MB' : 'TXT · Upgrade for PDF & DOCX'}</div></div>
                </div>
                {uploadProgress > 0 && <div className="absolute inset-0 backdrop-blur-sm rounded-xl flex items-center justify-center" style={{ backgroundColor: t.bg + 'ee' }}><div className="text-center"><div className="text-xl font-light tabular-nums mb-1" style={{ color: t.accent }}>{uploadProgress}%</div><div className="text-[11px]" style={{ color: t.textFaint }}>{uploadProgress === 100 && showUploadSuccess ? 'Done' : 'Processing'}</div></div></div>}
              </label>
            </div>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold tracking-wide mb-2.5" style={{ color: t.textFaint }}>Paste text</h3>
            <textarea value={text} onChange={(e) => { setText(e.target.value); if (e.target.value.trim()) setShowOnboarding(false) }} placeholder="Paste your text here..." className="w-full h-[168px] px-4 py-3.5 rounded-xl resize-none focus:outline-none transition-all text-[13px] leading-relaxed" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, caretColor: t.accent, fontFamily: 'ui-monospace, "SF Mono", monospace' }} />
            {user && isPro && <input type="text" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="Title (optional)" className="w-full mt-2 px-4 py-2.5 rounded-xl focus:outline-none transition-all text-[13px]" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, caretColor: t.accent }} />}
          </div>
        </section>

        {/* Settings */}
        {text && (
          <section className="rounded-xl p-5 md:p-6 mb-8" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}>
            <h3 className="text-[12px] font-semibold tracking-wide mb-5" style={{ color: t.textFaint }}>Settings</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5 mb-6">
              {[
                { label: 'Speed', val: `${wpm} wpm`, min: 100, max: 1000, step: 25, v: wpm, fn: setWpm },
                { label: 'Ramp', val: rampSpeed === 0 ? 'Off' : `+${rampSpeed}/min`, min: 0, max: 50, step: 5, v: rampSpeed, fn: setRampSpeed },
                { label: 'Max speed', val: `${maxWpm} wpm`, min: 200, max: 1000, step: 50, v: maxWpm, fn: setMaxWpm },
                { label: 'Font size', val: fsl[fontSize], min: 1, max: 6, step: 1, v: fontSize, fn: setFontSize },
              ].map((c, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2"><span className="text-[11px]" style={{ color: t.textFaint }}>{c.label}</span><span className="text-[11px] font-semibold tabular-nums" style={{ color: t.accent }}>{c.val}</span></div>
                  <Slider value={c.v} min={c.min} max={c.max} step={c.step} onChange={c.fn} />
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4" style={{ borderTop: `1px solid ${t.border}` }}>
              <div className="text-[11px]" style={{ color: t.textFaint }}>
                <span className="font-semibold tabular-nums" style={{ color: t.text }}>{parseText(text).length.toLocaleString()}</span> words · <span className="font-semibold tabular-nums" style={{ color: t.text }}>{Math.ceil(parseText(text).length / wpm)}</span> min
                {!isPro && parseText(text).length > 5000 && <span className="ml-2" style={{ color: '#f59e0b' }}>· Over free limit</span>}
              </div>
              <div className="flex items-center gap-2.5">
                {user && isPro && <button onClick={saveDocument} disabled={savingDoc} className="px-4 py-2 rounded-lg text-[12px] font-medium transition-all hover:opacity-80 disabled:opacity-50" style={{ backgroundColor: t.surfaceHover, border: `1px solid ${t.border}`, color: t.textMuted }}>{savingDoc ? <span className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full border-2 animate-spin" style={{ borderColor: t.textFaint, borderTopColor: 'transparent' }} />Saving...</span> : 'Save'}</button>}
                <button onClick={startReading} className="px-5 py-2 rounded-lg font-semibold text-[13px] shadow-lg transition-all hover:opacity-90 hover:scale-[1.02]" style={{ backgroundColor: t.accent, color: t.btnText }}>Start Reading</button>
              </div>
            </div>
          </section>
        )}

        {!text && !(user && isPro && documents.length > 0) && !showOnboarding && (
          <div className="text-center py-16"><div className="text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: t.textFaint, opacity: 0.5 }}>Get started</div><p className="text-[13px] max-w-xs mx-auto" style={{ color: t.textMuted }}>Upload a document or paste text to begin speed reading.</p></div>
        )}
      </div>

      {showThemePanel && !showReader && <ThemePanel overlay />}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 backdrop-blur-md" style={{ backgroundColor: t.bg + 'dd' }} onClick={() => setShowUpgradeModal(false)} />
          <div className="relative rounded-2xl p-7 max-w-[340px] w-full shadow-2xl" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}>
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-3.5 right-3.5 w-6 h-6 rounded flex items-center justify-center hover:opacity-70" style={{ color: t.textFaint }}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: t.accentGlow, border: `1px solid ${t.accent}20` }}><svg className="w-5 h-5" style={{ color: t.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
            <h3 className="text-lg font-semibold tracking-tight mb-1" style={{ color: t.text }}>Upgrade to <span style={{ color: t.accent }}>Pro</span></h3>
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: t.textMuted }}>{upgradeReason === 'pdf' ? 'PDF & DOCX uploads require Pro.' : upgradeReason === 'wordcount' ? 'Free is limited to 5,000 words.' : 'Get the full experience.'}</p>
            <div className="rounded-lg p-3.5 mb-4" style={{ backgroundColor: t.bg, border: `1px solid ${t.border}` }}>
              <div className="space-y-1.5">{['PDF & DOCX uploads', 'Unlimited words', 'Cloud library', 'Auto-save & analytics'].map((x, i) => (<div key={i} className="flex items-center gap-2 text-[12px]"><svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg><span style={{ color: t.text }}>{x}</span></div>))}</div>
            </div>
            <div className="flex items-baseline gap-1 mb-4"><span className="text-xl font-semibold tabular-nums" style={{ color: t.text }}>$8</span><span className="text-[12px]" style={{ color: t.textMuted }}>/mo</span><span className="text-[11px] ml-1.5" style={{ color: t.textFaint }}>or $60/yr</span></div>
            <button onClick={() => setShowUpgradeModal(false)} className="w-full py-2.5 rounded-xl font-semibold text-[13px] shadow-lg transition-all hover:opacity-90 mb-2" style={{ backgroundColor: t.accent, color: t.btnText }}>Upgrade to Pro</button>
            <button onClick={() => setShowUpgradeModal(false)} className="w-full py-2 text-[11px] transition-colors hover:opacity-70" style={{ color: t.textFaint }}>Maybe later</button>
          </div>
        </div>
      )}

      <style jsx>{`@keyframes slideInRight { from { opacity: 0; transform: translateX(80px); } to { opacity: 1; transform: translateX(0); } } .animate-slide-in-right { animation: slideInRight 0.25s ease-out forwards; }`}</style>
    </main>
  )
}