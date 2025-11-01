import axios from 'axios'

const API_BASE_URL = 'https://maus.qqdl.site'
const ALBUM_API_URL = 'https://hund.qqdl.site'

export interface Track {
  id: number
  title: string
  duration: number
  artist: {
    id: number
    name: string
    type: string
    picture?: string
  }
  artists: Array<{
    id: number
    name: string
    type: string
    picture?: string
  }>
  album: {
    id: number
    title: string
    cover: string
    vibrantColor?: string
  }
  audioQuality: string
  mediaMetadata: {
    tags: string[]
  }
  popularity: number
  explicit: boolean
  bpm?: number
  copyright: string
  url: string
  isrc: string
}

export interface Album {
  id: number
  title: string
  duration: number
  cover: string
  vibrantColor?: string
  artists: Array<{
    id: number
    name: string
    type: string
  }>
  numberOfTracks: number
  releaseDate: string
  audioQuality: string
  mediaMetadata: {
    tags: string[]
  }
  popularity: number
  explicit: boolean
  url: string
  upc: string
}

export interface Artist {
  id: number
  name: string
  picture?: string
  popularity: number
  artistTypes: string[]
  artistRoles: Array<{
    categoryId: number
    category: string
  }>
  url: string
}

export interface SearchResponse {
  limit: number
  offset: number
  totalNumberOfItems: number
  items: Track[]
}

export interface AlbumSearchResponse {
  albums: {
    limit: number
    offset: number
    totalNumberOfItems: number
    items: Album[]
  }
  artists: {
    limit: number
    offset: number
    totalNumberOfItems: number
    items: Artist[]
  }
}

export interface TrackDetailResponse {
  track: Track
  manifest: {
    trackId: number
    audioQuality: string
    manifest: string
    OriginalTrackUrl: string
  }
}

export interface AlbumDetailResponse {
  album: Album
  tracks: {
    limit: number
    offset: number
    totalNumberOfItems: number
    items: Array<{
      item: Track
      type: string
    }>
  }
}

// Search functions
export const searchTracks = async (query: string): Promise<SearchResponse> => {
  const response = await axios.get(`${API_BASE_URL}/search/?s=${encodeURIComponent(query)}`)
  return response.data
}

export const searchAlbums = async (query: string): Promise<AlbumSearchResponse> => {
  const response = await axios.get(`${API_BASE_URL}/search/?al=${encodeURIComponent(query)}`)
  return response.data
}

export const searchArtists = async (query: string): Promise<Artist[]> => {
  const response = await axios.get(`${API_BASE_URL}/search/?a=${encodeURIComponent(query)}`)
  return response.data[0]?.artists?.items || []
}

// Detail functions
export const getTrackDetail = async (id: number, quality?: string): Promise<TrackDetailResponse> => {
  const qualityParam = quality ? `&quality=${quality}` : ''
  const response = await axios.get(`${API_BASE_URL}/track/?id=${id}${qualityParam}`)
  return response.data
}

export const getAlbumDetail = async (id: number): Promise<AlbumDetailResponse> => {
  const response = await axios.get(`${ALBUM_API_URL}/album/?id=${id}`)
  return response.data
}

export const getArtistDetail = async (id: number): Promise<any> => {
  const response = await axios.get(`${ALBUM_API_URL}/artist/?f=${id}`)
  return response.data
}

// Utility function to get the best available quality
export const getBestQuality = (audioQuality: string, tags: string[]): string => {
  if (tags.includes('HIRES_LOSSLESS')) return 'HIRES_LOSSLESS'
  if (audioQuality === 'LOSSLESS' || tags.includes('LOSSLESS')) return 'LOSSLESS'
  if (audioQuality === 'HIGH') return 'HIGH'
  return 'NORMAL'
}

// GitHub Releases API
export interface GitHubRelease {
  tag_name: string
  name: string
  body: string
  published_at: string
  html_url: string
}

export const getLatestRelease = async (owner: string, repo: string): Promise<GitHubRelease> => {
  const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/releases/latest`)
  return response.data
}