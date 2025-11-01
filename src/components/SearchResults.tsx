import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Music, Disc, User } from 'lucide-react'
import { Track, Album, Artist } from '@/lib/api'
import { getCoverImageUrl, formatDuration, getQualityColor, getQualityDisplayName } from '@/lib/utils'

interface SearchResultsProps {
  tracks: Track[]
  albums: Album[]
  artists: Artist[]
  searchType: 'track' | 'album' | 'artist'
  onTrackClick: (track: Track) => void
  onAlbumClick: (album: Album) => void
  onArtistClick: (artist: Artist) => void
  isLoading?: boolean
}

export function SearchResults({
  tracks,
  albums,
  artists,
  searchType,
  onTrackClick,
  onAlbumClick,
  onArtistClick,
  isLoading,
}: SearchResultsProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [currentSearchType, setCurrentSearchType] = useState(searchType)

  useEffect(() => {
    if (searchType !== currentSearchType) {
      // Start fade out
      setIsVisible(false)
      
      // After fade out completes, change content and fade in
      setTimeout(() => {
        setCurrentSearchType(searchType)
        setIsVisible(true)
      }, 150) // Half of the transition duration
    }
  }, [searchType, currentSearchType])
  const renderTrack = (track: Track) => (
    <Card key={track.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onTrackClick(track)}>
      <CardHeader className="p-4">
        <div className="flex items-start gap-4">
          <img
            src={getCoverImageUrl(track.album.cover)}
            alt={track.album.title}
            className="w-16 h-16 rounded-md object-cover"
          />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg" title={track.title}>
              {track.title.length > 70 ? `${track.title.substring(0, 70)}...` : track.title}
            </CardTitle>
            <p className="text-muted-foreground" title={track.artist.name}>
              {track.artist.name.length > 70 ? `${track.artist.name.substring(0, 70)}...` : track.artist.name}
            </p>
            <p className="text-sm text-muted-foreground" title={track.album.title}>
              {track.album.title.length > 70 ? `${track.album.title.substring(0, 70)}...` : track.album.title}
            </p>
            <div className="flex items-center gap-2 mt-2">
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
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )

  const renderAlbum = (album: Album) => (
    <Card key={album.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onAlbumClick(album)}>
      <CardHeader className="p-4">
        <div className="flex items-start gap-4">
          <img
            src={getCoverImageUrl(album.cover)}
            alt={album.title}
            className="w-16 h-16 rounded-md object-cover"
          />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg" title={album.title}>
              {album.title.length > 70 ? `${album.title.substring(0, 70)}...` : album.title}
            </CardTitle>
            <p className="text-muted-foreground" title={album.artists.map(a => a.name).join(', ')}>
              {(() => {
                const artistsText = album.artists.map(a => a.name).join(', ')
                return artistsText.length > 70 ? `${artistsText.substring(0, 70)}...` : artistsText
              })()}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <Disc className="h-3 w-3 mr-1" />
                {album.numberOfTracks} skladeb
              </Badge>
              <Badge className={`text-xs ${getQualityColor(album.audioQuality)}`}>
                {getQualityDisplayName(album.audioQuality)}
              </Badge>
              {album.explicit && (
                <Badge variant="destructive" className="text-xs">E</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )

  const renderArtist = (artist: Artist) => (
    <Card key={artist.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onArtistClick(artist)}>
      <CardHeader className="p-4">
        <div className="flex items-start gap-4">
          {artist.picture ? (
            <img
              src={getCoverImageUrl(artist.picture)}
              alt={artist.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg" title={artist.name}>
              {artist.name.length > 70 ? `${artist.name.substring(0, 70)}...` : artist.name}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {artist.artistTypes.join(', ')}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                Popularita: {artist.popularity}%
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )

  const getResults = () => {
    switch (currentSearchType) {
      case 'track':
        return tracks
      case 'album':
        return albums
      case 'artist':
        return artists
      default:
        return []
    }
  }

  const getEmptyMessage = () => {
    if (isLoading) return 'Hledám…'
    switch (currentSearchType) {
      case 'track':
        return 'Žádné skladby nenalezeny'
      case 'album':
        return 'Žádná alba nenalezena'
      case 'artist':
        return 'Žádní umělci nenalezeni'
      default:
        return 'Žádné výsledky'
    }
  }

  const results = getResults()

  if (results.length === 0) {
    return (
      <div className={`text-center py-12 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{getEmptyMessage()}</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {currentSearchType === 'track' && tracks.map(renderTrack)}
      {currentSearchType === 'album' && albums.map(renderAlbum)}
      {currentSearchType === 'artist' && artists.map(renderArtist)}
    </div>
  )
}
