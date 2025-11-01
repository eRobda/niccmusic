import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Download, X, Loader2 } from 'lucide-react'
import { getLatestRelease } from '@/lib/api'

interface UpdateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  updateInfo: {
    version: string
    releaseDate: string
    releaseNotes: string
  } | null
}

export function UpdateModal({ open, onOpenChange, updateInfo }: UpdateModalProps) {
  const [releaseData, setReleaseData] = useState<{ body: string; published_at: string } | null>(null)
  const [isLoadingRelease, setIsLoadingRelease] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch release data from GitHub when modal opens and updateInfo is available
  useEffect(() => {
    if (open && updateInfo) {
      setIsLoadingRelease(true)
      setError(null)
      getLatestRelease('eRobda', 'niccmusic')
        .then((release) => {
          setReleaseData({
            body: release.body || updateInfo.releaseNotes,
            published_at: release.published_at || updateInfo.releaseDate,
          })
        })
        .catch((err) => {
          console.error('Failed to fetch release data:', err)
          // Fallback to updateInfo data
          setReleaseData({
            body: updateInfo.releaseNotes,
            published_at: updateInfo.releaseDate,
          })
        })
        .finally(() => {
          setIsLoadingRelease(false)
        })
    }
  }, [open, updateInfo])

  // Listen for download progress
  useEffect(() => {
    if (!open) return

    const handleProgress = (progress: { percent: number }) => {
      setDownloadProgress(progress.percent)
    }

    const handleDownloaded = () => {
      setIsDownloading(false)
      setIsDownloaded(true)
      setDownloadProgress(100)
    }

    window.electronAPI.onUpdateDownloadProgress(handleProgress)
    window.electronAPI.onUpdateDownloaded(handleDownloaded)

    return () => {
      window.electronAPI.removeUpdateListeners()
    }
  }, [open])

  const handleDownload = async () => {
    setIsDownloading(true)
    setError(null)
    setDownloadProgress(0)

    try {
      const result = await window.electronAPI.downloadUpdate()
      if (!result.success) {
        setError(result.error || 'Chyba při stahování aktualizace')
        setIsDownloading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neznámá chyba')
      setIsDownloading(false)
    }
  }

  const handleInstall = async () => {
    try {
      await window.electronAPI.installUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při instalaci aktualizace')
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('cs-CZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  // Parse markdown-like text to display (simple parsing)
  const formatReleaseNotes = (notes: string) => {
    if (!notes) return 'Žádné informace o změnách.'
    
    // Simple markdown parsing - convert headers, lists, etc.
    return notes
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
          return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.slice(2)}</h3>
        }
        if (line.startsWith('## ')) {
          return <h4 key={index} className="text-base font-semibold mt-3 mb-1">{line.slice(3)}</h4>
        }
        // Bullet points
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return <li key={index} className="ml-4 list-disc">{line.trim().slice(2)}</li>
        }
        // Numbered lists
        if (/^\d+\.\s/.test(line.trim())) {
          return <li key={index} className="ml-4 list-decimal">{line.trim().replace(/^\d+\.\s/, '')}</li>
        }
        // Empty lines
        if (line.trim() === '') {
          return <br key={index} />
        }
        // Regular text
        return <p key={index} className="mb-2">{line}</p>
      })
  }

  if (!updateInfo) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Aktualizace dostupná
          </DialogTitle>
          <DialogDescription>
            Je dostupná nová verze aplikace: <strong>{updateInfo.version}</strong>
            {releaseData && (
              <span className="block mt-1 text-xs">
              Vydáno: {formatDate(releaseData.published_at)}
            </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoadingRelease ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Načítání informací o aktualizaci...</span>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3">Co je nového:</h4>
                <div className="prose prose-sm max-w-none text-sm">
                  {formatReleaseNotes(releaseData?.body || updateInfo.releaseNotes)}
                </div>
              </CardContent>
            </Card>
          )}

          {isDownloading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Stahování aktualizace...</span>
                <span>{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} />
            </div>
          )}

          {isDownloaded && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                Aktualizace byla úspěšně stažena. Aplikace se restartuje po instalaci.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDownloading}
          >
            Později
          </Button>
          {!isDownloaded ? (
            <Button
              onClick={handleDownload}
              disabled={isDownloading || isLoadingRelease}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Stahování...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Stáhnout aktualizaci
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleInstall}>
              Nainstalovat a restartovat
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

