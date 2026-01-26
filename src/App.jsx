import { useState, useEffect, useRef, useCallback } from 'react'

const App = () => {
  const [isSlapActive, setIsSlapActive] = useState(false)
  const [slapVideoKey, setSlapVideoKey] = useState(0)
  const [flashFrame, setFlashFrame] = useState(false)
  const [currentFlashFrame, setCurrentFlashFrame] = useState(0)
  const [clickCount, setClickCount] = useState(0)
  const [musicActive, setMusicActive] = useState(false)
  const [creditsOpen, setCreditsOpen] = useState(false)

  const loopVideoRef = useRef(null)
  const slapVideoRef = useRef(null)
  const audioRefs = useRef([])
  const musicRef = useRef(null)
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

    return () => {
      if (musicRef.current) {
        musicRef.current.pause()
        musicRef.current.currentTime = 0
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
  }, [playRandomSlapSound])

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
          TAP ANYWHERE TO WAKE NER UP!
        </div>
        <div className="text-lg sm:text-2xl font-extrabold drop-shadow-xl italic">
          Spikip: {clickCount.toLocaleString()}
        </div>
      </div>

      {/* Music Toggle Button - Top Right */}
      <button
        className="absolute top-4 right-4 z-80 flex items-center space-x-2 sm:space-x-1 p-6 sm:p-3 rounded-lg transition-all"
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
            <div>
              <a 
                href='https://memelru.itch.io/nerbollttagoo' 
                rel="noreferrer noopener" 
                target="_blank"
                className="text-sm opacity-80 hover:opacity-100 hover:text-blue-600 transition-colors cursor-pointer underline"
              >
                <p className="text-sm font-semibold uppercase tracking-wide">
                  Game
                </p>
              </a>
              <a 
                href='https://www.youtube.com/watch?v=7s-DU9e-n-8' 
                rel="noreferrer noopener" 
                target="_blank"
                className="text-sm opacity-80 hover:opacity-100 hover:text-blue-600 transition-colors cursor-pointer underline"
              >
                <p className="text-sm opacity-80">Trickal: Chibi Go</p>
              </a>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide">
                Music
              </p>
              <a 
                href='https://www.instagram.com/reel/DThIGTCCNNl/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==' 
                rel="noreferrer noopener" 
                target="_blank"
                className="text-sm opacity-80 hover:opacity-100 hover:text-blue-600 transition-colors cursor-pointer underline"
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

    </div>
  )
}

export default App