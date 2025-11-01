import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Download, CheckCircle, XCircle, X, FolderOpen, Trash2, Loader2 } from 'lucide-react'

export interface DownloadItem {
  id: string
  filename: string
  progress: number
  status: 'downloading' | 'completed' | 'error' | 'cancelled' | 'converting'
  error?: string
  path?: string
}

interface DownloadQueueProps {
  downloads: DownloadItem[]
  onCancel: (id: string) => void
  onRetry: (id: string) => void
  onClearCompleted: () => void
  onOpenFolder: () => void
  onClearAll?: () => void
  onRemove?: (id: string) => void
}

export function DownloadQueue({
  downloads,
  onCancel,
  onRetry,
  onClearCompleted,
  onOpenFolder,
  onClearAll,
  onRemove,
}: DownloadQueueProps) {
  const [menuState, setMenuState] = useState<{ x: number; y: number; id: string } | null>(null)
  const [estimatedTimes, setEstimatedTimes] = useState<Record<string, number>>({})
  const progressHistoryRef = useRef<Record<string, Array<{ progress: number; time: number }>>>({})
  
  const activeDownloads = downloads.filter(d => d.status === 'downloading' || d.status === 'converting')
  const completedDownloads = downloads.filter(d => d.status === 'completed')
  const errorDownloads = downloads.filter(d => d.status === 'error')
  const cancelledDownloads = downloads.filter(d => d.status === 'cancelled')

  // Track progress history and calculate estimated time
  useEffect(() => {
    const now = Date.now()
    const activeIds = new Set(activeDownloads.map(d => d.id))
    
    // Clean up history for downloads that are no longer active
    Object.keys(progressHistoryRef.current).forEach(id => {
      if (!activeIds.has(id)) {
        delete progressHistoryRef.current[id]
        setEstimatedTimes(prev => {
          const next = { ...prev }
          delete next[id]
          return next
        })
      }
    })
    
    activeDownloads.forEach((download) => {
      if (download.status === 'downloading' && download.progress > 0) {
        const id = download.id
        if (!progressHistoryRef.current[id]) {
          progressHistoryRef.current[id] = []
        }
        
        const history = progressHistoryRef.current[id]
        const lastEntry = history[history.length - 1]
        
        // Only add new entry if progress changed
        if (!lastEntry || lastEntry.progress !== download.progress) {
          history.push({ progress: download.progress, time: now })
          
          // Keep only last 5 entries for smoother calculation
          if (history.length > 5) {
            history.shift()
          }
          
          // Calculate estimated time if we have at least 2 data points
          if (history.length >= 2) {
            const first = history[0]
            const last = history[history.length - 1]
            const progressDiff = last.progress - first.progress
            const timeDiff = (last.time - first.time) / 1000 // in seconds
            
            if (progressDiff > 0 && timeDiff > 0) {
              const progressPerSecond = progressDiff / timeDiff
              const remainingProgress = 100 - last.progress
              const estimatedSeconds = remainingProgress / progressPerSecond
              
              setEstimatedTimes(prev => ({
                ...prev,
                [id]: estimatedSeconds
              }))
            }
          }
        }
      }
    })
  }, [downloads, activeDownloads])

  // Format time estimate
  const formatTimeEstimate = (seconds: number): string => {
    if (!seconds || seconds < 0 || !isFinite(seconds)) return ''
    
    if (seconds < 60) {
      return `· ${Math.round(seconds)}s`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const secs = Math.round(seconds % 60)
      return `· ${minutes}m ${secs}s`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `· ${hours}h ${minutes}m`
    }
  }

  const getStatusIcon = (status: DownloadItem['status']) => {
    switch (status) {
      case 'downloading':
        return <Download className="h-4 w-4 animate-pulse" />
      case 'converting':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: DownloadItem['status']) => {
    switch (status) {
      case 'downloading':
        return 'bg-blue-500'
      case 'converting':
        return 'bg-yellow-500'
      case 'completed':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'cancelled':
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: DownloadItem['status']) => {
    switch (status) {
      case 'downloading':
        return 'Stahuje se'
      case 'converting':
        return 'Konvertuje se'
      case 'completed':
        return 'Dokončeno'
      case 'error':
        return 'Chyba'
      case 'cancelled':
        return 'Zrušeno'
    }
  }

  if (downloads.length === 0) {
    return (
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Fronta stahování
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenFolder}
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
            {onClearAll && (
              <Button
                size="sm"
                variant="outline"
                onClick={onClearAll}
                title="Vyčistit frontu"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="text-muted-foreground text-sm">
            Žádné stahování není aktivní
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Fronta stahování
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" onMouseDown={() => menuState && setMenuState(null)}>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenFolder}
          >
            <FolderOpen className="h-4 w-4" />
          </Button>
          {downloads.length > 0 && onClearAll && (
            <Button
              size="sm"
              variant="outline"
              onClick={onClearAll}
              title="Vyčistit frontu"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Active downloads */}
        {activeDownloads.map((download) => (
          <div key={download.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {getStatusIcon(download.status)}
                <span className="text-sm truncate">{download.filename}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCancel(download.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Progress value={download.progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {Math.round(download.progress)}%
                {download.status === 'downloading' && estimatedTimes[download.id] !== undefined && (
                  formatTimeEstimate(estimatedTimes[download.id])
                )}
              </span>
              <Badge className={`text-xs ${getStatusColor(download.status)}`}>
                {getStatusText(download.status)}
              </Badge>
            </div>
          </div>
        ))}

        {/* Completed downloads */}
        {completedDownloads.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Dokončené</h4>
            {completedDownloads.map((download) => (
              <div
                key={download.id}
                className="flex items-center justify-between p-2 rounded-md bg-muted cursor-pointer"
                title={download.path ? 'Otevřít ve složce' : undefined}
                onDoubleClick={() => {
                  if (download.path) {
                    try { window.electronAPI.revealInFolder(download.path) } catch (_) {}
                  }
                }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getStatusIcon(download.status)}
                  <span className="text-sm truncate">{download.filename}</span>
                </div>
                <Badge className={`text-xs ${getStatusColor(download.status)}`}>
                  {getStatusText(download.status)}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Error downloads */}
        {errorDownloads.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Chyby</h4>
            {errorDownloads.map((download) => (
              <div key={download.id} className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-md bg-destructive/10">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getStatusIcon(download.status)}
                    <span className="text-sm truncate">{download.filename}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRetry(download.id)}
                  >
                    Zkusit znovu
                  </Button>
                </div>
                {download.error && (
                  <p className="text-xs text-destructive">{download.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Cancelled downloads */}
        {cancelledDownloads.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Zrušené</h4>
            {cancelledDownloads.map((download) => (
              <div
                key={download.id}
                className="flex items-center justify-between p-2 rounded-md bg-muted relative"
                onContextMenu={(e) => {
                  e.preventDefault()
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const y = e.clientY - rect.top
                  setMenuState({ x, y, id: download.id })
                }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getStatusIcon(download.status)}
                  <span className="text-sm truncate">{download.filename}</span>
                </div>
                <Badge className={`text-xs ${getStatusColor(download.status)}`}>
                  {getStatusText(download.status)}
                </Badge>

                {menuState && menuState.id === download.id && (
                  <div
                    className="absolute z-50 bg-popover text-popover-foreground border rounded-md shadow-md py-1"
                    style={{ left: menuState.x, top: menuState.y, minWidth: 160 }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        const id = menuState.id
                        setMenuState(null)
                        onRemove && onRemove(id)
                      }}
                    >
                      Odebrat ze seznamu
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  )
}
