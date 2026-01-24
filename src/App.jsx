import { useState, useEffect, useRef, useCallback } from 'react'

const App = () => {
  const [isSlapActive, setIsSlapActive] = useState(false)
  const [slapVideoKey, setSlapVideoKey] = useState(0)
  
  const loopVideoRef = useRef(null)
  const slapVideoRef = useRef(null)
  const audioRefs = useRef([])
  
  // Initialize audio references
  useEffect(() => {
    audioRefs.current = Array.from({ length: 6 }, (_, i) => {
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
  
  // Play random slap sound
  const playRandomSlapSound = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * 6)
    const audio = audioRefs.current[randomIndex]
    
    if (audio) {
      // Clone and play to allow overlapping sounds
      const audioClone = audio.cloneNode()
      audioClone.play().catch(console.error)
    }
  }, [])
  
  // Handle slap interaction
  const triggerSlap = useCallback(() => {
    // Play random slap sound immediately
    playRandomSlapSound()
    
    // Show slap video
    setIsSlapActive(true)
    setSlapVideoKey(prev => prev + 1) // Force video restart
    
    // Reset slap video to beginning and play
    if (slapVideoRef.current) {
      slapVideoRef.current.currentTime = 0
      slapVideoRef.current.play().catch(console.error)
    }
  }, [playRandomSlapSound])
  
  // Handle slap video end
  const handleSlapVideoEnd = useCallback(() => {
    setIsSlapActive(false)
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
      
      {/* Slap Video Overlay */}
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
          <source src="/vdo/vdo_slap.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
      )}
      
      {/* Invisible interaction overlay to ensure clicks are captured */}
      <div className="absolute inset-0 z-30 cursor-pointer" />
      
      {/* Optional: Instructions overlay (can be removed) */}
      <div className="absolute top-4 left-4 z-40 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
        Click anywhere or press any key to slap!
      </div>
    </div>
  )
}

export default App