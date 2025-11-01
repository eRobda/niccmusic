import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, User, Disc, Music, Calendar, Play, Clock } from 'lucide-react'
import { Artist, getArtistDetail, getTrackDetail, getBestQuality } from '@/lib/api'
import { getCoverImageUrl, formatDuration, getQualityColor, getQualityDisplayName } from '@/lib/utils'

interface ArtistDetailProps {
  artist: Artist
  onBack: () => void
  onDownload: (track: any) => void
  onAlbumClick: (album: any) => void
  onPlay: (track: any, downloadUrl: string, source?: 'track-detail' | 'album-detail' | 'other', playlist?: any[], currentIndex?: number) => void
}

interface TopTrackItemProps {
  track: any
  trackIndex: number
  playlist: any[]
  onPlay: (track: any, downloadUrl: string, source?: 'track-detail' | 'album-detail' | 'other', playlist?: any[], currentIndex?: number) => void
  onDownload: (track: any, downloadUrl?: string) => void
}

function TopTrackItem({ track, trackIndex, playlist, onPlay, onDownload }: TopTrackItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoadingPlay, setIsLoadingPlay] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  
  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLoadingPlay) return
    setIsLoadingPlay(true)
    
    try {
      // Extract Track objects from playlist
      const trackPlaylist = playlist.filter(Boolean)
      
      // Ensure track has required structure
      if (!track || !track.id) {
        console.error('Invalid track object:', track)
        setIsLoadingPlay(false)
        return
      }
      
      // Normalize track structure for player (handle artists array vs artist object)
      const normalizedTrack = {
        ...track,
        artist: track.artist || (track.artists && track.artists[0] ? {
          id: track.artists[0].id,
          name: track.artists.map((a: any) => a.name).join(', ')
        } : { id: 0, name: '' }),
        album: track.album || { cover: track.cover || null, title: '' }
      }
      
      // Normalize playlist tracks too
      const normalizedPlaylist = trackPlaylist.map(t => ({
        ...t,
        artist: t.artist || (t.artists && t.artists[0] ? {
          id: t.artists[0].id,
          name: t.artists.map((a: any) => a.name).join(', ')
        } : { id: 0, name: '' }),
        album: t.album || { cover: t.cover || null, title: '' }
      }))
      
      // Show track immediately with real data, but empty URL (will trigger loading state)
      onPlay(normalizedTrack, '', 'other', normalizedPlaylist, trackIndex)
      
      // Load detail in background
      let detail = null
      try {
        const quality = getBestQuality(
          track.audioQuality || 'NORMAL',
          track.mediaMetadata?.tags || []
        )
        try {
          detail = await getTrackDetail(track.id, quality)
        } catch (error: any) {
          try {
            detail = await getTrackDetail(track.id)
          } catch (error2: any) {
            try {
              detail = await getTrackDetail(track.id, 'LOSSLESS')
            } catch (error3: any) {
              try {
                detail = await getTrackDetail(track.id, 'HIGH')
              } catch (error4: any) {
                detail = await getTrackDetail(track.id, 'NORMAL')
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading track detail:', error)
      }
      
      // Check if detail was successfully loaded
      if (!detail) {
        console.error('Failed to load track detail after all retry attempts')
        setIsLoadingPlay(false)
        return
      }
      
      // Find OriginalTrackUrl
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
      
      const originalUrl = findOriginalTrackUrl(detail)
      if (originalUrl) {
        // Normalize track structure for player (handle artists array vs artist object)
        const normalizedTrack = {
          ...track,
          artist: track.artist || (track.artists && track.artists[0] ? {
            id: track.artists[0].id,
            name: track.artists.map((a: any) => a.name).join(', ')
          } : { id: 0, name: '' }),
          album: track.album || { cover: track.cover || null, title: '' }
        }
        
        // Normalize playlist tracks too
        const trackPlaylist = playlist.filter(Boolean)
        const normalizedPlaylist = trackPlaylist.map(t => ({
          ...t,
          artist: t.artist || (t.artists && t.artists[0] ? {
            id: t.artists[0].id,
            name: t.artists.map((a: any) => a.name).join(', ')
          } : { id: 0, name: '' }),
          album: t.album || { cover: t.cover || null, title: '' }
        }))
        
        // Update player with real data and URL
        onPlay(normalizedTrack, originalUrl, 'other', normalizedPlaylist, trackIndex)
      }
    } catch (error) {
      console.error('Error playing track:', error)
    } finally {
      setIsLoadingPlay(false)
    }
  }
  
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isDownloading) return
    setIsDownloading(true)
    
    try {
      // Find OriginalTrackUrl
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
      
      // Get track detail with quality fallbacks
      const quality = getBestQuality(
        track.audioQuality || 'NORMAL',
        track.mediaMetadata?.tags || []
      )
      let detail
      try {
        detail = await getTrackDetail(track.id, quality)
      } catch (error: any) {
        try {
          detail = await getTrackDetail(track.id)
        } catch (error2: any) {
          try {
            detail = await getTrackDetail(track.id, 'LOSSLESS')
          } catch (error3: any) {
            try {
              detail = await getTrackDetail(track.id, 'HIGH')
            } catch (error4: any) {
              detail = await getTrackDetail(track.id, 'NORMAL')
            }
          }
        }
      }
      
      // Check if detail was successfully loaded
      if (!detail) {
        console.error('Failed to load track detail after all retry attempts for download')
        setIsDownloading(false)
        return
      }
      
      const originalUrl = findOriginalTrackUrl(detail)
      if (originalUrl) {
        onDownload(track, originalUrl)
      } else {
        console.error('OriginalTrackUrl not found for download')
      }
    } catch (error) {
      console.error('Error downloading track:', error)
    } finally {
      setIsDownloading(false)
    }
  }
  
  return (
    <div
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-all duration-300 ease-in-out cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
    >
      <div className="w-8 text-center flex items-center justify-center relative h-12">
        <span
          className={`text-muted-foreground text-sm transition-all duration-300 ease-in-out absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
            isHovered || isLoadingPlay
              ? 'opacity-0 scale-75'
              : 'opacity-100 scale-100'
          }`}
        >
          {trackIndex + 1}
        </span>
        <Play
          className={`h-4 w-4 text-primary transition-all duration-300 ease-in-out absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
            isHovered || isLoadingPlay
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-75'
          }`}
        />
      </div>
      <img
        src={getCoverImageUrl(track.album?.cover, '160x160')}
        alt={track.title}
        className="w-12 h-12 rounded object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium" title={track.title}>
          {track.title.length > 70 ? `${track.title.substring(0, 70)}...` : track.title}
        </p>
        <p className="text-sm text-muted-foreground" title={track.artists.map((a: any) => a.name).join(', ')}>
          {(() => {
            const artistsText = track.artists.map((a: any) => a.name).join(', ')
            return artistsText.length > 70 ? `${artistsText.substring(0, 70)}...` : artistsText
          })()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          {formatDuration(track.duration)}
        </Badge>
        <Badge className={`text-xs ${getQualityColor(track.audioQuality)}`}>
          {getQualityDisplayName(track.audioQuality)}
        </Badge>
        {track.explicit && (
          <Badge variant="destructive" className="text-xs">E</Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-primary hover:text-white transition-colors duration-300"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function ArtistDetail({ artist, onBack, onDownload, onAlbumClick, onPlay }: ArtistDetailProps) {
  const [artistDetail, setArtistDetail] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchArtistDetail = async () => {
      setLoading(true)
      try {
        const detail = await getArtistDetail(artist.id)
        setArtistDetail(detail)
      } catch (error) {
        console.error('Error fetching artist detail:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArtistDetail()
  }, [artist])

  const albums = artistDetail?.[0]?.rows?.[0]?.modules?.[0]?.pagedList?.items || []
  const topTracks = artistDetail?.[1] || []
  
  // Debug logging
  console.log('ArtistDetail - artistDetail:', artistDetail)
  console.log('ArtistDetail - albums:', albums)
  console.log('ArtistDetail - topTracks:', topTracks)

  return (
    <div className="max-w-6xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Zpět na výsledky
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start gap-6">
            {artist.picture ? (
              <img
                src={getCoverImageUrl(artist.picture, '750x750')}
                alt={artist.name}
                className="w-48 h-48 rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="w-48 h-48 rounded-full bg-muted flex items-center justify-center shadow-lg">
                <User className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2" title={artist.name}>
                {artist.name.length > 70 ? `${artist.name.substring(0, 70)}...` : artist.name}
              </CardTitle>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline" className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {artist.artistTypes.join(', ')}
                </Badge>
                <Badge variant="outline">
                  Popularita: {artist.popularity}%
                </Badge>
                {artist.artistRoles && (
                  <Badge variant="outline">
                    {artist.artistRoles.map((role: any) => role.category).join(', ')}
                  </Badge>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                <p>ID: {artist.id}</p>
                {artist.url && (
                  <p>
                    <a href={artist.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Zobrazit na Tidal
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Loading indicator */}
      {loading && (
        <Card className="mb-6">
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground">Načítám data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Tracks */}
      {!loading && topTracks.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Top skladby
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topTracks.slice(0, 6).map((track: any, index: number) => (
                <TopTrackItem
                  key={track.id}
                  track={track}
                  trackIndex={index}
                  playlist={topTracks.slice(0, 6)}
                  onPlay={onPlay}
                  onDownload={onDownload}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Albums */}
      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Disc className="h-5 w-5" />
              Diskografie
            </CardTitle>
          </CardHeader>
          <CardContent>
            {albums.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {albums.map((album: any) => (
                  <Card key={album.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onAlbumClick(album)}>
                    <CardHeader className="p-4">
                      <img
                        src={getCoverImageUrl(album.cover, '640x640')}
                        alt={album.title}
                        className="w-full aspect-square rounded-md object-cover mb-3"
                      />
                      <div className="space-y-2">
                        <h3 className="font-medium" title={album.title}>
                          {album.title.length > 70 ? `${album.title.substring(0, 70)}...` : album.title}
                        </h3>
                        <p className="text-sm text-muted-foreground" title={album.artists.map((a: any) => a.name).join(', ')}>
                          {(() => {
                            const artistsText = album.artists.map((a: any) => a.name).join(', ')
                            return artistsText.length > 70 ? `${artistsText.substring(0, 70)}...` : artistsText
                          })()}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(album.releaseDate).getFullYear()}
                          </Badge>
                          {album.audioQuality === 'LOSSLESS' && (
                            <Badge className={`text-xs ${getQualityColor(album.audioQuality)}`}>
                              {getQualityDisplayName(album.audioQuality)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Žádná alba</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
