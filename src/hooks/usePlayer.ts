import { useState, useRef, useCallback, useEffect } from 'react'
import { Track, getTrackDetail, getBestQuality } from '@/lib/api'

type PlaySource = 'track-detail' | 'album-detail' | 'other'

interface UsePlayerReturn {
  currentTrack: Track | null
  isPlaying: boolean
  isLoading: boolean
  playSource: PlaySource | null
  progress: number
  volume: number
  isMuted: boolean
  play: (track: Track, downloadUrl: string, source?: PlaySource, playlist?: Track[], currentIndex?: number) => void
  pause: () => void
  resume: () => void
  next: () => void
  previous: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
}

export function usePlayer(): UsePlayerReturn {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [playSource, setPlaySource] = useState<PlaySource | null>(null)
  const [albumPlaylist, setAlbumPlaylist] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentTrackRef = useRef<Track | null>(null)

  // Keep currentTrack ref in sync
  useEffect(() => {
    currentTrackRef.current = currentTrack
  }, [currentTrack])

  // Initialize audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'metadata'
      
      // Event listeners using refs to avoid stale closures
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current && currentTrackRef.current && currentTrackRef.current.duration > 0) {
          const progress = (audioRef.current.currentTime / currentTrackRef.current.duration) * 100
          if (!isNaN(progress) && isFinite(progress)) {
            setProgress(progress)
          }
        } else {
          setProgress(0)
        }
      })

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
        setProgress(0)
      })

      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e)
        setIsPlaying(false)
      })
    }

    return () => {
      // Only cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
    }
  }, []) // Empty dependency array - only initialize once

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  const play = useCallback(async (track: Track, url: string, source: PlaySource = 'other', playlist?: Track[], currentIndex?: number) => {
    console.log('play() called with track:', track, 'url:', url, 'source:', source, 'playlist:', playlist?.length, 'index:', currentIndex)
    
    if (!audioRef.current) {
      console.error('Audio element not initialized')
      return
    }
    
    try {
      // Stop current playback
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      
      // Set new track state and source
      setCurrentTrack(track)
      currentTrackRef.current = track
      setPlaySource(source)
      
      // Set playlist if provided (for album-detail or other sources with playlist)
      if (playlist && currentIndex !== undefined) {
        setAlbumPlaylist(playlist)
        setCurrentTrackIndex(currentIndex)
      } else {
        // Clear playlist if no playlist provided
        setAlbumPlaylist([])
        setCurrentTrackIndex(-1)
      }
      
      setProgress(0)
      
      // If URL is empty, show loading state and return
      if (!url || url === '') {
        console.log('Empty URL, showing loading state')
        setIsPlaying(false)
        setIsLoading(true)
        return
      }
      
      // URL is available, stop loading and start playing
      setIsLoading(false)
      console.log('Setting audio source to:', url)
      // Set audio source
      audioRef.current.src = url
      
      // Wait for audio to be ready
      return new Promise<void>((resolve, reject) => {
        if (!audioRef.current) {
          reject(new Error('Audio element not available'))
          return
        }
        
        const handleCanPlay = async () => {
          try {
            console.log('Audio can play, starting playback')
            await audioRef.current!.play()
            setIsPlaying(true)
            console.log('Playback started successfully')
            audioRef.current!.removeEventListener('canplay', handleCanPlay)
            audioRef.current!.removeEventListener('error', handleError)
            resolve()
          } catch (error) {
            console.error('Error in play() after canplay:', error)
            setIsPlaying(false)
            audioRef.current!.removeEventListener('canplay', handleCanPlay)
            audioRef.current!.removeEventListener('error', handleError)
            reject(error)
          }
        }
        
        const handleError = (e: Event) => {
          console.error('Audio error during load:', e)
          setIsPlaying(false)
          setIsLoading(false)
          audioRef.current!.removeEventListener('canplay', handleCanPlay)
          audioRef.current!.removeEventListener('error', handleError)
          reject(new Error('Failed to load audio'))
        }
        
        // If already loaded, play immediately
        if (audioRef.current.readyState >= 2) { // HAVE_CURRENT_DATA or higher
          console.log('Audio already loaded, playing immediately')
          audioRef.current.load()
          audioRef.current.play()
            .then(() => {
              setIsPlaying(true)
              console.log('Playback started immediately')
              resolve()
            })
            .catch((error) => {
              console.error('Error playing immediately:', error)
              setIsPlaying(false)
              setIsLoading(false)
              reject(error)
            })
        } else {
          // Wait for audio to load
          console.log('Waiting for audio to load...')
          audioRef.current.load()
          audioRef.current.addEventListener('canplay', handleCanPlay)
          audioRef.current.addEventListener('error', handleError)
        }
      })
    } catch (error) {
      console.error('Error in play():', error)
      setIsPlaying(false)
      setIsLoading(false)
      throw error
    }
  }, [])

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [isPlaying])

  const resume = useCallback(async () => {
    if (audioRef.current && !isPlaying) {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.error('Error resuming audio:', error)
        setIsPlaying(false)
      }
    }
  }, [isPlaying])

  // Helper function to find OriginalTrackUrl in API response
  const findOriginalTrackUrl = (obj: any): string | null => {
    if (!obj) return null
    if (obj.OriginalTrackUrl) return obj.OriginalTrackUrl
    if (obj.manifest?.OriginalTrackUrl) return obj.manifest.OriginalTrackUrl
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const url = findOriginalTrackUrl(item)
        if (url) return url
      }
      if (obj[2]?.OriginalTrackUrl) return obj[2].OriginalTrackUrl
    }
    if (typeof obj === 'object') {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const url = findOriginalTrackUrl(obj[key])
          if (url) return url
        }
      }
    }
    return null
  }

  const next = useCallback(async () => {
    if ((playSource !== 'album-detail' && playSource !== 'other') || albumPlaylist.length === 0 || currentTrackIndex < 0) {
      console.log('Next: Not in playlist mode')
      return
    }

    const nextIndex = currentTrackIndex + 1
    if (nextIndex >= albumPlaylist.length) {
      console.log('Next: Already at last track')
      return
    }

    const nextTrack = albumPlaylist[nextIndex]
    if (!nextTrack) {
      console.error('Next: Track not found at index', nextIndex)
      return
    }

    console.log('Next: Playing track', nextIndex, nextTrack.title)

    // Show track immediately with empty URL (loading state)
    play(nextTrack, '', playSource, albumPlaylist, nextIndex)

    // Load track detail in background
    try {
      const quality = getBestQuality(nextTrack.audioQuality, nextTrack.mediaMetadata?.tags || [])
      let detail
      try {
        detail = await getTrackDetail(nextTrack.id, quality)
      } catch (error: any) {
        try {
          detail = await getTrackDetail(nextTrack.id)
        } catch (error2: any) {
          try {
            detail = await getTrackDetail(nextTrack.id, 'LOSSLESS')
          } catch (error3: any) {
            try {
              detail = await getTrackDetail(nextTrack.id, 'HIGH')
            } catch (error4: any) {
              detail = await getTrackDetail(nextTrack.id, 'NORMAL')
            }
          }
        }
      }

      const originalUrl = findOriginalTrackUrl(detail)
      if (originalUrl) {
        play(nextTrack, originalUrl, playSource, albumPlaylist, nextIndex)
      } else {
        console.error('Next: OriginalTrackUrl not found')
      }
    } catch (error) {
      console.error('Next: Error loading track detail:', error)
    }
  }, [playSource, albumPlaylist, currentTrackIndex, play])

  const previous = useCallback(async () => {
    if ((playSource !== 'album-detail' && playSource !== 'other') || albumPlaylist.length === 0 || currentTrackIndex < 0) {
      console.log('Previous: Not in playlist mode')
      return
    }

    const prevIndex = currentTrackIndex - 1
    if (prevIndex < 0) {
      console.log('Previous: Already at first track')
      return
    }

    const prevTrack = albumPlaylist[prevIndex]
    if (!prevTrack) {
      console.error('Previous: Track not found at index', prevIndex)
      return
    }

    console.log('Previous: Playing track', prevIndex, prevTrack.title)

    // Show track immediately with empty URL (loading state)
    play(prevTrack, '', playSource, albumPlaylist, prevIndex)

    // Load track detail in background
    try {
      const quality = getBestQuality(prevTrack.audioQuality, prevTrack.mediaMetadata?.tags || [])
      let detail
      try {
        detail = await getTrackDetail(prevTrack.id, quality)
      } catch (error: any) {
        try {
          detail = await getTrackDetail(prevTrack.id)
        } catch (error2: any) {
          try {
            detail = await getTrackDetail(prevTrack.id, 'LOSSLESS')
          } catch (error3: any) {
            try {
              detail = await getTrackDetail(prevTrack.id, 'HIGH')
            } catch (error4: any) {
              detail = await getTrackDetail(prevTrack.id, 'NORMAL')
            }
          }
        }
      }

      const originalUrl = findOriginalTrackUrl(detail)
      if (originalUrl) {
        play(prevTrack, originalUrl, playSource, albumPlaylist, prevIndex)
      } else {
        console.error('Previous: OriginalTrackUrl not found')
      }
    } catch (error) {
      console.error('Previous: Error loading track detail:', error)
    }
  }, [playSource, albumPlaylist, currentTrackIndex, play])

  const seek = useCallback((time: number) => {
    if (audioRef.current && currentTrack) {
      audioRef.current.currentTime = time
      setProgress((time / currentTrack.duration) * 100)
    }
  }, [currentTrack])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
  }, [isMuted])

  return {
    currentTrack,
    isPlaying,
    isLoading,
    playSource,
    progress,
    volume,
    isMuted,
    play,
    pause,
    resume,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
  }
}
