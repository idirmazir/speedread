'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '../../lib/supabase-client'
import { useThemeSettings, ThemeSettingsPanel } from '../components/theme-settings'

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
  const [showThemePanel, setShowThemePanel] = useState(false)
  
  const intervalRef = useRef(null)
  const supabase = createClient()

  // Theme system
  const { settings: themeSettings, setSettings: setThemeSettings, theme, font, focalColor } = useThemeSettings()

  const fontSizeClasses = {
    1: 'text-3xl md:text-4xl',
    2: 'text-4xl md:text-5xl',
    3: 'text-5xl md:text-6xl',
    4: 'text-6xl md:text-7xl',
    5: 'text-7xl md:text-8xl',
    6: 'text-8xl md:text-9xl',
  }

  const fontSizeLabels = {
    1: 'XS', 2: 'S', 3: 'M', 4: 'L', 5: 'XL', 6: 'XXL',
  }

  // Check for existing session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Load user's documents
  useEffect(() => {
    if (user) loadDocuments()
  }, [user])

  const loadDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) console.error('Error loading documents:', error)
    else setDocuments(data || [])
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) alert(error.message)
    else {
      setShowAuth(false)
      setEmail('')
      setPassword('')
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setDocuments([])
    setCurrentDocId(null)
  }

  const saveDocument = async () => {
    if (!user || !text.trim()) return

    const wordCount = parseText(text).length
    const docData = {
      user_id: user.id,
      title: docTitle || 'Untitled Document',
      content: text,
      word_count: wordCount,
      current_position: currentIndex,
      total_words: words.length
    }

    if (currentDocId) {
      const { error } = await supabase
        .from('documents')
        .update({ ...docData, updated_at: new Date().toISOString() })
        .eq('id', currentDocId)
      if (error) console.error('Error updating document:', error)
    } else {
      const { data, error } = await supabase
        .from('documents')
        .insert(docData)
        .select()
      if (error) console.error('Error saving document:', error)
      else setCurrentDocId(data[0].id)
    }

    loadDocuments()
  }

  const loadDocument = (doc) => {
    setText(doc.content)
    setDocTitle(doc.title)
    setCurrentDocId(doc.id)
    setCurrentIndex(doc.current_position || 0)
  }

  const deleteDocument = async (docId) => {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId)

    if (error) console.error('Error deleting document:', error)
    else {
      loadDocuments()
      if (currentDocId === docId) {
        setCurrentDocId(null)
        setText('')
        setDocTitle('')
      }
    }
  }

  const calculateORP = (word) => {
    const len = word.length
    if (len <= 2) return 0
    if (len <= 5) return 1
    if (len <= 9) return 2
    if (len <= 13) return 3
    return Math.floor(len * 0.3)
  }

  const parseText = (inputText) => {
    return inputText.replace(/\s+/g, ' ').trim().split(' ').filter(word => word.length > 0)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadProgress(10)

    try {
      if (file.type === 'application/pdf') {
        setUploadProgress(30)
        const formData = new FormData()
        formData.append('file', file)
        setUploadProgress(50)
        const response = await fetch('/api/extract-pdf', { method: 'POST', body: formData })
        const result = await response.json()
        setUploadProgress(80)
        if (response.ok) {
          setText(result.text)
          setDocTitle(file.name.replace('.pdf', ''))
          setUploadProgress(100)
          setShowUploadSuccess(true)
          setTimeout(() => { setShowUploadSuccess(false); setUploadProgress(0) }, 2000)
        } else {
          alert(result.error)
          setUploadProgress(0)
        }
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        setUploadProgress(30)
        const mammoth = await import('mammoth')
        const arrayBuffer = await file.arrayBuffer()
        setUploadProgress(60)
        const result = await mammoth.extractRawText({ arrayBuffer })
        if (result.value && result.value.trim().length > 0) {
          setText(result.value.trim())
          setDocTitle(file.name.replace('.docx', ''))
          setUploadProgress(100)
          setShowUploadSuccess(true)
          setTimeout(() => { setShowUploadSuccess(false); setUploadProgress(0) }, 2000)
        } else throw new Error('No text content found in DOCX')
      } else if (file.type === 'text/plain') {
        setUploadProgress(60)
        const fileText = await file.text()
        setText(fileText)
        setDocTitle(file.name.replace('.txt', ''))
        setUploadProgress(100)
        setShowUploadSuccess(true)
        setTimeout(() => { setShowUploadSuccess(false); setUploadProgress(0) }, 2000)
      } else {
        alert('Please upload a PDF, DOCX, or TXT file')
        setUploadProgress(0)
        return
      }
    } catch (error) {
      console.error('File processing error:', error)
      const fileType = file.type.includes('pdf') ? 'PDF' : file.type.includes('word') ? 'DOCX' : 'file'
      alert(`Unable to process this ${fileType}. The file might be:\n• Image-based or scanned\n• Password protected\n• Corrupted\n• Empty\n\nTry a different file or paste the text manually.`)
      setUploadProgress(0)
    }
  }

  const startReading = () => {
    const parsedWords = parseText(text)
    if (parsedWords.length === 0) return
    setWords(parsedWords)
    setShowReader(true)
    if (user) saveDocument()
  }

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  useEffect(() => {
    if (isPlaying && words.length > 0) {
      const msPerWord = (60 / wpm) * 1000
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= words.length - 1) { setIsPlaying(false); return prev }
          return prev + 1
        })
        if (rampSpeed > 0) setWpm(prev => Math.min(maxWpm, prev + rampSpeed * 0.05))
      }, msPerWord)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying, wpm, words.length, rampSpeed, maxWpm])

  useEffect(() => {
    if (user && currentDocId && showReader) {
      const saveInterval = setInterval(() => saveDocument(), 10000)
      return () => clearInterval(saveInterval)
    }
  }, [user, currentDocId, showReader, currentIndex])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't capture keys when theme panel is open
      if (showThemePanel) return
      if (e.code === 'Space' && showReader) { e.preventDefault(); togglePlay() }
      if (e.code === 'ArrowUp') { e.preventDefault(); setWpm(prev => Math.min(1000, prev + 50)) }
      if (e.code === 'ArrowDown') { e.preventDefault(); setWpm(prev => Math.max(100, prev - 50)) }
      if (e.code === 'ArrowLeft') setCurrentIndex(prev => Math.max(0, prev - 10))
      if (e.code === 'ArrowRight') setCurrentIndex(prev => Math.min(words.length - 1, prev + 10))
      if (e.code === 'KeyR') { setCurrentIndex(0); setIsPlaying(false) }
      if (e.code === 'BracketLeft') setFontSize(prev => Math.max(1, prev - 1))
      if (e.code === 'BracketRight') setFontSize(prev => Math.min(6, prev + 1))
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showReader, togglePlay, words.length, showThemePanel])

  // Render word with ORP highlight — now uses theme colors + font
  const renderWord = (word) => {
    if (!word) return null
    const orp = calculateORP(word)
    const before = word.slice(0, orp)
    const focal = word[orp] || ''
    const after = word.slice(orp + 1)
    
    return (
      <div className={`flex items-center justify-center ${fontSizeClasses[fontSize]} select-none`} 
           style={{ 
             fontFamily: font.family,
             fontWeight: font.weight,
             letterSpacing: font.letterSpacing,
           }}>
        <span style={{ color: theme.textMuted, textAlign: 'right' }}>{before}</span>
        <span className="mx-1 relative" style={{ color: focalColor, fontWeight: 500 }}>
          {focal}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-0.5 rounded-full opacity-60"
               style={{ backgroundColor: focalColor }}></div>
        </span>
        <span style={{ color: theme.textMuted, textAlign: 'left' }}>{after}</span>
      </div>
    )
  }

  // ─── Dynamic slider CSS (adapts to theme) ───
  const sliderCSS = `
    .slider-themed::-webkit-slider-thumb {
      appearance: none;
      width: 20px; height: 20px; border-radius: 50%;
      background: ${theme.sliderThumb};
      cursor: pointer;
      border: 2px solid ${theme.sliderThumbBorder};
      box-shadow: 0 4px 12px ${theme.sliderThumbShadow};
    }
    .slider-themed::-webkit-slider-track {
      width: 100%; height: 8px; cursor: pointer;
      background: ${theme.surfaceHover}; border-radius: 4px;
    }
    .slider-themed::-moz-range-thumb {
      width: 20px; height: 20px; border-radius: 50%;
      background: ${theme.sliderThumb};
      cursor: pointer;
      border: 2px solid ${theme.sliderThumbBorder};
      box-shadow: 0 4px 12px ${theme.sliderThumbShadow};
    }
    .slider-themed::-moz-range-track {
      width: 100%; height: 8px; cursor: pointer;
      background: ${theme.surfaceHover}; border-radius: 4px;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-in { animation: slideIn 0.5s ease-out forwards; }
  `

  // ─── LOADING ───
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.bg }}>
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: theme.accent, borderTopColor: 'transparent' }}></div>
          <div className="font-light" style={{ color: theme.textMuted }}>Loading SpeedRead...</div>
        </div>
      </div>
    )
  }

  // ─── AUTH MODAL ───
  if (showAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: theme.bg }}>
        <div className="backdrop-blur-xl rounded-2xl p-8 w-full max-w-md shadow-2xl"
             style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light mb-2" style={{ fontFamily: font.family }}>
              Speed<span style={{ color: theme.accent, fontWeight: 500 }}>Read</span>
            </h1>
            <p className="text-sm font-light" style={{ color: theme.textMuted }}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl font-light transition-all duration-200 focus:outline-none"
                style={{
                  backgroundColor: theme.surfaceHover,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
                onFocus={(e) => e.target.style.borderColor = theme.accentBorder}
                onBlur={(e) => e.target.style.borderColor = theme.border}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl font-light transition-all duration-200 focus:outline-none"
                style={{
                  backgroundColor: theme.surfaceHover,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
                onFocus={(e) => e.target.style.borderColor = theme.accentBorder}
                onBlur={(e) => e.target.style.borderColor = theme.border}
                required
              />
            </div>
            
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-medium text-white transition-all duration-200"
              style={{ background: theme.buttonGradient, boxShadow: `0 10px 25px ${theme.buttonShadow}` }}>
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Please wait...</span>
                </div>
              ) : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>
          
          <div className="mt-6 text-center space-y-4">
            <button onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-light transition-colors"
              style={{ color: theme.textMuted }}>
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: `1px solid ${theme.border}` }}></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 font-light" style={{ backgroundColor: theme.surface, color: theme.textMuted }}>or</span>
              </div>
            </div>
            <button onClick={() => setShowAuth(false)}
              className="text-sm font-light transition-colors"
              style={{ color: theme.textMuted }}>
              Continue without account
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── READER VIEW ───
  if (showReader) {
    const progress = ((currentIndex + 1) / words.length) * 100
    const remainingMinutes = Math.ceil((words.length - currentIndex) / wpm)
    
    return (
      <main className="min-h-screen flex flex-col overflow-hidden" style={{ background: theme.bg, color: theme.text }}>
        {/* Theme Panel */}
        <ThemeSettingsPanel
          settings={themeSettings}
          onChange={setThemeSettings}
          isOpen={showThemePanel}
          onClose={() => setShowThemePanel(false)}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-6" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <button
            onClick={() => { setShowReader(false); setIsPlaying(false); if (user) saveDocument() }}
            className="flex items-center space-x-2 transition-colors group"
            style={{ color: theme.textMuted }}>
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-light">Back to Library</span>
          </button>
          
          <div className="flex items-center space-x-4 text-sm">
            {/* Theme button */}
            <button onClick={() => setShowThemePanel(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all duration-200"
              style={{
                border: `1px solid ${theme.border}`,
                background: theme.accentGlow,
                color: theme.accent,
                fontSize: 13,
                fontWeight: 500,
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              <span>Theme</span>
            </button>

            <div style={{ color: theme.textMuted }}>
              <span style={{ color: theme.text, fontWeight: 500 }}>{Math.round(wpm)}</span> WPM
            </div>
            <div style={{ color: theme.textMuted }}>
              <span style={{ color: theme.text, fontWeight: 500 }}>{fontSizeLabels[fontSize]}</span> Size
            </div>
            <div style={{ color: theme.textMuted }}>
              <span style={{ color: theme.text, fontWeight: 500 }}>{remainingMinutes}</span> min left
            </div>
          </div>
        </div>

        {/* Reader Display */}
        <div className="flex-1 flex items-center justify-center relative px-8">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-px h-32"
               style={{ background: `linear-gradient(to bottom, transparent, ${theme.border}, transparent)`, opacity: 0.3 }}></div>
          
          <div className="relative z-10 px-8 py-12 rounded-2xl backdrop-blur-sm shadow-2xl"
               style={{ backgroundColor: `${theme.surface}33`, border: `1px solid ${theme.border}44` }}>
            {renderWord(words[currentIndex])}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 mx-6 mb-6 rounded-full overflow-hidden" style={{ backgroundColor: `${theme.border}88` }}>
          <div className="h-full transition-all duration-300 ease-out rounded-full"
               style={{ width: `${progress}%`, background: theme.progress }} />
        </div>
        
        {/* Controls */}
        <div className="p-6 backdrop-blur-sm" style={{ backgroundColor: `${theme.surface}55`, borderTop: `1px solid ${theme.border}` }}>
          <div className="max-w-4xl mx-auto">
            {/* Main controls */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              {/* Restart */}
              <button onClick={() => { setCurrentIndex(0); setIsPlaying(false) }}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 group"
                style={{ backgroundColor: `${theme.surfaceHover}88`, border: `1px solid ${theme.border}`, color: theme.textMuted }}
                title="Restart (R)">
                <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              {/* Skip back */}
              <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 10))}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
                style={{ backgroundColor: `${theme.surfaceHover}88`, border: `1px solid ${theme.border}`, color: theme.textMuted }}
                title="Skip back 10 words (←)">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11,18V6L14.5,12M6.5,12L10,6V18H11.5L7,12H6.5Z" />
                </svg>
              </button>
              
              {/* Play/Pause */}
              <button onClick={togglePlay}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-200 transform hover:scale-105"
                style={{
                  background: isPlaying
                    ? 'linear-gradient(to right, #d97706, #f59e0b)'
                    : theme.buttonGradient,
                  boxShadow: `0 10px 25px ${isPlaying ? 'rgba(217, 119, 6, 0.25)' : theme.buttonShadow}`,
                }}
                title="Play/Pause (Space)">
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,19H18V5H14M6,19H10V5H6V19Z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                  </svg>
                )}
              </button>
              
              {/* Skip forward */}
              <button onClick={() => setCurrentIndex(prev => Math.min(words.length - 1, prev + 10))}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
                style={{ backgroundColor: `${theme.surfaceHover}88`, border: `1px solid ${theme.border}`, color: theme.textMuted }}
                title="Skip forward 10 words (→)">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13,6V18L9.5,12M17.5,12L14,18V6H12.5L17,12H17.5Z" />
                </svg>
              </button>
            </div>
            
            {/* Secondary controls */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <button onClick={() => setFontSize(prev => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{ backgroundColor: `${theme.surfaceHover}88`, border: `1px solid ${theme.border}`, color: theme.textMuted }}
                  title="Smaller font ([)">
                  <span className="text-xs font-medium">A-</span>
                </button>
                <span className="font-light px-2" style={{ color: theme.textMuted }}>Font</span>
                <button onClick={() => setFontSize(prev => Math.min(6, prev + 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{ backgroundColor: `${theme.surfaceHover}88`, border: `1px solid ${theme.border}`, color: theme.textMuted }}
                  title="Larger font (])">
                  <span className="text-xs font-medium">A+</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button onClick={() => setWpm(prev => Math.max(100, prev - 25))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{ backgroundColor: `${theme.surfaceHover}88`, border: `1px solid ${theme.border}`, color: theme.textMuted }}
                  title="Slower (↓)">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="font-light px-2" style={{ color: theme.textMuted }}>Speed</span>
                <button onClick={() => setWpm(prev => Math.min(1000, prev + 25))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{ backgroundColor: `${theme.surfaceHover}88`, border: `1px solid ${theme.border}`, color: theme.textMuted }}
                  title="Faster (↑)">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex justify-center items-center space-x-8 mt-6 text-sm">
              <div style={{ color: theme.textMuted }}>
                Word <span style={{ color: theme.text, fontWeight: 500 }}>{currentIndex + 1}</span> of <span style={{ color: theme.text, fontWeight: 500 }}>{words.length}</span>
              </div>
              {user && (
                <div className="flex items-center space-x-2" style={{ color: theme.textMuted }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }}></div>
                  <span className="font-light">Auto-saving</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <style jsx>{sliderCSS}</style>
      </main>
    )
  }

  // ─── MAIN LIBRARY VIEW ───
  return (
    <main className="min-h-screen" style={{ background: theme.bg, color: theme.text }}>
      {/* Theme Panel */}
      <ThemeSettingsPanel
        settings={themeSettings}
        onChange={setThemeSettings}
        isOpen={showThemePanel}
        onClose={() => setShowThemePanel(false)}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-8">
            <div>
              <h1 className="text-4xl font-light mb-2" style={{ fontFamily: font.family }}>
                Speed<span style={{ color: theme.accent, fontWeight: 500 }}>Read</span>
              </h1>
              <p className="font-light" style={{ color: theme.textMuted }}>Advanced speed reading for professionals</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme button */}
            <button onClick={() => setShowThemePanel(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all duration-200"
              style={{
                border: `1px solid ${theme.border}`,
                background: theme.accentGlow,
                color: theme.accent,
                fontSize: 13,
                fontWeight: 500,
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              <span>Theme</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: theme.text }}>{user.email}</div>
                  <div className="text-xs font-light" style={{ color: theme.textMuted }}>Pro Member</div>
                </div>
                <button onClick={handleSignOut}
                  className="px-4 py-2 rounded-lg text-sm font-light transition-all duration-200"
                  style={{ backgroundColor: `${theme.surfaceHover}88`, border: `1px solid ${theme.border}`, color: theme.textMuted }}>
                  Sign Out
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)}
                className="px-6 py-2 rounded-lg font-medium text-white transition-all duration-200"
                style={{ background: theme.buttonGradient, boxShadow: `0 10px 25px ${theme.buttonShadow}` }}>
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Document Library */}
        {user && documents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-light" style={{ color: theme.text }}>Your Library</h2>
              <div className="text-sm font-light" style={{ color: theme.textMuted }}>{documents.length} document{documents.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {documents.map((doc, index) => {
                const docProgress = doc.current_position > 0 ? Math.round((doc.current_position / doc.total_words) * 100) : 0
                return (
                  <div key={doc.id} 
                       className="group backdrop-blur-sm rounded-xl p-5 transition-all duration-200 cursor-pointer transform hover:scale-105 hover:shadow-xl"
                       style={{
                         backgroundColor: `${theme.surface}88`,
                         border: `1px solid ${theme.border}`,
                       }}
                       onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accentBorder; e.currentTarget.style.backgroundColor = theme.surface }}
                       onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.backgroundColor = `${theme.surface}88` }}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium truncate mr-2 transition-colors" style={{ color: theme.text }}>{doc.title}</h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id) }}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{ color: theme.textMuted }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm font-light mb-2" style={{ color: theme.textMuted }}>
                        {doc.word_count?.toLocaleString()} words • {docProgress > 0 ? `${docProgress}% complete` : 'Not started'}
                      </div>
                      {docProgress > 0 && (
                        <div className="w-full rounded-full h-1.5 mb-3" style={{ backgroundColor: `${theme.border}88` }}>
                          <div className="h-1.5 rounded-full transition-all duration-300"
                               style={{ width: `${docProgress}%`, background: theme.progress }} />
                        </div>
                      )}
                    </div>
                    
                    <button onClick={() => loadDocument(doc)}
                      className="w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{
                        backgroundColor: `${theme.surfaceHover}88`,
                        border: `1px solid ${theme.border}`,
                        color: theme.text,
                      }}
                      onMouseEnter={(e) => { e.target.style.borderColor = theme.accentBorder; e.target.style.color = theme.accent; e.target.style.backgroundColor = theme.accentGlow }}
                      onMouseLeave={(e) => { e.target.style.borderColor = theme.border; e.target.style.color = theme.text; e.target.style.backgroundColor = `${theme.surfaceHover}88` }}>
                      {docProgress > 0 ? 'Continue Reading' : 'Start Reading'}
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Document Input Section */}
        <section className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-light mb-4" style={{ color: theme.text }}>Upload Document</h3>
            <div className="relative">
              <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" id="fileInput" />
              <label htmlFor="fileInput" 
                className="group block border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300"
                style={{ borderColor: `${theme.border}88` }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accentBorder; e.currentTarget.style.backgroundColor = `${theme.surface}44` }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${theme.border}88`; e.currentTarget.style.backgroundColor = 'transparent' }}>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300"
                       style={{ backgroundColor: `${theme.surfaceHover}88` }}>
                    <svg className="w-8 h-8 transition-colors" style={{ color: theme.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium transition-colors mb-1" style={{ color: theme.text }}>Drop your document here</div>
                    <div className="text-sm font-light" style={{ color: theme.textMuted }}>Supports PDF, DOCX, and TXT files</div>
                  </div>
                </div>
                
                {/* Upload Progress */}
                {uploadProgress > 0 && (
                  <div className="absolute inset-0 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                       style={{ backgroundColor: `${theme.bg}ee` }}>
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 relative">
                        <div className="absolute inset-0 rounded-full" style={{ border: `4px solid ${theme.border}` }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-medium" style={{ color: theme.accent }}>{uploadProgress}%</span>
                        </div>
                      </div>
                      <div className="font-medium" style={{ color: theme.text }}>
                        {uploadProgress === 100 && showUploadSuccess ? 'Success!' : 'Processing...'}
                      </div>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>
          
          {/* Text Input */}
          <div className="space-y-4">
            <h3 className="text-lg font-light mb-4" style={{ color: theme.text }}>Paste Text</h3>
            <div className="space-y-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here for instant speed reading..."
                className="w-full h-48 px-4 py-4 rounded-xl resize-none focus:outline-none transition-all duration-200 font-light"
                style={{
                  backgroundColor: `${theme.surface}88`,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                  fontFamily: 'ui-monospace, "SF Mono", Monaco, monospace',
                }}
                onFocus={(e) => e.target.style.borderColor = theme.accentBorder}
                onBlur={(e) => e.target.style.borderColor = theme.border}
              />
              
              {user && (
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Document title (optional)"
                  className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 font-light"
                  style={{
                    backgroundColor: `${theme.surface}88`,
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.accentBorder}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                />
              )}
            </div>
          </div>
        </section>

        {/* Reading Controls */}
        {text && (
          <section className="backdrop-blur-sm rounded-2xl p-8"
                   style={{ backgroundColor: `${theme.surface}55`, border: `1px solid ${theme.border}` }}>
            <h3 className="text-lg font-light mb-6" style={{ color: theme.text }}>Reading Settings</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {/* Starting Speed */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-light" style={{ color: theme.textMuted }}>Starting Speed</label>
                  <span className="font-medium text-sm" style={{ color: theme.accent }}>{wpm} WPM</span>
                </div>
                <input type="range" min="100" max="1000" step="25" value={wpm}
                  onChange={(e) => setWpm(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer slider-themed" />
              </div>
              
              {/* Speed Ramp */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-light" style={{ color: theme.textMuted }}>Speed Ramp</label>
                  <span className="font-medium text-sm" style={{ color: theme.accent }}>
                    {rampSpeed === 0 ? 'Off' : `+${rampSpeed}/min`}
                  </span>
                </div>
                <input type="range" min="0" max="50" step="5" value={rampSpeed}
                  onChange={(e) => setRampSpeed(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer slider-themed" />
              </div>
              
              {/* Max Speed */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-light" style={{ color: theme.textMuted }}>Max Speed</label>
                  <span className="font-medium text-sm" style={{ color: theme.accent }}>{maxWpm} WPM</span>
                </div>
                <input type="range" min="200" max="1000" step="50" value={maxWpm}
                  onChange={(e) => setMaxWpm(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer slider-themed" />
              </div>
              
              {/* Font Size */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-light" style={{ color: theme.textMuted }}>Font Size</label>
                  <span className="font-medium text-sm" style={{ color: theme.accent }}>{fontSizeLabels[fontSize]}</span>
                </div>
                <input type="range" min="1" max="6" step="1" value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer slider-themed" />
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-light" style={{ color: theme.textMuted }}>
                <span style={{ color: theme.text, fontWeight: 500 }}>{parseText(text).length.toLocaleString()}</span> words • 
                <span style={{ color: theme.text, fontWeight: 500 }} className="ml-1">{Math.ceil(parseText(text).length / wpm)}</span> minute read
              </div>
              
              <div className="flex items-center space-x-3">
                {user && (
                  <button onClick={saveDocument}
                    className="px-6 py-3 rounded-xl font-medium transition-all duration-200"
                    style={{
                      backgroundColor: `${theme.surfaceHover}88`,
                      border: `1px solid ${theme.border}`,
                      color: theme.text,
                    }}>
                    Save Document
                  </button>
                )}
                
                <button onClick={startReading}
                  className="px-8 py-3 rounded-xl font-medium text-white transition-all duration-200 transform hover:scale-105"
                  style={{ background: theme.buttonGradient, boxShadow: `0 10px 25px ${theme.buttonShadow}` }}>
                  Start Speed Reading
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
      
      <style jsx>{sliderCSS}</style>
    </main>
  )
}
