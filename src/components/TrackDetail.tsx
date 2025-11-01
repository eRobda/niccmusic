import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Clock, Play } from 'lucide-react'
import { Track, getTrackDetail, getBestQuality } from '@/lib/api'
import { getCoverImageUrl, formatDuration, getQualityColor, getQualityDisplayName } from '@/lib/utils'

interface TrackDetailProps {
  track: Track
  onBack: () => void
  onDownload: (track: Track, downloadUrl: string) => void
  onPlay: (track: Track, downloadUrl: string, source?: 'track-detail' | 'album-detail' | 'other') => void
}

export function TrackDetail({ track, onBack, onDownload, onPlay }: TrackDetailProps) {
  const [trackDetail, setTrackDetail] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrackDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const quality = getBestQuality(track.audioQuality, track.mediaMetadata.tags)
        console.log('Fetching track detail with quality:', quality, 'for track:', track.id)
        
        // Try with best quality first
        let detail
        try {
          detail = await getTrackDetail(track.id, quality)
        } catch (error: any) {
          console.warn('Failed to fetch with quality', quality, 'trying without quality...')
          // If it fails, try without quality parameter
          try {
            detail = await getTrackDetail(track.id)
          } catch (error2: any) {
            console.warn('Failed to fetch without quality, trying LOSSLESS...')
            // Try with LOSSLESS
            try {
              detail = await getTrackDetail(track.id, 'LOSSLESS')
            } catch (error3: any) {
              console.warn('Failed to fetch with LOSSLESS, trying HIGH...')
              // Try with HIGH
              try {
                detail = await getTrackDetail(track.id, 'HIGH')
              } catch (error4: any) {
                console.warn('Failed to fetch with HIGH, trying NORMAL...')
                // Last resort - try NORMAL
                detail = await getTrackDetail(track.id, 'NORMAL')
              }
            }
          }
        }
        
        console.log('TrackDetail loaded:', detail)
        console.log('TrackDetail type:', typeof detail, 'Is array:', Array.isArray(detail))
        if (Array.isArray(detail)) {
          console.log('Array length:', detail.length)
          console.log('detail[0]:', detail[0])
          console.log('detail[1]:', detail[1])
          console.log('detail[2]:', detail[2])
          if (detail[2]) {
            console.log('detail[2].OriginalTrackUrl:', detail[2].OriginalTrackUrl)
            console.log('detail[2] keys:', Object.keys(detail[2]))
          }
        } else if (detail) {
          console.log('detail keys:', Object.keys(detail))
          console.log('detail.manifest:', detail.manifest)
          console.log('detail.OriginalTrackUrl:', (detail as any).OriginalTrackUrl)
        }
        if (detail) {
          setTrackDetail(detail)
          setError(null)
        } else {
          throw new Error('No detail data received')
        }
      } catch (error: any) {
        console.error('Error fetching track detail:', error)
        console.error('Track ID:', track.id, 'Track:', track)
        setError(`Nepodařilo se načíst detail skladby: ${error.response?.status === 404 ? 'Skladba nebyla nalezena (404)' : error.message || 'Neznámá chyba'}`)
        setTrackDetail(null)
      } finally {
        setLoading(false)
      }
    }

    fetchTrackDetail()
  }, [track])

  const handleDownload = async () => {
    console.log('handleDownload called, trackDetail:', trackDetail, 'downloading:', downloading)
    if (!trackDetail || downloading) {
      if (!trackDetail) {
        console.error('TrackDetail not loaded or is falsy')
        console.log('trackDetail value:', trackDetail, 'type:', typeof trackDetail)
      }
      return
    }

    setDownloading(true)
    try {
      const downloadUrl = findOriginalTrackUrl(trackDetail)
      console.log('Download URL:', downloadUrl, 'TrackDetail structure:', trackDetail)
      if (downloadUrl) {
        onDownload(track, downloadUrl)
      } else {
        console.error('No download URL found in track detail')
      }
    } catch (error) {
      console.error('Error getting download URL:', error)
    } finally {
      setDownloading(false)
    }
  }

  // Helper function to find OriginalTrackUrl in nested structure
  const findOriginalTrackUrl = (obj: any): string | null => {
    if (!obj) return null
    
    // Check direct property
    if (obj.OriginalTrackUrl) return obj.OriginalTrackUrl
    
    // Check in manifest
    if (obj.manifest?.OriginalTrackUrl) return obj.manifest.OriginalTrackUrl
    
    // If it's an array, check each element
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const url = findOriginalTrackUrl(item)
        if (url) return url
      }
      // Check specific array indices
      if (obj[2]?.OriginalTrackUrl) return obj[2].OriginalTrackUrl
      if (obj[1]?.OriginalTrackUrl) return obj[1].OriginalTrackUrl
      if (obj[0]?.OriginalTrackUrl) return obj[0].OriginalTrackUrl
    }
    
    // Recursively search in object properties
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

  const handlePlay = async () => {
    // If trackDetail is not loaded yet, fetch it first
    if (!trackDetail) {
      setLoading(true)
      try {
        const quality = getBestQuality(track.audioQuality, track.mediaMetadata.tags)
        console.log('Fetching track detail for playback with quality:', quality)
        
        // Try with best quality first
        let detail
        try {
          detail = await getTrackDetail(track.id, quality)
        } catch (error: any) {
          console.warn('Failed to fetch with quality', quality, 'trying without quality...')
          try {
            detail = await getTrackDetail(track.id)
          } catch (error2: any) {
            console.warn('Failed to fetch without quality, trying LOSSLESS...')
            try {
              detail = await getTrackDetail(track.id, 'LOSSLESS')
            } catch (error3: any) {
              console.warn('Failed to fetch with LOSSLESS, trying HIGH...')
              try {
                detail = await getTrackDetail(track.id, 'HIGH')
              } catch (error4: any) {
                console.warn('Failed to fetch with HIGH, trying NORMAL...')
                detail = await getTrackDetail(track.id, 'NORMAL')
              }
            }
          }
        }
        
        if (detail) {
          setTrackDetail(detail)
          const originalUrl = findOriginalTrackUrl(detail)
          if (originalUrl) {
            onPlay(track, originalUrl, 'track-detail')
          } else {
            console.error('No OriginalTrackUrl found in trackDetail')
            setError('Nepodařilo se načíst URL pro přehrávání')
          }
        } else {
          throw new Error('No detail data received')
        }
      } catch (error: any) {
        console.error('Error fetching track detail for playback:', error)
        setError(`Nepodařilo se načíst detail skladby: ${error.response?.status === 404 ? 'Skladba nebyla nalezena (404)' : error.message || 'Neznámá chyba'}`)
      } finally {
        setLoading(false)
      }
      return
    }
    
    // If trackDetail is already loaded, just play
    try {
      const originalUrl = findOriginalTrackUrl(trackDetail)
      console.log('Original URL:', originalUrl, 'TrackDetail structure:', trackDetail)
      if (originalUrl) {
        onPlay(track, originalUrl, 'track-detail')
      } else {
        console.error('No OriginalTrackUrl found in trackDetail')
        setError('Nepodařilo se načíst URL pro přehrávání')
      }
    } catch (error) {
      console.error('Play error:', error)
      setError('Chyba při spuštění přehrávání')
    }
  }

  const getQualityInfo = () => {
    if (!trackDetail) return null
    
    const manifest = trackDetail[1]
    if (!manifest) return null

    return {
      quality: manifest.audioQuality,
      bitDepth: manifest.bitDepth,
      sampleRate: manifest.sampleRate,
    }
  }

  const qualityInfo = getQualityInfo()
  
  // Check if trackDetail has the necessary data
  const originalTrackUrl = trackDetail ? findOriginalTrackUrl(trackDetail) : null
  const hasDownloadUrl = !!originalTrackUrl
  
  if (originalTrackUrl) {
    console.log('Found OriginalTrackUrl:', originalTrackUrl)
  } else {
    console.log('OriginalTrackUrl not found in trackDetail:', trackDetail)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Zpět na výsledky
      </Button>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-md">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <img
              src={getCoverImageUrl(track.album.cover, '750x750')}
              alt={track.album.title}
              className="w-48 h-48 rounded-lg object-cover shadow-lg"
            />
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2" title={track.title}>
                {track.title.length > 70 ? `${track.title.substring(0, 70)}...` : track.title}
              </CardTitle>
              <p className="text-xl text-muted-foreground mb-4" title={track.artist.name}>
                {track.artist.name.length > 70 ? `${track.artist.name.substring(0, 70)}...` : track.artist.name}
              </p>
              <p className="text-lg text-muted-foreground mb-6" title={track.album.title}>
                {track.album.title.length > 70 ? `${track.album.title.substring(0, 70)}...` : track.album.title}
              </p>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(track.duration)}
                  </Badge>
                  <Badge className={`${getQualityColor(track.audioQuality)}`}>
                    {getQualityDisplayName(track.audioQuality)}
                  </Badge>
                  {track.explicit && (
                    <Badge variant="destructive">Explicit</Badge>
                  )}
                  {track.bpm && (
                    <Badge variant="outline">{track.bpm} BPM</Badge>
                  )}
                </div>
                <div className="flex gap-4 items-center">
                  <Button
                    size="lg"
                    onClick={handlePlay}
                    disabled={loading || !hasDownloadUrl}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {loading ? 'Načítám...' : 'Přehrát'}
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleDownload}
                    disabled={loading || downloading || !hasDownloadUrl}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    {downloading ? 'Připravuje se...' : loading ? 'Načítám...' : 'Stáhnout'}
                  </Button>
                  {!hasDownloadUrl && !loading && (
                    <p className="text-sm text-destructive">Nepodařilo se načíst URL pro stahování/přehrávání</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Track Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informace o skladbě</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Popularita:</span>
                  <span>{track.popularity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bitová hloubka:</span>
                  <span>{qualityInfo?.bitDepth ? `${qualityInfo.bitDepth}-bit` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vzorkovací frekvence:</span>
                  <span>{qualityInfo?.sampleRate ? `${qualityInfo.sampleRate} Hz` : ''}</span>
                </div>
              </div>
            </div>

            {/* Album Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informace o albu</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Název alba:</span>
                  <span className="text-right">{track.album.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Umělec:</span>
                  <span className="text-right">{track.artist.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kvalita:</span>
                  <span className="text-right">{getQualityDisplayName(track.audioQuality)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
