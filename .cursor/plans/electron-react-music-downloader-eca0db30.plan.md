<!-- eca0db30-caa5-4ce9-b67d-c0971acea5fb b18b71d2-5808-47b9-b65a-05957331916f -->
# Electron React Music Downloader

## Project Structure Setup

1. **Initialize Electron + React project**

   - Set up Vite + React + TypeScript
   - Configure Electron with proper main/renderer process structure
   - Add Tailwind CSS and shadcn/ui dependencies
   - Create proper build configuration for both development and production

2. **Install dependencies**

   - React, React Router for navigation
   - Electron, electron-builder for packaging
   - Tailwind CSS, shadcn/ui components (Button, Input, Card, Tabs, Badge, Progress, etc.)
   - Axios for API calls
   - File system utilities for downloading

## Core Features Implementation

3. **Search functionality**

   - Create search bar component with toggle for search type (skladba/album/umělec)
   - Implement API calls to:
     - `https://maus.qqdl.site/search/?s=` (tracks)
     - `https://maus.qqdl.site/search/?al=` (albums)
     - `https://maus.qqdl.site/search/?a=` (artists)
   - Display search results in a grid/list with cover images using the image URL format: `https://resources.tidal.com/images/{cover-uuid-formatted}/640x640.jpg`

4. **Detail views**

   - **Track detail**: Show track info, artist, album, duration, quality badges, download button
   - **Album detail**: Fetch from `https://hund.qqdl.site/album/?id=`, show album info, track list with play/download options
   - **Artist detail**: Fetch from `https://hund.qqdl.site/artist/?f=`, show albums list and top tracks section

5. **Download system**

   - Implement download queue with progress tracking
   - Use Electron's main process to handle file downloads
   - Fetch track download URL from `https://maus.qqdl.site/track/?id=&quality=`
   - Use highest available quality from `audioQuality` field (prioritize HIRES_LOSSLESS > LOSSLESS > HIGH)
   - Extract actual download URL from `OriginalTrackUrl` in API response
   - Show download progress, allow cancellation and retry
   - Save files to user-selected download folder with proper naming (Artist - Title.flac)

6. **UI Components (Czech language)**

   - Navigation/Layout with search bar
   - Search results grid with cards showing cover art, title, artist
   - Detail pages with proper layouts
   - Download queue sidebar/panel showing active and completed downloads
   - Settings for download folder selection

## File Structure

```
deda-hudba/
├── electron/
│   ├── main.ts (main process, window management, download handler)
│   └── preload.ts (IPC bridge)
├── src/
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   ├── TrackDetail.tsx
│   │   ├── AlbumDetail.tsx
│   │   ├── ArtistDetail.tsx
│   │   └── DownloadQueue.tsx
│   ├── lib/
│   │   ├── api.ts (API calls)
│   │   └── utils.ts (image URL formatter, etc.)
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
├── electron-builder.json
└── tailwind.config.js
```

## Key Technical Details

- Use React Router for navigation between search and detail views
- Image URL conversion: transform cover UUID `4dc53c11-b355-42dd-b9d3-721591c67b59` to `https://resources.tidal.com/images/4dc53c11/b355/42dd/b9d3/721591c67b59/640x640.jpg`
- Quality selection logic: check `audioQuality` field and available `mediaMetadata.tags` to pick highest quality
- IPC communication between renderer (React) and main (Electron) for download operations
- Download folder persistence using electron-store or localStorage

### To-dos

- [ ] Initialize Electron + React + Vite project with TypeScript, Tailwind CSS, and shadcn/ui
- [ ] Create API service layer with functions for search, track/album/artist details, and image URL formatting
- [ ] Build search interface with toggle (skladba/album/umělec) and results grid
- [ ] Implement track, album, and artist detail pages with proper data display
- [ ] Create download queue system with Electron IPC, progress tracking, and file management
- [ ] Style all components with Tailwind and shadcn/ui, ensure Czech translations throughout