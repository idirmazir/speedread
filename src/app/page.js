'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export default function Home() {
  const [text, setText] = useState('')
  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [wpm, setWpm] = useState(300)
  const [showReader, setShowReader] = useState(false)
  const [rampSpeed, setRampSpeed] = useState(0)
  const [maxWpm, setMaxWpm] = useState(600)
  const [fontSize, setFontSize] = useState(4)
  const [pdfjs, setPdfjs] = useState(null)
  const intervalRef = useRef(null)

  const fontSizeClasses = {
    1: 'text-2xl md:text-3xl',
    2: 'text-3xl md:text-4xl',
    3: 'text-4xl md:text-5xl',
    4: 'text-5xl md:text-6xl',
    5: 'text-6xl md:text-7xl',
    6: 'text-7xl md:text-8xl',
  }

  const fontSizeLabels = {
    1: 'XS',
    2: 'S',
    3: 'M',
    4: 'L',
    5: 'XL',
    6: 'XXL',
  }

  // Load PDF.js on client side only
  useEffect(() => {
    const loadPdfjs = async () => {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      setPdfjs(pdfjsLib)
    }
    loadPdfjs()
  }, [])

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

  // Handle PDF upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type === 'application/pdf') {
      if (!pdfjs) {
        alert('PDF library still loading, please try again')
        return
      }
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjs.getDocument(arrayBuffer).promise
      let fullText = ''
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map(item => item.str).join(' ')
        fullText += pageText + ' '
      }
      
      setText(fullText.trim())
    } else if (file.type === 'text/plain') {
      const text = await file.text()
      setText(text)
    }
  }

  // Start reading
  const startReading = () => {
    const parsedWords = parseText(text)
    if (parsedWords.length === 0) return
    
    setWords(parsedWords)
    setCurrentIndex(0)
    setShowReader(true)
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

  // Render word with ORP highlight - focal point centered
  const renderWord = (word) => {
    if (!word) return null
    const orp = calculateORP(word)
    const before = word.slice(0, orp)
    const focal = word[orp] || ''
    const after = word.slice(orp + 1)
    
    return (
      <div className={`flex items-center ${fontSizeClasses[fontSize]} font-serif tracking-wide`} style={{ fontFamily: 'Georgia, serif' }}>
        <span className="text-white" style={{ width: '45vw', textAlign: 'right', paddingRight: '2px' }}>{before}</span>
        <span className="text-red-500" style={{ width: 'auto', textAlign: 'center' }}>{focal}</span>
        <span className="text-white" style={{ width: '45vw', textAlign: 'left', paddingLeft: '2px' }}>{after}</span>
      </div>
    )
  }

  // Upload/Input View
  if (!showReader) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-light mb-2 text-center">
            Speed<span className="text-red-500">Read</span>
          </h1>
          <p className="text-gray-500 text-center mb-12">RSVP speed reading for documents</p>
          
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center mb-8 hover:border-red-500 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer">
              <div className="text-4xl mb-4">📄</div>
              <div className="text-gray-400 mb-2">Drop a document or click to upload</div>
              <div className="text-gray-600 text-sm">Supports PDF and TXT</div>
            </label>
          </div>
          
          {/* Text Input */}
          <div className="mb-8">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Or paste your text here..."
              className="w-full h-40 bg-gray-900 border border-gray-700 rounded-xl p-4 text-white resize-none focus:outline-none focus:border-red-500"
            />
          </div>
          
          {/* Controls */}
          <div className="bg-gray-900 rounded-xl p-6 mb-8 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Starting Speed</span>
                <span className="text-red-500 font-semibold">{wpm} WPM</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="25"
                value={wpm}
                onChange={(e) => setWpm(Number(e.target.value))}
                className="w-full mt-4 accent-red-500"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Speed Ramp</span>
                <span className="text-red-500 font-semibold">{rampSpeed === 0 ? 'Off' : `+${rampSpeed} WPM/min`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={rampSpeed}
                onChange={(e) => setRampSpeed(Number(e.target.value))}
                className="w-full mt-4 accent-red-500"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Max Speed (Ramp Limit)</span>
                <span className="text-red-500 font-semibold">{maxWpm} WPM</span>
              </div>
              <input
                type="range"
                min="200"
                max="1000"
                step="50"
                value={maxWpm}
                onChange={(e) => setMaxWpm(Number(e.target.value))}
                className="w-full mt-4 accent-red-500"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Font Size</span>
                <span className="text-red-500 font-semibold">{fontSizeLabels[fontSize]}</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full mt-4 accent-red-500"
              />
            </div>
          </div>
          
          {/* Start Button */}
          <button
            onClick={startReading}
            disabled={!text.trim()}
            className="w-full py-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-colors"
          >
            Start Reading
          </button>
          
          {text && (
            <p className="text-gray-500 text-center mt-4">
              {parseText(text).length} words • ~{Math.ceil(parseText(text).length / wpm)} min
            </p>
          )}
        </div>
      </main>
    )
  }

  // Reader View
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Reader Display */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Focal point guide lines */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-px bg-gray-800" />
        
        {/* Word display */}
        <div className="relative">
          {renderWord(words[currentIndex])}
        </div>
        
        {/* WPM indicator */}
        <div className="absolute bottom-8 right-8 text-gray-600">
          {Math.round(wpm)} wpm
        </div>
        
        {/* Font size indicator */}
        <div className="absolute bottom-8 left-8 text-gray-600">
          Size: {fontSizeLabels[fontSize]}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-gray-900">
        <div 
          className="h-full bg-red-500 transition-all duration-100"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        />
      </div>
      
      {/* Controls */}
      <div className="p-6 bg-gray-950">
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* Restart */}
          <button
            onClick={() => { setCurrentIndex(0); setIsPlaying(false) }}
            className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
          >
            ↺
          </button>
          
          {/* Skip back */}
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 10))}
            className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
          >
            ⏪
          </button>
          
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-2xl"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          
          {/* Skip forward */}
          <button
            onClick={() => setCurrentIndex(prev => Math.min(words.length - 1, prev + 10))}
            className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
          >
            ⏩
          </button>
          
          {/* Font size down */}
          <button
            onClick={() => setFontSize(prev => Math.max(1, prev - 1))}
            className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-sm"
          >
            A-
          </button>
          
          {/* Font size up */}
          <button
            onClick={() => setFontSize(prev => Math.min(6, prev + 1))}
            className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-sm"
          >
            A+
          </button>
          
          {/* Speed down */}
          <button
            onClick={() => setWpm(prev => Math.max(100, prev - 25))}
            className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
          >
            −
          </button>
          
          {/* Speed up */}
          <button
            onClick={() => setWpm(prev => Math.min(1000, prev + 25))}
            className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
          >
            +
          </button>
        </div>
        
        {/* Stats */}
        <div className="flex justify-center gap-8 text-gray-500 text-sm">
          <span>Word {currentIndex + 1} of {words.length}</span>
          <span>~{Math.ceil((words.length - currentIndex) / wpm)} min left</span>
        </div>
        
        {/* Back button */}
        <button
          onClick={() => { setShowReader(false); setIsPlaying(false) }}
          className="mt-4 w-full py-2 text-gray-500 hover:text-white transition-colors"
        >
          ← Back to upload
        </button>
        
        {/* Keyboard shortcuts hint */}
        <div className="mt-4 text-center text-gray-700 text-xs">
          Space: play/pause • ↑↓: speed • ←→: skip • R: restart • [ ]: font size
        </div>
      </div>
    </main>
  )
}