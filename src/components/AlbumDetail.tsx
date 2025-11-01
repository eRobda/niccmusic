import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Play, Clock, Disc, Calendar, Music } from 'lucide-react'
import { Album, getAlbumDetail, getTrackDetail, getBestQuality } from '@/lib/api'
import { getCoverImageUrl, formatDuration, getQualityColor, getQualityDisplayName } from '@/lib/utils'

interface AlbumDetailProps {
  album: Album
  onBack: () => void
  onDownload: (track: any, downloadUrl?: string, overrideDownloadPath?: string) => Promise<void> | void
  onPlay: (track: any, downloadUrl: string, source?: 'track-detail' | 'album-detail' | 'other', playlist?: any[], currentIndex?: number) => void
}

interface AlbumTrackItemProps {
  track: any
  trackIndex: number
  playlist: any[]
  onPlay: (track: any, downloadUrl: string, source?: 'track-detail' | 'album-detail' | 'other', playlist?: any[], currentIndex?: number) => void
  onDownload: (track: any, downloadUrl?: string) => void
}

function AlbumTrackItem({ track, trackIndex, playlist, onPlay, onDownload }: AlbumTrackItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoadingPlay, setIsLoadingPlay] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  
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
      const quality = getBestQuality(track.audioQuality, track.mediaMetadata?.tags || [])
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
  
  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLoadingPlay) return
    setIsLoadingPlay(true)
    
    // Extract Track objects from playlist
    const trackPlaylist = playlist.map(t => t?.item ?? t).filter(Boolean)
    
    // Show track immediately with real data, but empty URL (will trigger loading state)
    onPlay(track, '', 'album-detail', trackPlaylist, trackIndex)
    
    // Load detail in background
    try {
      const quality = getBestQuality(track.audioQuality, track.mediaMetadata?.tags || [])
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
        // Extract Track objects from playlist
        const trackPlaylist = playlist.map(t => t?.item ?? t).filter(Boolean)
        // Update player with real data and URL
        onPlay(track, originalUrl, 'album-detail', trackPlaylist, trackIndex)
      }
    } catch (error) {
      console.error('Error playing track:', error)
    } finally {
      setIsLoadingPlay(false)
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
          {track.trackNumber}
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
        src={getCoverImageUrl(track.album.cover, '160x160')}
        alt={track.album.title}
        className="w-12 h-12 rounded object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{track.title}</p>
        <p className="text-sm text-muted-foreground truncate">
          {track.artist.name}
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

export function AlbumDetail({ album, onBack, onDownload, onPlay }: AlbumDetailProps) {
  const [albumDetail, setAlbumDetail] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [showDownloadAllModal, setShowDownloadAllModal] = useState(false)
  const [defaultFolder, setDefaultFolder] = useState<string>('')
  const [proposedFolder, setProposedFolder] = useState<string>('')
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [isSelecting, setIsSelecting] = useState(false)

  useEffect(() => {
    const fetchAlbumDetail = async () => {
      setLoading(true)
      try {
        const detail = await getAlbumDetail(album.id)
        setAlbumDetail(detail)
      } catch (error) {
        console.error('Error fetching album detail:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlbumDetail()
  }, [album])

  useEffect(() => {
    const loadDefaultFolder = async () => {
      if (!showDownloadAllModal) return
      try {
        const folder = await window.electronAPI.getDownloadFolder()
        setDefaultFolder(folder)
        const clean = (s: string) => s.replace(/[\\/:*?"<>|]/g, '-').trim()
        const sep = folder.includes('\\') ? '\\' : '/'
        const trimEndSep = (p: string) => p.replace(new RegExp(`${sep}+$`), '')
        const joinPath = (base: string, ...parts: string[]) => {
          const b = trimEndSep(base)
          return [b, ...parts].join(sep)
        }
        const pf = joinPath(folder, 'alba', clean(album.title))
        setProposedFolder(pf)
      } catch (e) {
        console.error('Error loading default folder:', e)
      }
    }
    loadDefaultFolder()
  }, [showDownloadAllModal])

  const tracks = Array.isArray(albumDetail)
    ? (albumDetail[1]?.items || [])
    : (albumDetail?.tracks?.items || [])

  const handleConfirmDownloadAll = async () => {
    if (!tracks || tracks.length === 0 || downloadingAll) return
    setShowDownloadAllModal(false)
    setDownloadingAll(true)
    try {
      const folder = selectedFolder || proposedFolder || defaultFolder
      if (!folder) { setDownloadingAll(false); return }
      // ensure the album folder exists before starting
      try { await window.electronAPI.ensureDirectory(folder) } catch (_) {}
      for (const t of tracks) {
        const track = t?.item ?? t
        if (track) {
          await onDownload(track, undefined, folder)
          await new Promise(res => setTimeout(res, 250))
        }
      }
    } catch (e) {
      console.error('Download all failed:', e)
    } finally {
      setDownloadingAll(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Zpět na výsledky
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start gap-6">
            <img
              src={getCoverImageUrl(album.cover, '750x750')}
              alt={album.title}
              className="w-48 h-48 rounded-lg object-cover shadow-lg"
            />
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2" title={album.title}>
                {album.title.length > 70 ? `${album.title.substring(0, 70)}...` : album.title}
              </CardTitle>
              <p className="text-xl text-muted-foreground mb-4" title={album.artists.map(a => a.name).join(', ')}>
                {(() => {
                  const artistsText = album.artists.map(a => a.name).join(', ')
                  return artistsText.length > 70 ? `${artistsText.substring(0, 70)}...` : artistsText
                })()}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Disc className="h-3 w-3" />
                  {album.numberOfTracks} skladeb
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(album.duration)}
                </Badge>
                <Badge className={`${getQualityColor(album.audioQuality)}`}>
                  {getQualityDisplayName(album.audioQuality)}
                </Badge>
                {album.explicit && (
                  <Badge variant="destructive">Explicit</Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(album.releaseDate).getFullYear()}
                </Badge>
              </div>

              <div className="flex gap-3 mt-6">
                <Button size="lg" onClick={() => setShowDownloadAllModal(true)} disabled={downloadingAll}>
                  <Download className="h-4 w-4 mr-2" />
                  {downloadingAll ? 'Stahuji…' : 'Stáhnout vše'}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {showDownloadAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Stáhnout celé album</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Vyberte složku, kam chcete album uložit. Tato volba platí pouze pro toto album.
            </p>

            <div className="mb-6">
              <div className="p-3 rounded-md bg-muted">
                <p className="font-medium truncate">
                  {selectedFolder || proposedFolder || defaultFolder || 'Načítám…'}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={selectedFolder ? 'secondary' : 'default'}>
                    {selectedFolder ? 'Vlastní' : 'Navrhovaná'}
                  </Badge>
                </div>
              </div>

              <div className="mt-3">
                <Button
                  variant="outline"
                  onClick={async () => {
                    setIsSelecting(true)
                    try {
                      const folder = await window.electronAPI.selectDownloadFolder()
                      if (folder) setSelectedFolder(folder)
                    } catch (e) {
                      console.error('Error selecting folder:', e)
                    } finally {
                      setIsSelecting(false)
                    }
                  }}
                  disabled={isSelecting}
                >
                  {isSelecting ? 'Načítám…' : 'Vybrat složku'}
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowDownloadAllModal(false)}>Zrušit</Button>
              <Button onClick={handleConfirmDownloadAll} disabled={downloadingAll || !(selectedFolder || defaultFolder)}>
                Stáhnout
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Seznam skladeb
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Načítám seznam skladeb...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tracks.map((item: any, index: number) => {
                const track = item.item
                return (
                  <AlbumTrackItem
                    key={track.id}
                    track={track}
                    trackIndex={index}
                    playlist={tracks}
                    onPlay={onPlay}
                    onDownload={onDownload}
                  />
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
