# 🎵 NICCMUSIC

Moderní desktopová aplikace pro vyhledávání a stahování hudby ve vysoké kvalitě. Elegantní a intuitivní rozhraní postavené na Electronu s Reactem.

## 📋 Obsah

- [Představení](#představení)
- [Funkce](#funkce)
- [Screenshoty](#screenshoty)
- [Instalace](#instalace)
- [Použití](#použití)
- [Technologie](#technologie)
- [Stavba aplikace](#stavba-aplikace)
- [Struktura projektu](#struktura-projektu)
- [Aktualizace](#aktualizace)
- [Vývoj](#vývoj)

## 🎯 Představení

**NICCMUSIC** je desktopová aplikace pro Windows, macOS a Linux, která vám umožňuje snadno vyhledávat a stahovat hudbu ve vysoké kvalitě. Aplikace kombinuje jednoduché, intuitivní rozhraní s výkonnými funkcemi, včetně vestavěného přehrávače a pokročilé fronty stahování.

## ✨ Funkce

### 🔍 Vyhledávání
- **Více typů vyhledávání**: Vyhledávejte podle skladeb, alb nebo umělců
- **Inteligentní cache**: Rychlejší načítání dříve vyhledaných výsledků
- **Detailní informace**: Zobrazte kompletní metadata o skladbách, albech a umělcích

### ⬇️ Stahování
- **Fronta stahování**: Správa více stahování současně s průhledným sledováním pokroku
- **Výběr kvality**: Automatický výběr nejlepší dostupné kvality (HIRES_LOSSLESS, LOSSLESS, HIGH)
- **Formát souborů**: Stahování ve formátu FLAC nebo MP3 podle vašich preferencí
- **Automatická konverze**: Automatická konverze FLAC na MP3, pokud je požadována
- **Unikátní názvy**: Automatické přejmenování souborů při duplicitách

### 🎵 Přehrávač
- **Vestavěný přehrávač**: Přehrávejte skladby přímo v aplikaci
- **Základní ovládání**: Play/Pause, Next/Previous, Seek, Volume control
- **Vizuální feedback**: Zobrazení obálky alba, názvu skladby a umělce

### ⚙️ Nastavení
- **Vlastní složka stahování**: Vyberte, kam se mají stahovat soubory
- **Preference formátu**: Zvolte mezi FLAC a MP3
- **Perzistentní nastavení**: Vaše preference jsou uloženy mezi spuštěními

### 🎨 Uživatelské rozhraní
- **Moderní design**: Elegantní UI postavené na Tailwind CSS a shadcn/ui
- **Český jazyk**: Kompletní lokalizace do češtiny
- **Responzivní layout**: Adaptivní rozhraní pro různé velikosti oken
- **Animace**: Plynulé přechody a animace pro lepší uživatelský zážitek

### 🔄 Automatické aktualizace
- **Automatická kontrola**: Aplikace automaticky kontroluje dostupné aktualizace při spuštění
- **Toast notifikace**: Uživatelsky přívětivé upozornění na dostupné aktualizace
- **Changelog**: Zobrazení detailních informací o změnách z GitHub Releases
- **Snadná instalace**: Stahování a instalace aktualizací přímo z aplikace

## 🖼️ Screenshoty

<img width="1186" height="793" alt="image" src="https://github.com/user-attachments/assets/aa751ba0-b664-475f-a971-37bc5da784eb" />
<img width="1186" height="793" alt="image" src="https://github.com/user-attachments/assets/d3801e69-2c7d-4d17-a430-ae344902bc41" />

## 📦 Instalace

### Předpoklady

- Node.js 18+ a npm
- Git

### Krok za krokem

1. **Naklonujte repozitář**:
   ```bash
   git clone https://github.com/yourusername/niccmusic.git
   cd niccmusic
   ```

2. **Nainstalujte závislosti**:
   ```bash
   npm install
   ```

3. **Spusťte aplikaci v režimu vývoje**:
   ```bash
   npm run electron:dev
   ```

4. **Nebo sestavte produkční verzi**:

   **Windows:**
   ```bash
   npm run build:win
   ```

   **macOS:**
   ```bash
   npm run build:mac
   ```

   **Linux:**
   ```bash
   npm run build:linux
   ```

   Sestavené aplikace najdete ve složce `dist/`.

## 🚀 Použití

### Základní práce s aplikací

1. **Vyhledávání hudby**:
   - Zadejte název skladby, alba nebo umělce do vyhledávacího pole
   - Přepněte mezi typy vyhledávání pomocí přepínačů (Skladba/Album/Umělec)
   - Prohlédněte si výsledky vyhledávání

2. **Zobrazení detailů**:
   - Klikněte na libovolný výsledek pro zobrazení detailních informací
   - Pro skladby: zobrazí se metadata, obálka alba a možnost stáhnout nebo přehrát
   - Pro alba: zobrazí se všechny skladby z alba s možností hromadného stahování
   - Pro umělce: zobrazí se discografie a další alba

3. **Stahování**:
   - Klikněte na tlačítko "Stáhnout" u jakékoliv skladby
   - Sledujte průběh stahování ve frontě stahování (ikona v pravém horním rohu)
   - Stahované soubory se ukládají do výchozí složky nebo do složky zvolené v nastavení

4. **Přehrávání**:
   - Klikněte na tlačítko "Přehrát" u skladby
   - Použijte ovládací prvky přehrávače v dolní části aplikace

5. **Nastavení**:
   - Otevřete nastavení kliknutím na ikonu ozubeného kola v pravém horním rohu
   - Změňte složku stahování nebo preferovaný formát souboru

### Tipy a triky

- **Hromadné stahování**: V detailu alba můžete stáhnout všechny skladby najednou
- **Fronta stahování**: Můžete stáhnout více skladeb současně - všechny se zobrazí ve frontě
- **Kvalita zvuku**: Aplikace automaticky vybere nejlepší dostupnou kvalitu pro každou skladbu

## 🛠️ Technologie

NICCMUSIC je postavena s využitím moderních technologií:

- **[Electron](https://www.electronjs.org/)** - Framework pro vytváření desktopových aplikací
- **[React](https://react.dev/)** - UI knihovna pro vytváření uživatelského rozhraní
- **[TypeScript](https://www.typescriptlang.org/)** - Typovaná nadstavba JavaScriptu
- **[Vite](https://vitejs.dev/)** - Rychlý build tool a dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Vysokokvalitní React UI komponenty
- **[Radix UI](https://www.radix-ui.com/)** - Bezheadless UI komponenty
- **[FFmpeg](https://ffmpeg.org/)** - Nástroj pro konverzi audio formátů
- **[Axios](https://axios-http.com/)** - HTTP klient pro API volání
- **[React Router](https://reactrouter.com/)** - Navigace v aplikaci

## 🏗️ Stavba aplikace

### Skripty

- `npm run dev` - Spustí Vite dev server
- `npm run build` - Sestaví aplikaci pro produkci
- `npm run build:electron` - Sestaví Electron main process
- `npm run electron:dev` - Spustí aplikaci v režimu vývoje
- `npm run build:win` - Sestaví Windows instalační balíček
- `npm run build:mac` - Sestaví macOS aplikaci
- `npm run build:linux` - Sestaví Linux aplikaci

### Konfigurace

- `electron-builder.json` - Konfigurace pro Electron Builder
- `vite.config.ts` - Konfigurace Vite
- `tailwind.config.js` - Konfigurace Tailwind CSS
- `tsconfig.json` - Konfigurace TypeScript

## 📁 Struktura projektu

```
niccmusic/
├── electron/                 # Electron main process
│   ├── main.ts              # Hlavní Electron proces
│   ├── preload.ts           # Preload skript
│   └── tsconfig.json        # TypeScript config pro Electron
├── src/                      # Zdrojový kód aplikace
│   ├── components/          # React komponenty
│   │   ├── ui/             # shadcn/ui komponenty
│   │   ├── AlbumDetail.tsx
│   │   ├── ArtistDetail.tsx
│   │   ├── DownloadQueue.tsx
│   │   ├── Player.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   ├── Settings.tsx
│   │   └── TrackDetail.tsx
│   ├── hooks/               # React hooks
│   │   └── usePlayer.ts
│   ├── lib/                 # Utility funkce
│   │   ├── api.ts          # API klient
│   │   └── utils.ts        # Pomocné funkce
│   ├── types/               # TypeScript definice
│   │   └── electron.d.ts
│   ├── App.tsx              # Hlavní komponenta
│   ├── main.tsx            # Entry point
│   └── index.css            # Globální styly
├── dist/                     # Sestavená produkční verze
├── dist-electron/           # Sestavené Electron soubory
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🔄 Aktualizace

Aplikace podporuje automatické aktualizace z GitHub Releases. Při každém spuštění se automaticky zkontroluje dostupnost nové verze.

**Pro vývojáře**: Kompletní průvodce, jak publikovat nové aktualizace, najdete v souboru [UPDATES.md](./UPDATES.md).

**Rychlý návod:**
1. Aktualizujte verzi v `package.json`
2. Sestavte aplikaci (`npm run build:win` / `build:mac` / `build:linux`)
3. Vytvořte GitHub Release s tagem ve formátu `v1.1.0`
4. Přidejte sestavené binární soubory k release
5. Aplikace automaticky zkontroluje aktualizace při dalším spuštění

Více informací najdete v [UPDATES.md](./UPDATES.md).

## 👨‍💻 Vývoj

### Nastavení vývojového prostředí

1. Naklonujte repozitář a nainstalujte závislosti (viz [Instalace](#instalace))

2. Spusťte aplikaci v režimu vývoje:
   ```bash
   npm run electron:dev
   ```

3. Aplikace se otevře s hot reload - změny v kódu se automaticky projeví.

### Přispívání

Příspěvky jsou vítány! Pokud chcete přispět:

1. Forkněte projekt
2. Vytvořte feature branch (`git checkout -b feat/AmazingFeature`)
3. Commitněte změny (`git commit -m 'Add some AmazingFeature'`)
4. Pushněte do branch (`git push origin feat/AmazingFeature`)
5. Otevřete Pull Request

### Hlášení problémů

Pokud narazíte na problém, vytvořte issue na GitHubu s:
- Popisem problému
- Kroky k reprodukci
- Očekávaným chováním
- Skutečným chováním
- Screenshoty (pokud je to možné)
- Informacemi o prostředí (OS, verze Node.js, atd.)

## 📝 License

Tento projekt je licencován pod MIT licencí.

Více informací o MIT licenci: [https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT)

## 🙏 Poděkování

- Všem přispěvatelům, kteří pomáhají vylepšovat NICCMUSIC
- Komunitám Electron, React a všech ostatních open-source projektů

---

**Vytvořeno s ❤️ pomocí Electron a React**
