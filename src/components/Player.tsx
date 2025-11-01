import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Loader2 } from 'lucide-react'
import { getCoverImageUrl } from '@/lib/utils'

interface Track {
  id: number
  title: string
  artist: {
    name: string
  }
  album: {
    title: string
    cover: string
  }
  duration: number
  audioQuality: string
}

interface PlayerProps {
  currentTrack: Track | null
  isPlaying: boolean
  isLoading: boolean
  onPlay: (track: Track, downloadUrl: string) => void
  onPause: () => void
  onResume: () => void
  onNext: () => void
  onPrevious: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  progress: number
  volume: number
  isMuted: boolean
  onToggleMute: () => void
  showNavigation?: boolean
}

export function Player({
  currentTrack,
  isPlaying,
  isLoading,
  onPlay,
  onPause,
  onResume,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  progress,
  volume,
  isMuted,
  onToggleMute,
  showNavigation = true,
}: PlayerProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [localProgress, setLocalProgress] = useState(0)

  useEffect(() => {
    if (!isDragging) {
      const validProgress = isNaN(progress) || progress < 0 ? 0 : progress > 100 ? 100 : progress
      setLocalProgress(validProgress)
    }
  }, [progress, isDragging])

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * (currentTrack?.duration || 0)
    onSeek(newTime)
  }

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(1, clickX / rect.width))
      setLocalProgress(percentage * 100)
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(1, clickX / rect.width))
      const newTime = percentage * (currentTrack?.duration || 0)
      onSeek(newTime)
      setIsDragging(false)
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds === undefined || seconds === null || isNaN(seconds) || seconds < 0) {
      return '00:00'
    }
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!currentTrack) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 h-full">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img
              src={getCoverImageUrl(currentTrack.album?.cover || currentTrack.cover || '', '320x320')}
              alt={currentTrack.album?.title || ''}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate" title={currentTrack.title || ''}>
                {currentTrack.title && currentTrack.title.length > 50 ? `${currentTrack.title.substring(0, 50)}...` : (currentTrack.title || '')}
              </p>
              <p className="text-sm text-muted-foreground truncate" title={currentTrack.artist?.name || ''}>
                {currentTrack.artist?.name || '\u00A0'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              {showNavigation && (
                <Button variant="ghost" size="sm" onClick={onPrevious}>
                  <SkipBack className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                onClick={isLoading ? undefined : (isPlaying ? onPause : onResume)}
                disabled={isLoading}
                className="w-10 h-10 rounded-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              {showNavigation && (
                <Button variant="ghost" size="sm" onClick={onNext}>
                  <SkipForward className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center gap-2 w-full max-w-md">
              <span className="text-xs text-muted-foreground w-10">
                {formatTime((localProgress / 100) * (currentTrack.duration || 0))}
              </span>
              <div
                className="flex-1 h-2 bg-muted rounded-full cursor-pointer relative"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${localProgress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(currentTrack.duration)}
              </span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
            <Button variant="ghost" size="sm" onClick={onToggleMute} className="flex items-center justify-center">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <div className="w-20 flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                style={{ alignSelf: 'center' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
