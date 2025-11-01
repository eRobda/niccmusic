# Děda Hudba - Music Downloader

Aplikace pro stahování hudby vytvořená v Electron + React pro vašeho dědu.

## Funkce

- 🔍 Vyhledávání skladeb, alb a umělců
- 📱 Moderní a intuitivní rozhraní v češtině
- ⬇️ Stahování s frontou a sledováním pokroku
- 🎵 Detailní informace o skladbách, albech a umělcích
- 🎨 Krásné UI s Tailwind CSS a shadcn/ui komponenty

## Instalace

1. Nainstalujte závislosti:
```bash
npm install
```

2. Spusťte aplikaci v režimu vývoje:
```bash
npm run electron:dev
```

3. Nebo sestavte produkční verzi:
```bash
npm run build:win  # Pro Windows
npm run build:mac  # Pro macOS
npm run build:linux # Pro Linux
```

## Použití

1. **Vyhledávání**: Zadejte název skladby, alba nebo umělce do vyhledávacího pole
2. **Typ vyhledávání**: Přepněte mezi "Skladba", "Album" a "Umělec" pomocí přepínačů
3. **Detail**: Klikněte na výsledek pro zobrazení detailních informací
4. **Stahování**: Klikněte na tlačítko stáhnout pro přidání do fronty stahování
5. **Složka**: Vyberte složku pro stahování pomocí tlačítka složky v pravé liště

## Technologie

- **Electron** - Desktop aplikace
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI komponenty
- **Vite** - Build tool

## Struktura projektu

```
deda-hudba/
├── electron/           # Electron main process
├── src/
│   ├── components/     # React komponenty
│   │   ├── ui/        # shadcn/ui komponenty
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   ├── TrackDetail.tsx
│   │   ├── AlbumDetail.tsx
│   │   ├── ArtistDetail.tsx
│   │   └── DownloadQueue.tsx
│   ├── lib/           # Utility funkce a API
│   └── App.tsx        # Hlavní komponenta
└── package.json
```

## API Endpointy

Aplikace používá následující API endpointy:
- `https://maus.qqdl.site/search/` - Vyhledávání
- `https://hund.qqdl.site/album/` - Detail alba
- `https://hund.qqdl.site/artist/` - Detail umělce

## Poznámky

- Aplikace automaticky vybírá nejvyšší dostupnou kvalitu (HIRES_LOSSLESS > LOSSLESS > HIGH)
- Obrázky se načítají z Tidal CDN s různými rozlišeními
- Stahování probíhá v pozadí s možností sledování pokroku
- Všechny texty jsou v češtině pro lepší použitelnost pro dědu
