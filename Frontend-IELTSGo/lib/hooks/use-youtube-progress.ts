import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

// Force rebuild v2 - Debug containerRef callback not being called

interface YouTubeProgressOptions {
  videoId: string
  onProgressUpdate: (data: {
    currentTime: number
    duration: number
    watchedSeconds: number
    progressPercentage: number
    accumulatedTime: number // ✅ Thời gian thực sự xem video (seconds)
    lastPosition: number // ✅ Vị trí hiện tại (để resume watching)
    completed: boolean
  }) => void
  updateInterval?: number // ms between progress updates (default: 5000 = 5s)
  autoPlay?: boolean
  startPosition?: number // ✅ Vị trí bắt đầu (resume from last position)
}

interface YouTubePlayer {
  playVideo: () => void
  pauseVideo: () => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  destroy: () => void
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady?: () => void
  }
}

export function useYouTubeProgress(options: YouTubeProgressOptions) {
  const { videoId, onProgressUpdate, updateInterval = 5000, autoPlay = false, startPosition = 0 } = options
  
  console.log('🎬 [useYouTubeProgress] Hook called with videoId:', videoId, 'startPosition:', startPosition)

  const playerRef = useRef<YouTubePlayer | null>(null)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  // ❌ REMOVED: currentTime/duration state cause re-render loop!
  // ✅ Use refs instead for internal tracking, only expose via return value
  const currentTimeRef = useRef(0)
  const durationRef = useRef(0)
  
  // Callback ref để ensure DOM mounted trước khi init
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    console.log('[YouTube] 📦 containerRef callback called, node:', node ? 'EXISTS' : 'NULL')
    if (node) {
      console.log('[YouTube] ✅ Container ref set:', node)
      setContainer(node)
    }
  }, [])

  // Track accumulated watch time
  const accumulatedTimeRef = useRef(0)
  const lastUpdateTimeRef = useRef(Date.now())
  const lastSentTimeRef = useRef(0)

  // Polling interval for currentTime
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  // Progress update interval
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize YouTube IFrame API
  useEffect(() => {
    console.log('[YouTube] Effect triggered, videoId:', videoId, 'hasContainer:', !!container)
    
    if (!container) {
      console.warn('[YouTube] No container yet, waiting...')
      return
    }
    
    // Don't init if no video ID
    if (!videoId || videoId === '') {
      console.log('[YouTube] No video ID, skipping init')
      return
    }

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) {
        console.error('[YouTube] YT.Player not available')
        return
      }

      try {
        // Destroy existing player if any
        if (playerRef.current) {
          console.log('[YouTube] Destroying existing player before creating new one')
          try {
            playerRef.current.destroy()
            playerRef.current = null
          } catch (e) {
            console.warn('[YouTube] Error destroying old player:', e)
          }
        }

        console.log('[YouTube] Creating new player with videoId:', videoId)
        playerRef.current = new window.YT.Player(container, {
          videoId: videoId,
          host: 'https://www.youtube-nocookie.com',
          playerVars: {
            rel: 0,
            modestbranding: 1,
            fs: 1,
            iv_load_policy: 3,
            cc_load_policy: 0,
            playsinline: 1,
            controls: 1,
            autoplay: autoPlay ? 1 : 0,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
          },
          events: {
            onReady: (event: any) => {
              console.log('[YouTube] Player ready')
              setIsReady(true)
              const dur = event.target.getDuration()
              console.log('[YouTube] 📏 Duration from onReady:', dur, 'type:', typeof dur)
              if (dur > 0) {
                console.log('[YouTube] ✅ Setting duration to:', dur)
                durationRef.current = dur // ✅ Use ref instead of state
              } else {
                console.warn('[YouTube] ⚠️ Duration not available yet, will try in polling')
              }
              
              // ✅ Resume from last position if provided
              // Don't check against dur here because it might be 0 (not ready yet)
              // YouTube will clamp the position automatically if it exceeds duration
              if (startPosition > 0) {
                console.log('[YouTube] 🔄 Resuming from position:', startPosition, 'seconds (duration:', dur, ')')
                event.target.seekTo(startPosition, true)
              } else {
                console.log('[YouTube] ⏭️ Starting from beginning (startPosition:', startPosition, ')')
              }
            },
            onStateChange: (event: any) => {
              const state = event.data
              console.log('[YouTube] 🎬 State changed:', state, '(-1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering)')
              
              if (state === 1) {
                // Playing
                console.log('[YouTube] ▶️ Video PLAYING - starting tracking')
                console.log('[YouTube] Accumulated time before play:', accumulatedTimeRef.current, 'seconds')
                setIsPlaying(true)
                lastUpdateTimeRef.current = Date.now()
                startPolling()
                startProgressUpdates()
              } else if (state === 2 || state === 0) {
                // Paused or Ended
                console.log('[YouTube] ⏸️ Video', state === 2 ? 'PAUSED' : 'ENDED')
                setIsPlaying(false)
                stopPolling()
                
                // Accumulate time before stopping
                if (lastUpdateTimeRef.current > 0) {
                  const elapsed = (Date.now() - lastUpdateTimeRef.current) / 1000
                  accumulatedTimeRef.current += Math.max(0, elapsed)
                  console.log('[YouTube] ⏱️ Accumulated:', accumulatedTimeRef.current.toFixed(1), 'seconds total')
                  lastUpdateTimeRef.current = 0
                }
                
                // Send final update
                sendProgressUpdate(true)
                
                if (state === 0) {
                  // Video ended - mark as completed
                  stopProgressUpdates()
                }
              } else if (state === 3) {
                // Buffering - pause accumulation
                console.log('[YouTube] 🔄 Buffering...')
                if (lastUpdateTimeRef.current > 0) {
                  const elapsed = (Date.now() - lastUpdateTimeRef.current) / 1000
                  accumulatedTimeRef.current += Math.max(0, elapsed)
                  lastUpdateTimeRef.current = Date.now()
                }
              }
            },
            onError: (event: any) => {
              console.error('[YouTube] Player error:', event.data)
            },
          },
        })
      } catch (error) {
        console.error('[YouTube] Failed to initialize player:', error)
      }
    }

    // Load YouTube IFrame API if not loaded
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.async = true
      
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        console.log('[YouTube] API ready')
        initPlayer()
      }
    } else {
      initPlayer()
    }

    return () => {
      console.log('[YouTube] Cleanup - videoId changed or unmount')
      stopPolling()
      stopProgressUpdates()
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
          playerRef.current = null
        } catch (e) {
          console.warn('[YouTube] Error destroying player:', e)
        }
      }
      // Reset state
      setIsReady(false)
      setIsPlaying(false)
      currentTimeRef.current = 0 // ✅ Use ref
      durationRef.current = 0 // ✅ Use ref
      accumulatedTimeRef.current = 0
      lastUpdateTimeRef.current = 0
      lastSentTimeRef.current = 0
    }
  }, [videoId, container]) // Re-run when videoId or container changes!

  // Poll currentTime and duration every second
  const startPolling = useCallback(() => {
    console.log('[YouTube] 🔄 startPolling called - already running:', !!pollingIntervalRef.current)
    if (pollingIntervalRef.current) return

    console.log('[YouTube] ✅ Starting time polling - every 1s')
    pollingIntervalRef.current = setInterval(() => {
      if (!playerRef.current) return

      try {
        const time = playerRef.current.getCurrentTime()
        const dur = playerRef.current.getDuration()
        const state = playerRef.current.getPlayerState()

        console.log('[YouTube] 🔍 Polling tick - time:', time, 'duration:', dur, 'state:', state)

        // ❌ REMOVED: setCurrentTime/setDuration cause re-render loop!
        // ✅ Update refs only (no re-render)
        if (typeof time === 'number' && time >= 0) {
          currentTimeRef.current = time
        }
        if (typeof dur === 'number' && dur > 0) {
          console.log('[YouTube] ✅ Got duration from polling:', dur)
          durationRef.current = dur
        } else {
          console.warn('[YouTube] ⚠️ Duration still not available:', dur, 'type:', typeof dur)
        }

        // Only accumulate when actually playing (state === 1)
        if (state === 1 && lastUpdateTimeRef.current > 0) {
          const now = Date.now()
          const elapsed = (now - lastUpdateTimeRef.current) / 1000
          if (elapsed > 0 && elapsed < 5) { // Sanity check: max 5s per tick
            accumulatedTimeRef.current += elapsed
          }
          lastUpdateTimeRef.current = now
        }
      } catch (error) {
        console.error('[YouTube] Polling error:', error)
      }
    }, 1000) // Poll every 1 second
  }, [])

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])

  // Send progress updates at regular intervals
  const sendProgressUpdate = useCallback((force = false) => {
    console.log('[YouTube] 📤 sendProgressUpdate called - force:', force, 'hasPlayer:', !!playerRef.current)
    
    if (!playerRef.current) {
      console.warn('[YouTube] ⚠️ Skipping progress update - no player')
      return
    }

    // ✅ FIX: Read duration directly from player to avoid stale state
    const dur = playerRef.current.getDuration()
    console.log('[YouTube] 📏 Duration from player:', dur, 'type:', typeof dur)
    
    if (!dur || dur === 0) {
      console.warn('[YouTube] ⚠️ Skipping progress update - duration not available:', dur)
      return
    }

    const now = Date.now()
    const timeSinceLastSent = (now - lastSentTimeRef.current) / 1000

    // Only send if forced OR if enough time has passed (5s minimum)
    if (!force && timeSinceLastSent < 5) {
      console.log('[YouTube] ⏭️ Skipping - too soon since last update:', timeSinceLastSent.toFixed(1), 's')
      return
    }

    try {
      const time = playerRef.current.getCurrentTime()
      
      // Calculate total watched time
      let totalWatched = accumulatedTimeRef.current
      
      // Add current in-flight time if playing
      if (isPlaying && lastUpdateTimeRef.current > 0) {
        const inFlight = (now - lastUpdateTimeRef.current) / 1000
        if (inFlight > 0 && inFlight < 10) {
          totalWatched += inFlight
        }
      }

      const progressPct = dur > 0 ? Math.min((totalWatched / dur) * 100, 100) : 0

      console.log('[YouTube] 📊 Progress update:', {
        currentTime: time.toFixed(1),
        duration: dur,
        watchedSeconds: Math.floor(totalWatched),
        accumulatedTime: accumulatedTimeRef.current.toFixed(1),
        progressPercentage: progressPct.toFixed(2),
      })

      onProgressUpdate({
        currentTime: time,
        duration: dur,
        watchedSeconds: Math.floor(totalWatched),
        progressPercentage: progressPct,
        accumulatedTime: accumulatedTimeRef.current, // ✅ Thời gian thực sự xem
        lastPosition: Math.floor(time), // ✅ Vị trí hiện tại để resume
        completed: progressPct >= 90,
      })

      lastSentTimeRef.current = now
    } catch (error) {
      console.error('[YouTube] Failed to send progress:', error)
    }
  }, [isPlaying, onProgressUpdate])

  const startProgressUpdates = useCallback(() => {
    console.log('[YouTube] 🚀 startProgressUpdates called - already running:', !!progressIntervalRef.current)
    if (progressIntervalRef.current) return

    console.log('[YouTube] ✅ Starting progress updates - interval:', updateInterval, 'ms')
    
    // Send immediately on start
    sendProgressUpdate(true)

    // Then send at regular intervals
    progressIntervalRef.current = setInterval(() => {
      console.log('[YouTube] ⏰ Interval tick - sending progress')
      sendProgressUpdate(false)
    }, updateInterval)
  }, [sendProgressUpdate, updateInterval])

  const stopProgressUpdates = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [])

  // Cleanup on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[YouTube] Tab hidden - sending progress')
        // Accumulate final time
        if (isPlaying && lastUpdateTimeRef.current > 0) {
          const elapsed = (Date.now() - lastUpdateTimeRef.current) / 1000
          accumulatedTimeRef.current += Math.max(0, elapsed)
          lastUpdateTimeRef.current = 0
        }
        sendProgressUpdate(true)
        stopPolling()
        stopProgressUpdates()
      }
    }

    const handleBeforeUnload = () => {
      console.log('[YouTube] Before unload - sending progress')
      if (isPlaying && lastUpdateTimeRef.current > 0) {
        const elapsed = (Date.now() - lastUpdateTimeRef.current) / 1000
        accumulatedTimeRef.current += Math.max(0, elapsed)
      }
      sendProgressUpdate(true)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isPlaying, sendProgressUpdate, stopPolling, stopProgressUpdates])

  return {
    containerRef,
    isReady,
    isPlaying,
    currentTime: currentTimeRef.current, // ✅ Return from ref (no re-render)
    duration: durationRef.current, // ✅ Return from ref (no re-render)
    accumulatedTime: accumulatedTimeRef.current, // ✅ Thời gian thực sự xem (seconds)
    player: playerRef.current,
  }
}

