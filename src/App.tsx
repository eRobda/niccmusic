import { useState, useEffect } from 'react'
import { SearchBar, SearchType } from '@/components/SearchBar'
import { SearchResults } from '@/components/SearchResults'
import { TrackDetail } from '@/components/TrackDetail'
import { AlbumDetail } from '@/components/AlbumDetail'
import { ArtistDetail } from '@/components/ArtistDetail'
import { Settings } from '@/components/Settings'
import { DownloadQueue, DownloadItem } from '@/components/DownloadQueue'
import { Player } from '@/components/Player'
import { usePlayer } from '@/hooks/usePlayer'
import { searchTracks, searchAlbums, searchArtists, getTrackDetail, getBestQuality } from '@/lib/api'
import { Track, Album, Artist } from '@/lib/api'
import { generateFilename } from '@/lib/utils'
import { Settings as SettingsIcon, Download, X, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type View = 'search' | 'track' | 'album' | 'artist' | 'settings'

function App() {
  const [currentView, setCurrentView] = useState<View>('search')
  const [searchType, setSearchType] = useState<SearchType>('track')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Search results
  const [tracks, setTracks] = useState<Track[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  
  // Current item for detail view
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null)
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null)
  
  // Download queue
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [downloadFolder, setDownloadFolder] = useState<string>('')
  const [showDownloadQueue, setShowDownloadQueue] = useState(false)
  
  // Player
  const player = usePlayer()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSettingsClosing, setIsSettingsClosing] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: string; message: string }>>([])
  const [searchCache, setSearchCache] = useState<Record<string, { tracks?: Track[]; albums?: Album[]; artists?: Artist[] }>>({})

  const showToast = (message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts(prev => [...prev, { id, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  // Initialize download folder
  useEffect(() => {
    const initDownloadFolder = async () => {
      try {
        const folder = await window.electronAPI.getDownloadFolder()
        setDownloadFolder(folder)
      } catch (error) {
        console.error('Error getting download folder:', error)
      }
    }
    initDownloadFolder()
  }, [])

  // Set up download progress listener
  useEffect(() => {
    const handleDownloadProgress = (data: { filename: string; progress: number; status?: string }) => {
      setDownloads(prev => prev.map(download => {
        if (download.filename !== data.filename) return download
        
        // Don't update completed, cancelled, or error downloads
        if (download.status === 'completed' || download.status === 'cancelled' || download.status === 'error') {
          return download
        }
        
        // Only update if still downloading or converting
        if (download.status !== 'downloading' && download.status !== 'converting') {
          return download
        }
        
        // Handle status updates (e.g., converting)
        if (data.status === 'converting') {
          return { ...download, status: 'converting' as const, progress: 0 }
        }
        
        return { ...download, progress: data.progress }
      }))
    }

    window.electronAPI.onDownloadProgress(handleDownloadProgress)

    return () => {
      window.electronAPI.removeDownloadProgressListener()
    }
  }, [])

  const handleSearch = async (query: string, type: SearchType) => {
    setIsLoading(true)
    setSearchQuery(query)
    setSearchType(type)
    
    try {
      // Serve from cache if available
      const cached = searchCache[query]
      if (cached) {
        if (type === 'track' && cached.tracks) {
          setTracks(cached.tracks)
          setAlbums([])
          setArtists([])
          return
        }
        if (type === 'album' && cached.albums) {
          setAlbums(cached.albums)
          setTracks([])
          setArtists([])
          return
        }
        if (type === 'artist' && cached.artists) {
          setArtists(cached.artists)
          setTracks([])
          setAlbums([])
          return
        }
      }
      switch (type) {
        case 'track':
          const trackResults = await searchTracks(query)
          setTracks(trackResults.items)
          setAlbums([])
          setArtists([])
          setSearchCache(prev => ({
            ...prev,
            [query]: { ...(prev[query] || {}), tracks: trackResults.items },
          }))
          break
        case 'album':
          const albumResults = await searchAlbums(query)
          setAlbums(albumResults.albums.items)
          setTracks([])
          setArtists([])
          setSearchCache(prev => ({
            ...prev,
            [query]: { ...(prev[query] || {}), albums: albumResults.albums.items },
          }))
          break
        case 'artist':
          const artistResults = await searchArtists(query)
          setArtists(artistResults)
          setTracks([])
          setAlbums([])
          setSearchCache(prev => ({
            ...prev,
            [query]: { ...(prev[query] || {}), artists: artistResults },
          }))
          break
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchTypeChange = (type: SearchType) => {
    setSearchType(type)
    if (searchQuery && searchQuery.trim().length > 0) {
      const cached = searchCache[searchQuery]
      if (cached && ((type === 'track' && cached.tracks) || (type === 'album' && cached.albums) || (type === 'artist' && cached.artists))) {
        // Use cached results without refetching
        if (type === 'track') { setTracks(cached.tracks || []) ; setAlbums([]); setArtists([]) }
        if (type === 'album') { setAlbums(cached.albums || []) ; setTracks([]); setArtists([]) }
        if (type === 'artist') { setArtists(cached.artists || []) ; setTracks([]); setAlbums([]) }
      } else {
        void handleSearch(searchQuery, type)
      }
    }
  }

  const handleQueryChange = (value: string) => {
    if (value !== searchQuery) {
      // Clear cache when query string changes
      setSearchCache({})
    }
    setSearchQuery(value)
  }

  const handleTrackClick = (track: Track) => {
    setCurrentTrack(track)
    setCurrentView('track')
  }

  const handleAlbumClick = (album: Album) => {
    setCurrentAlbum(album)
    setCurrentView('album')
  }

  const handleArtistClick = (artist: Artist) => {
    setCurrentArtist(artist)
    setCurrentView('artist')
  }

  const handleBackToSearch = () => {
    setCurrentView('search')
    setCurrentTrack(null)
    setCurrentAlbum(null)
    setCurrentArtist(null)
    setIsSettingsOpen(false)
  }

  const handleOpenSettings = () => {
    setIsSettingsOpen(true)
    setCurrentView('settings')
  }

  const handleCloseSettings = () => {
    setIsSettingsClosing(true)
    setIsSettingsOpen(false)
    setTimeout(() => {
      setCurrentView('search')
      setIsSettingsClosing(false)
    }, 250) // Slightly shorter to match opening animation
  }

  const handleToggleDownloadQueue = () => {
    setShowDownloadQueue(!showDownloadQueue)
  }

  const handleDownload = async (track: Track, downloadUrl?: string, overrideDownloadPath?: string) => {
    // Immediately show the download queue panel when a download is initiated
    setShowDownloadQueue(true)

    // Get preferred download format
    let preferredFormat: 'flac' | 'mp3' = 'flac'
    try {
      preferredFormat = await window.electronAPI.getDownloadFormat()
    } catch (error) {
      console.error('Error getting download format:', error)
    }

    // Prepare queue item immediately so it appears at once
    // Use preferred format for filename extension (will be converted if needed)
    const filename = generateFilename(track.artist.name, track.title, preferredFormat)
    const downloadId = `${track.id}-${Date.now()}`
    setDownloads(prev => [
      ...prev,
      {
        id: downloadId,
        filename,
        progress: 0,
        status: 'downloading',
      },
    ])

    // Resolve download URL if not provided
    if (!downloadUrl) {
      try {
        const quality = getBestQuality(track.audioQuality, track.mediaMetadata.tags)
        const detail = await getTrackDetail(track.id, quality)
        const originalUrl = (detail as any)?.manifest?.OriginalTrackUrl ?? (detail as any)?.[2]?.OriginalTrackUrl
        downloadUrl = originalUrl
      } catch (error) {
        console.error('Error getting download URL:', error)
        // Mark this queue item as error
        setDownloads(prev => prev.map(d => d.id === downloadId ? { ...d, status: 'error', error: 'URL nelze získat' } : d))
        return
      }
    }

    if (!downloadUrl) {
      console.error('No download URL available')
      setDownloads(prev => prev.map(d => d.id === downloadId ? { ...d, status: 'error', error: 'URL není k dispozici' } : d))
      return
    }

    try {
      // Always get current download folder (in case it changed in settings)
      const currentDownloadFolder = overrideDownloadPath || downloadFolder || await window.electronAPI.getDownloadFolder()
      const result = await window.electronAPI.downloadTrack({
        url: downloadUrl,
        filename,
        downloadPath: currentDownloadFolder,
        preferredFormat,
      })

      if (result.success) {
        // Update filename with the actual final filename (may have suffix if file existed)
        const finalFilename = result.filename || filename
        setDownloads(prev => prev.map(d => {
          if (d.id !== downloadId) return d
          if (d.status === 'cancelled') return d
          return { ...d, filename: finalFilename, status: 'completed', progress: 100, path: result.path }
        }))
        showToast(`Skladba ${track.title} – ${track.artist.name} se stáhla`)
      } else {
        setDownloads(prev => prev.map(d => {
          if (d.id !== downloadId) return d
          if (d.status === 'cancelled') return d
          return { ...d, status: 'error', error: result.error }
        }))
      }
    } catch (error) {
      setDownloads(prev => prev.map(d => {
        if (d.id !== downloadId) return d
        if (d.status === 'cancelled') return d
        return { ...d, status: 'error', error: 'Stahování se nezdařilo' }
      }))
    }
  }

  const handleCancelDownload = async (id: string) => {
    setDownloads(prev => {
      const current = prev.find(d => d.id === id)
      if (current) {
        // Get download path - use path from item if available, otherwise get current folder
        let downloadPath = downloadFolder
        if (current.path) {
          // Extract folder path from full file path
          const pathSep = current.path.includes('\\') ? '\\' : '/'
          const pathParts = current.path.split(pathSep)
          pathParts.pop() // Remove filename
          downloadPath = pathParts.join(pathSep)
        }
        
        // Cancel download asynchronously
        ;(async () => {
          try {
            if (!downloadPath) {
              downloadPath = await window.electronAPI.getDownloadFolder()
            }
            await (window as any).electronAPI.cancelDownload({ filename: current.filename, downloadPath })
          } catch (_) {}
        })()
      }
      return prev.map(d => d.id === id ? { ...d, status: 'cancelled' as const } : d)
    })
  }

  const handleRetryDownload = async (id: string) => {
    const downloadItem = downloads.find(d => d.id === id)
    if (!downloadItem) return

    // Reset status to downloading
    setDownloads(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'downloading', progress: 0, error: undefined } : d
    ))

    // Try to find the original track to retry the download
    // We need to search through all current results to find the track
    let trackToRetry: Track | null = null
    
    // Search in current tracks
    if (tracks.length > 0) {
      trackToRetry = tracks.find(t => generateFilename(t.artist.name, t.title) === downloadItem.filename) || null
    }
    
    // Search in current album tracks (if we have album detail loaded)
    if (!trackToRetry && currentAlbum && 'tracks' in currentAlbum) {
      const albumTracks = (currentAlbum as any).tracks?.items?.map((item: any) => item.item) || []
      trackToRetry = albumTracks.find((t: Track) => generateFilename(t.artist.name, t.title) === downloadItem.filename) || null
    }

    if (trackToRetry) {
      // Retry with the found track
      await handleDownload(trackToRetry)
    } else {
      // If we can't find the original track, mark as error
      setDownloads(prev => prev.map(d => 
        d.id === id ? { ...d, status: 'error', error: 'Původní skladba nebyla nalezena' } : d
      ))
    }
  }

  const handleClearCompleted = () => {
    setDownloads(prev => prev.filter(d => d.status !== 'completed'))
  }

  const handleRemoveDownload = (id: string) => {
    setDownloads(prev => prev.filter(d => d.id !== id))
  }

  const handleOpenFolder = async () => {
    try {
      // Always get the current download folder from settings (not cached state)
      const folder = await window.electronAPI.getDownloadFolder()
      if (folder) {
        await (window as any).electronAPI.openFolder(folder)
        // Update state for consistency
        setDownloadFolder(folder)
      }
    } catch (error) {
      console.error('Error opening folder:', error)
    }
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'track':
        return currentTrack ? (
          <TrackDetail
            track={currentTrack}
            onBack={handleBackToSearch}
            onDownload={handleDownload}
            onPlay={player.play}
          />
        ) : null
      case 'album':
        return currentAlbum ? (
          <AlbumDetail
            album={currentAlbum}
            onBack={handleBackToSearch}
            onDownload={handleDownload}
            onPlay={player.play}
          />
        ) : null
      case 'artist':
        return currentArtist ? (
          <ArtistDetail
            artist={currentArtist}
            onBack={handleBackToSearch}
            onDownload={handleDownload}
            onAlbumClick={handleAlbumClick}
            onPlay={player.play}
          />
        ) : null
      case 'settings':
        return (
          <Settings onBack={handleCloseSettings} isClosing={isSettingsClosing} />
        )
      default:
        return (
          <div className="space-y-6">
            <SearchBar
              onSearch={handleSearch}
              isLoading={isLoading}
              onTypeChange={handleSearchTypeChange}
              type={searchType}
              query={searchQuery}
              onQueryChange={handleQueryChange}
            />
            <SearchResults
              tracks={tracks}
              albums={albums}
              artists={artists}
              searchType={searchType}
              onTrackClick={handleTrackClick}
              onAlbumClick={handleAlbumClick}
              onArtistClick={handleArtistClick}
              isLoading={isLoading}
            />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="container mx-auto px-4 py-8 pb-32">
        <div className="flex gap-8">
          <div className="flex-1">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl ">
                    <span className="text-primary font-semibold pl-10">NICC</span><span className="text-foreground font-semibold">MUSIC</span>
                  </h1>
                </div>
                 <div className="flex items-center gap-2">
                   <div 
                     className={`transition-all duration-300 ease-in-out transform ${
                       !showDownloadQueue 
                         ? 'translate-x-0 opacity-100 scale-100' 
                         : 'translate-x-4 opacity-0 scale-95 pointer-events-none'
                     }`}
                   >
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={handleToggleDownloadQueue}
                       className="relative"
                     >
                       <Download className="h-5 w-5" />
                       {downloads.length > 0 && (
                         <Badge 
                           variant="destructive" 
                           className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                         >
                           {downloads.length}
                         </Badge>
                       )}
                     </Button>
                   </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={isSettingsOpen ? handleCloseSettings : handleOpenSettings}
                    title={isSettingsOpen ? 'Zavřít nastavení' : 'Otevřít nastavení'}
                    className="relative"
                  >
                    <span className="inline-block w-5 h-5 relative">
                      <SettingsIcon
                        className={`absolute inset-0 h-5 w-5 transition-all duration-250 ease-in-out ${
                          isSettingsOpen ? 'opacity-0 rotate-180 scale-90' : 'opacity-100 rotate-0 scale-100'
                        }`}
                      />
                      <X
                        className={`absolute inset-0 h-5 w-5 transition-all duration-250 ease-in-out ${
                          isSettingsOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-90'
                        }`}
                      />
                    </span>
                  </Button>
                 </div>
              </div>
              
            </div>
            {renderCurrentView()}
          </div>
          
           <div 
             className={`w-80 transition-all duration-300 ease-in-out transform ${
               showDownloadQueue 
                 ? 'translate-x-0 opacity-100' 
                 : 'translate-x-full opacity-0 pointer-events-none'
             }`}
             style={{
               width: showDownloadQueue ? '320px' : '0px',
               overflow: 'hidden'
             }}
           >
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-semibold">Fronta stahování</h2>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={handleToggleDownloadQueue}
               >
                 <X className="h-4 w-4" />
               </Button>
             </div>
             <DownloadQueue
               downloads={downloads}
               onCancel={handleCancelDownload}
               onRetry={handleRetryDownload}
               onClearCompleted={handleClearCompleted}
               onOpenFolder={handleOpenFolder}
               onClearAll={() => setDownloads([])}
               onRemove={handleRemoveDownload}
             />
           </div>
        </div>
        {/* Player */}
        <Player
          currentTrack={player.currentTrack}
          isPlaying={player.isPlaying}
          isLoading={player.isLoading}
          onPlay={() => {}} // Player doesn't need to trigger play from UI
          onPause={player.pause}
          onResume={player.resume}
          onNext={player.next}
          onPrevious={player.previous}
          onSeek={player.seek}
          onVolumeChange={player.setVolume}
          progress={player.progress}
          volume={player.volume}
          isMuted={player.isMuted}
          onToggleMute={player.toggleMute}
          showNavigation={player.playSource !== 'track-detail'}
        />
        
        {/* Toasts */}
        {toasts.length > 0 && (
          <div className="fixed bottom-6 right-6 space-y-2 z-50">
            {toasts.map(t => (
              <div key={t.id} className="toast flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg">
                <CheckCircle className="h-4 w-4" />
                <span>{t.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
