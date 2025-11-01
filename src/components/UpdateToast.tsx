import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UpdateToastProps {
  version: string
  onClose: () => void
  onOpenModal: () => void
}

export function UpdateToast({ version, onClose, onOpenModal }: UpdateToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in-0">
      <div className="flex items-center gap-3 bg-primary text-primary-foreground px-4 py-3 rounded-md shadow-lg min-w-[300px] max-w-[400px]">
        <Download className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">Dostupná aktualizace</p>
          <p className="text-sm opacity-90">Verze {version}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenModal}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          Zobrazit
        </Button>
        <button
          onClick={onClose}
          className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20 rounded p-1 transition-colors"
          aria-label="Zavřít"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

