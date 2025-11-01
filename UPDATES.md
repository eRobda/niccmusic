# 🚀 Průvodce pro práci s aktualizacemi

Tento dokument vysvětluje, jak používat systém automatických aktualizací v NICCMUSIC aplikaci.

## 📋 Přehled

Aplikace používá **electron-updater** pro automatickou kontrolu a stahování aktualizací z GitHub Releases. Aktualizace se kontrolují automaticky při spuštění aplikace.

## 🔧 Jak to funguje

1. **Kontrola aktualizací**: Při každém spuštění aplikace se automaticky zkontroluje, zda existuje nová verze na GitHub Releases
2. **Toast notifikace**: Pokud je dostupná aktualizace, uživatel uvidí toast v pravém dolním rohu
3. **Modal s detaily**: Po kliknutí na toast se otevře modal s informacemi o změnách z GitHub Releases
4. **Stahování a instalace**: Uživatel může stáhnout a nainstalovat aktualizaci přímo z aplikace

## 📝 Workflow pro publikování nové verze

### Krok 1: Aktualizujte verzi v package.json

Otevřete `package.json` a změňte číslo verze podle [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Velké změny, breaking changes
- **MINOR** (1.0.0 → 1.1.0): Nové funkce, zpětně kompatibilní
- **PATCH** (1.0.0 → 1.0.1): Opravy chyb

```json
{
  "version": "1.1.0",  // ← Změňte toto číslo
  ...
}
```

### Krok 2: Commitněte změny

```bash
git add package.json
git commit -m "Bump version to 1.1.0"
git push
```

### Krok 3: Sestavte aplikaci pro produkci

Pro Windows:
```bash
npm run build:win
```

Pro macOS:
```bash
npm run build:mac
```

Pro Linux:
```bash
npm run build:linux
```

**Důležité**: Sestavení vytvoří instalační soubory ve složce `dist/`.

### Krok 4: Vytvořte GitHub Release

1. **Přejděte na GitHub**: https://github.com/eRobda/niccmusic/releases/new

2. **Vytvořte nový release**:
   - **Tag version**: Zadejte verzi ve formátu `v1.1.0` (musí začínat `v`)
   - **Release title**: Např. "Version 1.1.0" nebo "Nová funkce XY"
   - **Release description**: Zde napište changelog v Markdown formátu
   
   **Příklad Release description:**
   ```markdown
   ## Co je nového v 1.1.0
   
   ### ✨ Nové funkce
   - Přidána podpora pro automatické aktualizace
   - Vylepšené UI pro stahování
   
   ### 🐛 Opravy chyb
   - Opravena chyba při stahování MP3 souborů
   - Opraveno zobrazení progress baru
   
   ### 📝 Změny
   - Aktualizován Electron na verzi 28.1.0
   ```

3. **Přidejte binární soubory**:
   - Najděte sestavené soubory ve složce `dist/`
   - Pro Windows: `dist/win-unpacked/` nebo `.exe` instalační soubor
   - Pro macOS: `.dmg` nebo `.zip` soubor
   - Pro Linux: `.AppImage` soubor
   
   **Přetáhněte soubory** do sekce "Attach binaries" při vytváření release

4. **Zveřejněte release**: Klikněte na "Publish release"

### Krok 5: Testování aktualizace

1. **Nainstalujte starší verzi aplikace** (pokud máte)
2. **Spusťte aplikaci** - měla by automaticky zkontrolovat aktualizace
3. **Zkontrolujte toast notifikaci** v pravém dolním rohu
4. **Klikněte na "Zobrazit"** pro otevření modalu s changelogem
5. **Otestujte stahování** a instalaci aktualizace

## 🔍 Manuální kontrola aktualizací (pro testování)

Pokud chcete zkontrolovat aktualizace manuálně (např. pro testování):

```typescript
// V konzoli aplikace (DevTools):
await window.electronAPI.checkForUpdates()
```

## ⚙️ Konfigurace

### GitHub Repository

Konfigurace GitHub repository je v:
- `electron-builder.json` → `publish` sekce
- `package.json` → `build.publish` sekce

```json
"publish": {
  "provider": "github",
  "owner": "eRobda",
  "repo": "niccmusic"
}
```

### Automatická kontrola

Aktualizace se kontrolují automaticky při každém spuštění aplikace (pouze v produkčním režimu, ne v dev módu).

## 📌 Důležité poznámky

### Verzování

- **Tag musí začínat `v`**: GitHub tag musí být ve formátu `v1.1.0`, ne jen `1.1.0`
- **Verze v package.json**: Musí odpovídat verzi v GitHub release tagu (bez `v`)
- **Semantic Versioning**: Doporučujeme používat semver pro konzistentní verzování

### Binární soubory

- **Windows**: Electron-builder vytváří `.exe` instalační soubor nebo `win-unpacked/` složku
- **macOS**: `.dmg` nebo `.zip` soubor
- **Linux**: `.AppImage` soubor

### GitHub Releases

- **Public repo**: Váš repo je public, takže není potřeba GITHUB_TOKEN
- **Release notes**: Použijte Markdown pro hezčí formátování
- **Attach binaries**: Vždy přidejte binární soubory k release pro každou platformu

## 🐛 Řešení problémů

### Aktualizace se nekontrolují

1. Zkontrolujte, že aplikace běží v produkčním režimu (ne dev)
2. Zkontrolujte konzoli pro chybové zprávy
3. Ověřte, že GitHub release existuje a má správný tag formát

### Aktualizace se nestahují

1. Zkontrolujte, že binární soubory jsou přiložené k GitHub release
2. Ověřte, že verze v package.json odpovídá verzi v GitHub tagu
3. Zkontrolujte console logy pro detaily chyby

### Changelog se nezobrazuje

1. Zkontrolujte, že GitHub release má vyplněné "Release description"
2. Ověřte, že GitHub API je dostupné (repo je public nebo máte správný token)

## 📚 Užitečné odkazy

- [electron-updater dokumentace](https://www.electron.build/auto-update)
- [Semantic Versioning](https://semver.org/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

## 💡 Tipy

1. **Vždy testujte aktualizace** před publikováním na produkci
2. **Pište kvalitní changelogy** - uživatelé to ocení
3. **Verzujte systematicky** - použijte semver konvenci
4. **Přidávejte binární soubory** pro všechny platformy, které podporujete

---

**Potřebujete pomoc?** Vytvořte issue na GitHubu nebo se podívejte do dokumentace electron-updater.

