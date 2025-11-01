import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FolderOpen, Download, Settings as SettingsIcon, Palette, Info } from 'lucide-react'

interface SettingsProps {
  onBack: () => void
  isClosing?: boolean
}

type SettingsSection = 'general' | 'downloads' | 'appearance' | 'about'

interface DownloadFolderSetting {
  currentPath: string
  isDefault: boolean
}

export function Settings({ onBack, isClosing = false }: SettingsProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general')
  const [downloadFolder, setDownloadFolder] = useState<DownloadFolderSetting>({
    currentPath: '',
    isDefault: true
  })
  const [downloadFormat, setDownloadFormat] = useState<'flac' | 'mp3'>('flac')
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Trigger animation when component mounts
    requestAnimationFrame(() => {
      setIsAnimating(true)
    })
  }, [])

  useEffect(() => {
    // Handle closing animation
    if (isClosing) {
      setIsAnimating(false)
    }
  }, [isClosing])

  useEffect(() => {
    const loadDownloadFolder = async () => {
      try {
        const folder = await window.electronAPI.getDownloadFolder()
        setDownloadFolder({
          currentPath: folder,
          isDefault: true
        })
      } catch (error) {
        console.error('Error loading download folder:', error)
      }
    }
    loadDownloadFolder()
  }, [])

  useEffect(() => {
    const loadDownloadFormat = async () => {
      try {
        const format = await window.electronAPI.getDownloadFormat()
        setDownloadFormat(format)
      } catch (error) {
        console.error('Error loading download format:', error)
      }
    }
    loadDownloadFormat()
  }, [])

  const handleSelectDownloadFolder = async () => {
    setIsLoading(true)
    try {
      const folder = await window.electronAPI.selectDownloadFolder()
      if (folder) {
        setDownloadFolder({
          currentPath: folder,
          isDefault: false
        })
        try {
          await window.electronAPI.setDownloadFolder(folder)
        } catch (e) {
          console.error('Error persisting download folder:', e)
        }
      }
    } catch (error) {
      console.error('Error selecting folder:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetToDefault = async () => {
    setIsLoading(true)
    try {
      // Reset download folder in settings and get default path
      const defaultFolder = await (window as any).electronAPI.resetDownloadFolder()
      setDownloadFolder({
        currentPath: defaultFolder,
        isDefault: true
      })
    } catch (error) {
      console.error('Error resetting to default:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const settingsSections = [
    {
      id: 'general' as SettingsSection,
      title: 'Obecné',
      icon: SettingsIcon,
      description: 'Základní nastavení aplikace'
    },
    {
      id: 'downloads' as SettingsSection,
      title: 'Stahování',
      icon: Download,
      description: 'Nastavení pro stahování hudby'
    },
    {
      id: 'appearance' as SettingsSection,
      title: 'Vzhled',
      icon: Palette,
      description: 'Nastavení vzhledu aplikace'
    },
    {
      id: 'about' as SettingsSection,
      title: 'O aplikaci',
      icon: Info,
      description: 'Informace o aplikaci'
    }
  ]

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Obecné nastavení</h3>
        <p className="text-muted-foreground mb-6">
          Základní nastavení pro fungování aplikace
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Složka pro stahování
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{downloadFolder.currentPath}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={downloadFolder.isDefault ? "default" : "secondary"}>
                  {downloadFolder.isDefault ? "Výchozí" : "Vlastní"}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSelectDownloadFolder}
              disabled={isLoading}
              variant="outline"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              {isLoading ? 'Načítám...' : 'Vybrat složku'}
            </Button>
            
            {!downloadFolder.isDefault && (
              <Button 
                onClick={handleResetToDefault}
                disabled={isLoading}
                variant="ghost"
              >
                Obnovit výchozí
              </Button>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            Zde se budou ukládat všechny stažené skladby. Pokud nevyberete vlastní složku, 
            bude použita výchozí složka v Downloads.
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const handleDownloadFormatChange = async (format: 'flac' | 'mp3') => {
    setDownloadFormat(format)
    try {
      await window.electronAPI.setDownloadFormat(format)
    } catch (error) {
      console.error('Error saving download format:', error)
    }
  }

  const renderDownloadsSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Nastavení stahování</h3>
        <p className="text-muted-foreground mb-6">
          Konfigurace pro stahování hudby
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Formát stahování</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="download-format" className="text-sm font-medium">
              Formát souborů
            </label>
            <select
              id="download-format"
              value={downloadFormat}
              onChange={(e) => handleDownloadFormatChange(e.target.value as 'flac' | 'mp3')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="flac">FLAC (bezztrátový)</option>
              <option value="mp3">MP3 (zkomprimovaný)</option>
            </select>
            <p className="text-sm text-muted-foreground">
              {downloadFormat === 'mp3' 
                ? 'Pokud bude stažen soubor ve formátu FLAC, automaticky se zkonvertuje do MP3.'
                : 'Soubory se stáhnou ve formátu FLAC. Pokud API vrátí MP3, bude stažen jako MP3.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Nastavení vzhledu</h3>
        <p className="text-muted-foreground mb-6">
          Přizpůsobení vzhledu aplikace
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Nastavení vzhledu budou přidána v budoucích verzích.</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderAboutSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">O aplikaci</h3>
        <p className="text-muted-foreground mb-6">
          Informace o aplikaci NICCMUSIC
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">NICCMUSIC</h4>
              <p className="text-muted-foreground">Aplikace pro stahování hudby</p>
            </div>
            <div>
              <h4 className="font-semibold">Verze</h4>
              <p className="text-muted-foreground">1.0.0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings()
      case 'downloads':
        return renderDownloadsSettings()
      case 'appearance':
        return renderAppearanceSettings()
      case 'about':
        return renderAboutSettings()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <div className={`max-w-6xl mx-auto transition-all ${
      isClosing ? 'duration-250' : 'duration-400'
    } ease-out transform ${
      isAnimating 
        ? 'translate-y-0 opacity-100' 
        : '-translate-y-12 opacity-0'
    }`}>
      

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar - Settings sections */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Nastavení
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {settingsSections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-muted ${
                        activeSection === section.id
                          ? 'bg-muted border-r-2 border-primary'
                          : ''
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {section.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Right content area */}
        <div className="lg:col-span-3">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  )
}
