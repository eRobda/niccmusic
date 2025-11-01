import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert cover UUID to Tidal image URL
export function getCoverImageUrl(coverId: string, size: '160x160' | '640x640' | '750x750' = '640x640'): string {
  if (!coverId) return ''
  
  // Format UUID: 4dc53c11-b355-42dd-b9d3-721591c67b59
  // To: 4dc53c11/b355/42dd/b9d3/721591c67b59
  const formattedId = coverId.replace(/-/g, '/')
  return `https://resources.tidal.com/images/${formattedId}/${size}.jpg`
}

// Format duration from seconds to MM:SS
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Generate safe filename
export function generateFilename(artist: string, title: string, extension: string = 'flac'): string {
  const safeArtist = artist.replace(/[<>:"/\\|?*]/g, '')
  const safeTitle = title.replace(/[<>:"/\\|?*]/g, '')
  return `${safeArtist} - ${safeTitle}.${extension}`
}

// Get quality badge color
export function getQualityColor(quality: string): string {
  switch (quality) {
    case 'HIRES_LOSSLESS':
      return 'bg-purple-500'
    case 'LOSSLESS':
      return 'bg-green-500'
    case 'HIGH':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

// Get quality display name
export function getQualityDisplayName(quality: string): string {
  switch (quality) {
    case 'HIRES_LOSSLESS':
      return 'Hi-Res Lossless'
    case 'LOSSLESS':
      return 'Lossless'
    case 'HIGH':
      return 'High'
    default:
      return quality
  }
}
