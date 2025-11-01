// Type definitions for Electron API
declare global {
  interface Window {
    electronAPI: {
      downloadTrack: (data: { url: string; filename: string; downloadPath: string; preferredFormat?: 'flac' | 'mp3' }) => Promise<{ success: boolean; path?: string; filename?: string; error?: string }>
      selectDownloadFolder: () => Promise<string | null>
      getDownloadFolder: () => Promise<string>
      setDownloadFolder: (folderPath: string) => Promise<boolean>
      cancelDownload: (data: { filename: string; downloadPath?: string }) => Promise<{ success: boolean; error?: string }>
      revealInFolder: (filePath: string) => Promise<{ success: boolean; error?: string }>
      ensureDirectory: (dirPath: string) => Promise<{ success: boolean; error?: string }>
      onDownloadProgress: (callback: (data: { filename: string; progress: number; status?: string }) => void) => void
      removeDownloadProgressListener: () => void
      getDownloadFormat: () => Promise<'flac' | 'mp3'>
      setDownloadFormat: (format: 'flac' | 'mp3') => Promise<boolean>
      // Update management
      checkForUpdates: () => Promise<{ success: boolean }>
      getUpdateInfo: () => Promise<{ version: string; releaseDate: string; releaseNotes: string } | null>
      downloadUpdate: () => Promise<{ success: boolean; error?: string }>
      installUpdate: () => Promise<{ success: boolean; error?: string }>
      onUpdateAvailable: (callback: (info: { version: string; releaseDate: string; releaseNotes: string }) => void) => void
      onUpdateNotAvailable: (callback: () => void) => void
      onUpdateError: (callback: (error: { message: string }) => void) => void
      onUpdateDownloadProgress: (callback: (progress: { percent: number; transferred: number; total: number }) => void) => void
      onUpdateDownloaded: (callback: (info: { version: string }) => void) => void
      removeUpdateListeners: () => void
    }
  }
}

export {}
