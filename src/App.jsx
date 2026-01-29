import { useState, useEffect, useRef, useCallback } from 'react'
import { Analytics } from '@vercel/analytics/react'

const App = () => {
  const [isSlapActive, setIsSlapActive] = useState(false)
  const [slapVideoKey, setSlapVideoKey] = useState(0)
  const [flashFrame, setFlashFrame] = useState(false)
  const [currentFlashFrame, setCurrentFlashFrame] = useState(0)
  const [clickCount, setClickCount] = useState(0)
  const [musicActive, setMusicActive] = useState(false)
  const [bgMusicActive, setBgMusicActive] = useState(true) // Background music enabled by default
  const [hasInteracted, setHasInteracted] = useState(false) // Track if user has interacted
  const [creditsOpen, setCreditsOpen] = useState(false)

  const loopVideoRef = useRef(null)
  const slapVideoRef = useRef(null)
  const audioRefs = useRef([])
  const musicRef = useRef(null)
  const bgMusicRef = useRef(null) // Background music reference
  const lastInteractionTime = useRef(0)
  const flashTimeoutRef = useRef(null)
  const frameSequenceTimeoutRef = useRef(null)

  // Spam detection settings
  const SPAM_THRESHOLD = 200 // milliseconds - if interactions are faster than this, use flash
  const FRAME_DURATION = 35 // milliseconds - duration for each frame in sequence

  // Load click count from localStorage on mount
  useEffect(() => {
    const savedCount = localStorage.getItem('slapClickCount')
    console.log('Loading saved count:', savedCount)
    if (savedCount && savedCount !== 'null') {
      const parsedCount = parseInt(savedCount, 10)
      if (!isNaN(parsedCount)) {
        setClickCount(parsedCount)
      }
    }
  }, [])

  // Save click count to localStorage whenever it changes
  useEffect(() => {
    if (clickCount > 0) {
      localStorage.setItem('slapClickCount', clickCount.toString())
    }
  }, [clickCount])

  // Initialize music
  useEffect(() => {
    musicRef.current = new Audio('/audio/trickal.mp3')
    musicRef.current.loop = true
    musicRef.current.volume = 0.5

    // Initialize background music
    bgMusicRef.current = new Audio('/audio/bg_music.mp3')
    bgMusicRef.current.loop = true
    bgMusicRef.current.volume = 0.3 // Lower volume for background music

    return () => {
      if (musicRef.current) {
        musicRef.current.pause()
        musicRef.current.currentTime = 0
      }
      if (bgMusicRef.current) {
        bgMusicRef.current.pause()
        bgMusicRef.current.currentTime = 0
      }
    }
  }, [])

  // Handle music toggle
  const toggleMusic = useCallback(() => {
    if (musicRef.current) {
      if (musicActive) {
        musicRef.current.pause()
      } else {
        musicRef.current.play().catch(console.error)
      }
      setMusicActive(!musicActive)
    }
  }, [musicActive])

  // Handle background music toggle
  const toggleBgMusic = useCallback(() => {
    if (bgMusicRef.current) {
      if (bgMusicActive) {
        bgMusicRef.current.pause()
      } else if (hasInteracted) {
        // Only play if user has already interacted
        bgMusicRef.current.play().catch(console.error)
      }
      setBgMusicActive(!bgMusicActive)
    }
  }, [bgMusicActive, hasInteracted])

  // Start background music on first interaction
  const startBgMusic = useCallback(() => {
    if (bgMusicRef.current && bgMusicActive && !hasInteracted) {
      bgMusicRef.current.play().catch(console.error)
      setHasInteracted(true)
    }
  }, [bgMusicActive, hasInteracted])

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error)
    } else {
      document.exitFullscreen().catch(console.error)
    }
  }, [])

  // Handle credits toggle
  const toggleCredits = useCallback(() => {
    setCreditsOpen(!creditsOpen)
  }, [creditsOpen])

  // Initialize audio references
  useEffect(() => {
    audioRefs.current = Array.from({ length: 5 }, (_, i) => {
      const audio = new Audio(`/audio/slap${i + 1}.mp3`)
      audio.preload = 'auto'
      return audio
    })

    return () => {
      // Cleanup audio references
      audioRefs.current.forEach(audio => {
        audio.pause()
        audio.currentTime = 0
      })
    }
  }, [])

  // Preload images to prevent flicker
  useEffect(() => {
    const imagesToPreload = [
      '/img/arm1.png',
      '/img/img2.png',
      '/img/arm3.png'
    ]

    imagesToPreload.forEach(src => {
      const img = new Image()
      img.src = src
    })
  }, [])

  // Play random slap sound
  const playRandomSlapSound = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * 5)
    const audio = audioRefs.current[randomIndex]

    if (audio) {
      // Clone and play to allow overlapping sounds
      const audioClone = audio.cloneNode()
      audioClone.play().catch(console.error)
    }
  }, [])

  // Handle slap interaction
  const triggerSlap = useCallback(() => {
    const currentTime = Date.now()
    const timeSinceLastInteraction = currentTime - lastInteractionTime.current

    // Start background music on first interaction
    startBgMusic()

    // Increment click counter
    setClickCount(prev => prev + 1)

    // Always play sound for immediate feedback
    playRandomSlapSound()

    // Check if this is a rapid click (spam)
    const isRapidClick = timeSinceLastInteraction < SPAM_THRESHOLD && lastInteractionTime.current > 0

    if (isRapidClick) {
      // RAPID CLICKS: Play frame sequence animation

      // Clear any existing timeouts
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current)
      }
      if (frameSequenceTimeoutRef.current) {
        clearTimeout(frameSequenceTimeoutRef.current)
      }

      // Start frame sequence: arm1 -> img2 -> arm3
      setFlashFrame(true)
      setCurrentFlashFrame(0) // arm1

      // Show img2 after FRAME_DURATION
      frameSequenceTimeoutRef.current = setTimeout(() => {
        setCurrentFlashFrame(1) // img2

        // Show arm3 after another FRAME_DURATION
        frameSequenceTimeoutRef.current = setTimeout(() => {
          setCurrentFlashFrame(2) // arm3

          // Hide all frames after final frame
          flashTimeoutRef.current = setTimeout(() => {
            setFlashFrame(false)
          }, FRAME_DURATION)
        }, FRAME_DURATION)
      }, FRAME_DURATION)

    } else {
      // NORMAL CLICKS: Play full slap video
      setIsSlapActive(true)
      setSlapVideoKey(prev => prev + 1) // Force video restart

      // Reset slap video to beginning and play
      if (slapVideoRef.current) {
        slapVideoRef.current.currentTime = 0
        slapVideoRef.current.playbackRate = 1.0
        slapVideoRef.current.play().catch(console.error)
      }
    }

    lastInteractionTime.current = currentTime
  }, [playRandomSlapSound, startBgMusic])

  // Handle slap video end
  const handleSlapVideoEnd = useCallback(() => {
    setIsSlapActive(false)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current)
      }
      if (frameSequenceTimeoutRef.current) {
        clearTimeout(frameSequenceTimeoutRef.current)
      }
    }
  }, [])

  // Set up event listeners
  useEffect(() => {
    const handleInteraction = (e) => {
      e.preventDefault()
      triggerSlap()
    }

    // Add event listeners for mouse and keyboard
    document.addEventListener('click', handleInteraction)
    document.addEventListener('keydown', handleInteraction)

    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
    }
  }, [triggerSlap])

  // Handle loop video setup
  useEffect(() => {
    if (loopVideoRef.current) {
      loopVideoRef.current.play().catch(console.error)
    }
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Background Loop Video - Always playing */}
      <video
        ref={loopVideoRef}
        className="absolute inset-0 w-full h-full object-cover z-10"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/vdo/loop.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Slap Video Overlay - For normal clicks */}
      {isSlapActive && (
        <video
          key={slapVideoKey}
          ref={slapVideoRef}
          className="absolute inset-0 w-full h-full object-cover z-20"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={handleSlapVideoEnd}
          onError={(e) => {
            console.error('Slap video error:', e)
            setIsSlapActive(false)
          }}
        >
          <source src="/vdo/vdo_slap_full.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Flash Frame Sequence - For rapid clicks */}
      {flashFrame && (
        <>
          {/* Arm overlay frames with transparency - full width coverage */}
          {currentFlashFrame === 0 && (
            <img
              src="/img/arm1.png"
              className="absolute inset-0 w-full h-full object-cover z-60"
              alt="arm wind-up"
            />
          )}

          {currentFlashFrame === 1 && (
            <img
              src="/img/img2.png"
              className="absolute inset-0 w-full h-full object-cover z-60"
              alt="slap impact"
            />
          )}

          {currentFlashFrame === 2 && (
            <img
              src="/img/arm3.png"
              className="absolute inset-0 w-full h-full object-cover z-60"
              alt="arm follow-through"
            />
          )}
        </>
      )}

      {/* Invisible interaction overlay to ensure clicks are captured */}
      <div className="absolute inset-0 z-70 cursor-pointer" />

      {/* Instructions and Counter overlay */}
      <div className="absolute top-6 left-8 z-80 text-black pl-6 pr-4 py-4 rounded-lg pointer-events-none font-serif">
        {/* PC/Desktop text - hidden on mobile */}
        <div className="hidden sm:block text-4xl font-black mb-4 tracking-widest drop-shadow-2xl italic">
          PRESS ANY KEY TO WAKE NER UP!
        </div>
        {/* Mobile text - only visible on mobile */}
        <div className="block sm:hidden text-xl font-black mb-4 tracking-widest drop-shadow-2xl italic">
          <span className="block">TAP ANYWHERE TO</span>
          <span className="block">WAKE NER UP!</span>
        </div>
        <div className="text-lg sm:text-2xl font-extrabold drop-shadow-xl italic">
          Spikip: {clickCount.toLocaleString()}
        </div>
      </div>

      {/* Music Toggle Button - Top Right */}
      <button
        className="absolute top-8 sm:top-4 right-16 sm:right-12 z-80 flex items-center space-x-2 sm:space-x-1 p-6 sm:p-3 rounded-lg transition-all"
        onClick={toggleMusic}
      >
        {[1, 2, 3, 4, 5].map((bar) => (
          <div
            key={bar}
            className={`indicator-line ${musicActive ? "active" : ""}`}
            style={{ "--animation-order": bar }}
          />
        ))}
      </button>

      {/* Background Music Mute/Unmute Button - Top Right (right of music button) */}
      <button
        className="absolute top-8 sm:top-4 right-4 z-80 p-3 sm:p-2 rounded-lg transition-all text-black hover:bg-white hover:bg-opacity-20"
        onClick={toggleBgMusic}
        title={bgMusicActive ? "Mute background music" : "Unmute background music"}
      >
        {bgMusicActive ? (
          // Musical note icon (unmuted)
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="sm:w-6 sm:h-6">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        ) : (
          // Musical note with line through it (muted)
          <div className="relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="sm:w-6 sm:h-6">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            {/* Diagonal line through the note */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-0.5 bg-black transform rotate-45"></div>
            </div>
          </div>
        )}
      </button>

      {/* Fullscreen Button - Bottom Right */}
      <button
        className="absolute bottom-4 right-4 z-80 p-3 sm:p-2 rounded-lg transition-all text-white"
        onClick={toggleFullscreen}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="sm:w-8 sm:h-8">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
        </svg>
      </button>

      {/* Credits Button - Bottom Right (above fullscreen) */}
      <button
        className="absolute bottom-4 left-4 z-80 p-3 sm:p-2 rounded-lg transition-all text-white"
        onClick={toggleCredits}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="sm:w-6 sm:h-6">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-6h2v6zm0-8h-2V7h2v4z" />
        </svg>
      </button>

      {/* Credits Slide-up Panel */}
      <div
        className={`fixed bottom-0 left-0 w-80 sm:w-64 bg-white rounded-tr-lg shadow-2xl transform transition-transform duration-300 z-[90] ${creditsOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="pl-8 pr-6 py-6 sm:pl-6 sm:pr-4 sm:py-5 text-left">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Credits
            </h3>

            <button
              onClick={toggleCredits}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close credits"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 
                   10.59 12 5 17.59 6.41 19 
                   12 13.41 17.59 19 19 17.59 
                   13.41 12z"/>
              </svg>
            </button>
          </div>

          {/* Credits content */}
          <div className="space-y-4 text-gray-700">
            {/* Developer Links */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide mb-2">
                Developer
              </p>
              <div className="flex items-center space-x-6">
                {/* GitHub Link */}
                <a 
                  href='https://github.com/SwastikSharma15' 
                  rel="noreferrer noopener" 
                  target="_blank"
                  className="flex items-center text-sm opacity-80 hover:opacity-100 hover:text-blue-600 transition-colors cursor-pointer pointer-events-auto"
                  title="GitHub Profile"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
                
                {/* Portfolio Link */}
                <a 
                  href='https://swastikmacolio.vercel.app/' 
                  rel="noreferrer noopener" 
                  target="_blank"
                  className="flex items-center text-sm opacity-80 hover:opacity-100 hover:text-blue-600 transition-colors cursor-pointer pointer-events-auto"
                  title="Portfolio Website"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  Portfolio
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide mb-2">
                Game
              </p>
              <a 
                href='https://memelru.itch.io/nerbollttagoo' 
                rel="noreferrer noopener" 
                target="_blank"
                className="text-sm opacity-80 hover:opacity-100 hover:text-blue-600 transition-colors cursor-pointer underline block pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                Nerbollttagoo
              </a>
              <a 
                href='https://www.youtube.com/watch?v=7s-DU9e-n-8' 
                rel="noreferrer noopener" 
                target="_blank"
                className="text-sm opacity-80 hover:opacity-100 hover:text-blue-600 transition-colors cursor-pointer underline block pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                Trickal: Chibi Go
              </a>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide mb-2">
                Music
              </p>
              <a 
                href='https://www.instagram.com/reel/DThIGTCCNNl/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==' 
                rel="noreferrer noopener" 
                target="_blank"
                className="text-sm opacity-80 hover:opacity-100 hover:text-blue-600 transition-colors cursor-pointer underline block pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <span className="block">Instagram Post</span>
                <span className="block text-xs opacity-70">
                  by Cuayo09 (idk who made it tho)
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Vercel Web Analytics */}
      <Analytics />

    </div>
  )
}

export default App