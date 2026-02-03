'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '../lib/supabase-client'

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  
  // Existing state
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
  
  const intervalRef = useRef(null)
  const supabase = createClient()

  const fontSizeClasses = {
    1: 'text-3xl md:text-4xl',
    2: 'text-4xl md:text-5xl',
    3: 'text-5xl md:text-6xl',
    4: 'text-6xl md:text-7xl',
    5: 'text-7xl md:text-8xl',
    6: 'text-8xl md:text-9xl',
  }

  const fontSizeLabels = {
    1: 'XS',
    2: 'S',
    3: 'M',
    4: 'L',
    5: 'XL',
    6: 'XXL',
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
    if (user) {
      loadDocuments()
    }
  }, [user])

  const loadDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error loading documents:', error)
    } else {
      setDocuments(data || [])
    }
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert(error.message)
    } else {
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
      // Update existing
      const { error } = await supabase
        .from('documents')
        .update({ ...docData, updated_at: new Date().toISOString() })
        .eq('id', currentDocId)

      if (error) console.error('Error updating document:', error)
    } else {
      // Create new
      const { data, error } = await supabase
        .from('documents')
        .insert(docData)
        .select()

      if (error) {
        console.error('Error saving document:', error)
      } else {
        setCurrentDocId(data[0].id)
      }
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

    if (error) {
      console.error('Error deleting document:', error)
    } else {
      loadDocuments()
      if (currentDocId === docId) {
        setCurrentDocId(null)
        setText('')
        setDocTitle('')
      }
    }
  }

  // Calculate Optimal Recognition Point (ORP)
  const calculateORP = (word) => {
    const len = word.length
    if (len === 1) return 0
    if (len === 2) return 0
    if (len === 3) return 1
    if (len === 4) return 1
    if (len === 5) return 1
    if (len <= 7) return 2
    if (len <= 9) return 2
    if (len <= 11) return 3
    if (len <= 13) return 3
    return Math.floor(len * 0.3)
  }

  // Parse text into words
  const parseText = (inputText) => {
    return inputText
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(word => word.length > 0)
  }

  // Handle file upload with working PDF and DOCX support
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    console.log('Processing file:', file.name, 'Type:', file.type)
    
    // Show upload animation
    setUploadProgress(10)

    try {
      if (file.type === 'application/pdf') {
        setUploadProgress(30)
        try {
          const formData = new FormData()
          formData.append('file', file)
          
          setUploadProgress(50)
          const response = await fetch('/api/extract-pdf', {
            method: 'POST',
            body: formData
          })
          
          const result = await response.json()
          setUploadProgress(80)
          
          if (response.ok) {
            setText(result.text)
            setDocTitle(file.name.replace('.pdf', ''))
            console.log(`Successfully extracted PDF text`)
            setUploadProgress(100)
            setShowUploadSuccess(true)
            setTimeout(() => {
              setShowUploadSuccess(false)
              setUploadProgress(0)
            }, 2000)
          } else {
            alert(result.error)
            setUploadProgress(0)
          }
        } catch (error) {
          alert('PDF upload failed. Please copy and paste the text manually.')
          setUploadProgress(0)
        }
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        setUploadProgress(30)
        // Handle DOCX files with mammoth
        const mammoth = await import('mammoth')
        const arrayBuffer = await file.arrayBuffer()
        setUploadProgress(60)
        const result = await mammoth.extractRawText({ arrayBuffer })

        if (result.value && result.value.trim().length > 0) {
          setText(result.value.trim())
          setDocTitle(file.name.replace('.docx', ''))
          console.log(`Successfully extracted ${result.value.length} characters from DOCX`)
          setUploadProgress(100)
          setShowUploadSuccess(true)
          setTimeout(() => {
            setShowUploadSuccess(false)
            setUploadProgress(0)
          }, 2000)
        } else {
          throw new Error('No text content found in DOCX')
        }
      } else if (file.type === 'text/plain') {
        setUploadProgress(60)
        const text = await file.text()
        setText(text)
        setDocTitle(file.name.replace('.txt', ''))
        console.log('Successfully loaded TXT file')
        setUploadProgress(100)
        setShowUploadSuccess(true)
        setTimeout(() => {
          setShowUploadSuccess(false)
          setUploadProgress(0)
        }, 2000)
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

  // Start reading
  const startReading = () => {
    const parsedWords = parseText(text)
    if (parsedWords.length === 0) return
    
    setWords(parsedWords)
    setShowReader(true)
    
    // Auto-save current position when starting
    if (user) {
      saveDocument()
    }
  }

  // Play/Pause
  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  // Handle playback
  useEffect(() => {
    if (isPlaying && words.length > 0) {
      const msPerWord = (60 / wpm) * 1000
      
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
        
        // Apply speed ramp with max limit
        if (rampSpeed > 0) {
          setWpm(prev => Math.min(maxWpm, prev + rampSpeed * 0.05))
        }
      }, msPerWord)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, wpm, words.length, rampSpeed, maxWpm])

  // Auto-save progress periodically
  useEffect(() => {
    if (user && currentDocId && showReader) {
      const saveInterval = setInterval(() => {
        saveDocument()
      }, 10000) // Save every 10 seconds

      return () => clearInterval(saveInterval)
    }
  }, [user, currentDocId, showReader, currentIndex])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && showReader) {
        e.preventDefault()
        togglePlay()
      }
      if (e.code === 'ArrowUp') {
        e.preventDefault()
        setWpm(prev => Math.min(1000, prev + 50))
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault()
        setWpm(prev => Math.max(100, prev - 50))
      }
      if (e.code === 'ArrowLeft') {
        setCurrentIndex(prev => Math.max(0, prev - 10))
      }
      if (e.code === 'ArrowRight') {
        setCurrentIndex(prev => Math.min(words.length - 1, prev + 10))
      }
      if (e.code === 'KeyR') {
        setCurrentIndex(0)
        setIsPlaying(false)
      }
      if (e.code === 'BracketLeft') {
        setFontSize(prev => Math.max(1, prev - 1))
      }
      if (e.code === 'BracketRight') {
        setFontSize(prev => Math.min(6, prev + 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showReader, togglePlay, words.length])

  // Render word with ORP highlight
  const renderWord = (word) => {
    if (!word) return null
    const orp = calculateORP(word)
    const before = word.slice(0, orp)
    const focal = word[orp] || ''
    const after = word.slice(orp + 1)
    
    return (
      <div className={`flex items-center justify-center ${fontSizeClasses[fontSize]} font-light tracking-tight select-none`} 
           style={{ 
             fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif',
             fontWeight: '300',
             letterSpacing: '-0.02em'
           }}>
        <span className="text-slate-400" style={{ textAlign: 'right' }}>{before}</span>
        <span className="text-emerald-400 font-medium mx-1 relative">
          {focal}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-emerald-400 rounded-full opacity-60"></div>
        </span>
        <span className="text-slate-400" style={{ textAlign: 'left' }}>{after}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
          <div className="text-slate-400 font-light">Loading SpeedRead...</div>
        </div>
      </div>
    )
  }

  // Auth Modal
  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light mb-2" style={{ fontFamily: '"SF Pro Display", system-ui, sans-serif' }}>
              Speed<span className="text-emerald-400 font-medium">Read</span>
            </h1>
            <p className="text-slate-400 text-sm font-light">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-800/70 transition-all duration-200 font-light"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-800/70 transition-all duration-200 font-light"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-slate-700 disabled:to-slate-600 rounded-xl font-medium text-white transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 disabled:shadow-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center space-y-4">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-slate-400 hover:text-slate-300 text-sm font-light transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-3 text-slate-500 font-light">or</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowAuth(false)}
              className="text-slate-500 hover:text-slate-400 text-sm font-light transition-colors"
            >
              Continue without account
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Reader View
  if (showReader) {
    const progress = ((currentIndex + 1) / words.length) * 100
    const remainingMinutes = Math.ceil((words.length - currentIndex) / wpm)
    
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
          <button
            onClick={() => { 
              setShowReader(false) 
              setIsPlaying(false)
              if (user) saveDocument()
            }}
            className="flex items-center space-x-2 text-slate-400 hover:text-slate-300 transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-light">Back to Library</span>
          </button>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-slate-400">
              <span className="text-slate-300 font-medium">{Math.round(wpm)}</span> WPM
            </div>
            <div className="text-slate-400">
              <span className="text-slate-300 font-medium">{fontSizeLabels[fontSize]}</span> Size
            </div>
            <div className="text-slate-400">
              <span className="text-slate-300 font-medium">{remainingMinutes}</span> min left
            </div>
          </div>
        </div>

        {/* Reader Display */}
        <div className="flex-1 flex items-center justify-center relative px-8">
          {/* Subtle guide line */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-px h-32 bg-gradient-to-b from-transparent via-slate-700/30 to-transparent"></div>
          
          {/* Word display */}
          <div className="relative z-10 px-8 py-12 rounded-2xl bg-slate-900/20 backdrop-blur-sm border border-slate-800/30 shadow-2xl">
            {renderWord(words[currentIndex])}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-slate-800/50 mx-6 mb-6 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Controls */}
        <div className="p-6 bg-slate-900/30 backdrop-blur-sm border-t border-slate-800/50">
          <div className="max-w-4xl mx-auto">
            {/* Main controls */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              {/* Restart */}
              <button
                onClick={() => { setCurrentIndex(0); setIsPlaying(false) }}
                className="w-12 h-12 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-slate-300 transition-all duration-200 group"
                title="Restart (R)"
              >
                <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              {/* Skip back */}
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 10))}
                className="w-12 h-12 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-slate-300 transition-all duration-200"
                title="Skip back 10 words (←)"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11,18V6L14.5,12M6.5,12L10,6V18H11.5L7,12H6.5Z" />
                </svg>
              </button>
              
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className={`w-16 h-16 rounded-full bg-gradient-to-r ${isPlaying ? 'from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-500/25' : 'from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-500/25'} hover:shadow-lg flex items-center justify-center text-white transition-all duration-200 transform hover:scale-105`}
                title="Play/Pause (Space)"
              >
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
              <button
                onClick={() => setCurrentIndex(prev => Math.min(words.length - 1, prev + 10))}
                className="w-12 h-12 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-slate-300 transition-all duration-200"
                title="Skip forward 10 words (→)"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13,6V18L9.5,12M17.5,12L14,18V6H12.5L17,12H17.5Z" />
                </svg>
              </button>
            </div>
            
            {/* Secondary controls */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFontSize(prev => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-slate-300 transition-all duration-200"
                  title="Smaller font ([)"
                >
                  <span className="text-xs font-medium">A-</span>
                </button>
                <span className="text-slate-400 font-light px-2">Font</span>
                <button
                  onClick={() => setFontSize(prev => Math.min(6, prev + 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-slate-300 transition-all duration-200"
                  title="Larger font (])"
                >
                  <span className="text-xs font-medium">A+</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setWpm(prev => Math.max(100, prev - 25))}
                  className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-slate-300 transition-all duration-200"
                  title="Slower (↓)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-slate-400 font-light px-2">Speed</span>
                <button
                  onClick={() => setWpm(prev => Math.min(1000, prev + 25))}
                  className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-slate-300 transition-all duration-200"
                  title="Faster (↑)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex justify-center items-center space-x-8 mt-6 text-sm">
              <div className="text-slate-500">
                Word <span className="text-slate-300 font-medium">{currentIndex + 1}</span> of <span className="text-slate-300 font-medium">{words.length}</span>
              </div>
              {user && (
                <div className="flex items-center space-x-2 text-slate-500">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="font-light">Auto-saving</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Main Library View
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-8">
            <div>
              <h1 className="text-4xl font-light mb-2" style={{ fontFamily: '"SF Pro Display", system-ui, sans-serif' }}>
                Speed<span className="text-emerald-400 font-medium">Read</span>
              </h1>
              <p className="text-slate-400 font-light">Advanced speed reading for professionals</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-slate-300 text-sm font-medium">{user.email}</div>
                  <div className="text-slate-500 text-xs font-light">Pro Member</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 rounded-lg text-sm font-light text-slate-400 hover:text-slate-300 transition-all duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-lg font-medium text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-200"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Document Library */}
        {user && documents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-light text-slate-300">Your Library</h2>
              <div className="text-sm text-slate-500 font-light">{documents.length} document{documents.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {documents.map((doc, index) => {
                const progress = doc.current_position > 0 ? Math.round((doc.current_position / doc.total_words) * 100) : 0
                return (
                  <div key={doc.id} 
                       className="group bg-slate-900/50 hover:bg-slate-900/70 backdrop-blur-sm border border-slate-800/50 hover:border-slate-700/50 rounded-xl p-5 transition-all duration-200 cursor-pointer transform hover:scale-105 hover:shadow-xl"
                       style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-slate-200 truncate mr-2 group-hover:text-white transition-colors">{doc.title}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteDocument(doc.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-slate-800/50 hover:bg-red-500/20 flex items-center justify-center text-slate-500 hover:text-red-400 transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-slate-400 text-sm font-light mb-2">
                        {doc.word_count?.toLocaleString()} words • {progress > 0 ? `${progress}% complete` : 'Not started'}
                      </div>
                      
                      {progress > 0 && (
                        <div className="w-full bg-slate-800/50 rounded-full h-1.5 mb-3">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => loadDocument(doc)}
                      className="w-full py-2.5 bg-slate-800/50 hover:bg-emerald-600/20 border border-slate-700/50 hover:border-emerald-500/30 rounded-lg text-sm font-medium text-slate-300 hover:text-emerald-400 transition-all duration-200"
                    >
                      {progress > 0 ? 'Continue Reading' : 'Start Reading'}
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
            <h3 className="text-lg font-light text-slate-300 mb-4">Upload Document</h3>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="fileInput"
              />
              <label 
                htmlFor="fileInput" 
                className="group block border-2 border-dashed border-slate-700/50 hover:border-emerald-500/50 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:bg-slate-900/30"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-slate-800/50 group-hover:bg-emerald-500/10 rounded-2xl flex items-center justify-center transition-all duration-300">
                    <svg className="w-8 h-8 text-slate-400 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-slate-300 font-medium group-hover:text-emerald-400 transition-colors mb-1">
                      Drop your document here
                    </div>
                    <div className="text-slate-500 text-sm font-light">
                      Supports PDF, DOCX, and TXT files
                    </div>
                  </div>
                </div>
                
                {/* Upload Progress */}
                {uploadProgress > 0 && (
                  <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
                        <div 
                          className="absolute inset-0 rounded-full border-4 border-emerald-500 transition-all duration-300"
                          style={{ 
                            clipPath: `polygon(0 0, ${uploadProgress}% 0, ${uploadProgress}% 100%, 0% 100%)`,
                            borderTopColor: 'transparent',
                            borderRightColor: uploadProgress >= 50 ? 'transparent' : '#10b981',
                            borderBottomColor: uploadProgress >= 75 ? 'transparent' : '#10b981',
                            borderLeftColor: '#10b981'
                          }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-emerald-400 text-sm font-medium">{uploadProgress}%</span>
                        </div>
                      </div>
                      <div className="text-slate-300 font-medium">
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
            <h3 className="text-lg font-light text-slate-300 mb-4">Paste Text</h3>
            <div className="space-y-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here for instant speed reading..."
                className="w-full h-48 px-4 py-4 bg-slate-900/50 border border-slate-700/50 focus:border-emerald-500/50 rounded-xl text-slate-200 placeholder-slate-500 resize-none focus:outline-none transition-all duration-200 font-light"
                style={{ fontFamily: 'ui-monospace, "SF Mono", Monaco, monospace' }}
              />
              
              {user && (
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Document title (optional)"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 focus:border-emerald-500/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none transition-all duration-200 font-light"
                />
              )}
            </div>
          </div>
        </section>

        {/* Reading Controls */}
        {text && (
          <section className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8">
            <h3 className="text-lg font-light text-slate-300 mb-6">Reading Settings</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {/* Starting Speed */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-slate-400 text-sm font-light">Starting Speed</label>
                  <span className="text-emerald-400 font-medium text-sm">{wpm} WPM</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="25"
                  value={wpm}
                  onChange={(e) => setWpm(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer slider-emerald"
                />
              </div>
              
              {/* Speed Ramp */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-slate-400 text-sm font-light">Speed Ramp</label>
                  <span className="text-emerald-400 font-medium text-sm">
                    {rampSpeed === 0 ? 'Off' : `+${rampSpeed}/min`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={rampSpeed}
                  onChange={(e) => setRampSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer slider-emerald"
                />
              </div>
              
              {/* Max Speed */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-slate-400 text-sm font-light">Max Speed</label>
                  <span className="text-emerald-400 font-medium text-sm">{maxWpm} WPM</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1000"
                  step="50"
                  value={maxWpm}
                  onChange={(e) => setMaxWpm(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer slider-emerald"
                />
              </div>
              
              {/* Font Size */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-slate-400 text-sm font-light">Font Size</label>
                  <span className="text-emerald-400 font-medium text-sm">{fontSizeLabels[fontSize]}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer slider-emerald"
                />
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <div className="text-slate-400 text-sm font-light">
                <span className="text-slate-300 font-medium">{parseText(text).length.toLocaleString()}</span> words • 
                <span className="text-slate-300 font-medium ml-1">{Math.ceil(parseText(text).length / wpm)}</span> minute read
              </div>
              
              <div className="flex items-center space-x-3">
                {user && (
                  <button
                    onClick={saveDocument}
                    className="px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 rounded-xl font-medium text-slate-300 hover:text-slate-200 transition-all duration-200"
                  >
                    Save Document
                  </button>
                )}
                
                <button
                  onClick={startReading}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-xl font-medium text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 transform hover:scale-105"
                >
                  Start Speed Reading
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
      
      {/* Custom CSS for sliders */}
      <style jsx>{`
        .slider-emerald::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          cursor: pointer;
          border: 2px solid #064e3b;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
        
        .slider-emerald::-webkit-slider-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          background: #1e293b;
          border-radius: 4px;
        }
        
        .slider-emerald::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          cursor: pointer;
          border: 2px solid #064e3b;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
        
        .slider-emerald::-moz-range-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          background: #1e293b;
          border-radius: 4px;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.5s ease-out forwards;
        }
      `}</style>
    </main>
  )
}