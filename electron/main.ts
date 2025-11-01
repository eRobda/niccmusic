const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const { join, extname, basename } = require('path')
const { existsSync, mkdirSync, createWriteStream, readFileSync, writeFileSync, unlinkSync } = require('fs')
const https = require('https')
const http = require('http')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegStatic = require('ffmpeg-static')

const isDev = process.env.IS_DEV === 'true'

// Set app name
app.setName('NICCMUSIC')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'NICCMUSIC',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.cjs'),
    },
    autoHideMenuBar: true,
    show: false,
  })

  // Hide the menu bar (File, Edit, View, ...) completely
  mainWindow.setMenuBarVisibility(false)

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    // mainWindow.webContents.openDevTools() // Commented out to not open dev tools by default
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    app.quit()
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Settings persistence
const getSettingsPath = () => join(app.getPath('userData'), 'settings.json')

const loadSettings = () => {
  try {
    const p = getSettingsPath()
    if (existsSync(p)) {
      const raw = readFileSync(p, 'utf-8')
      return JSON.parse(raw)
    }
  } catch (_) {}
  return {}
}

const saveSettings = (settings) => {
  try {
    const p = getSettingsPath()
    const dir = app.getPath('userData')
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(p, JSON.stringify(settings, null, 2), 'utf-8')
    return true
  } catch (e) {
    console.error('Failed to save settings:', e)
    return false
  }
}

// Download function using Node.js built-in modules
const activeDownloads = new Map()

const downloadFile = async (url, filePath, onProgress, key) => {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(filePath)
    const protocol = url.startsWith('https:') ? https : http
    
    const request = protocol.get(url, (response) => {
      const totalSize = parseInt(response.headers['content-length'] || '0', 10)
      let downloadedSize = 0
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length
        const progress = totalSize > 0 ? (downloadedSize / totalSize) * 100 : 0
        onProgress(progress)
      })
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        if (key) activeDownloads.delete(key)
        resolve(undefined)
      })
      
      file.on('error', (err) => {
        if (key) activeDownloads.delete(key)
        reject(err)
      })
    })
    
    request.on('error', (err) => {
      if (key) activeDownloads.delete(key)
      reject(err)
    })

    if (key) activeDownloads.set(key, { request, file })
  })
}

// Set ffmpeg path
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic)
}

// Helper function to get a unique filename by adding number suffix if file exists
const getUniqueFilename = (filePath: string): string => {
  if (!existsSync(filePath)) {
    return filePath
  }
  
  const dir = require('path').dirname(filePath)
  const ext = extname(filePath)
  const base = basename(filePath, ext)
  
  let counter = 2
  let newPath = join(dir, `${base} - ${counter}${ext}`)
  
  while (existsSync(newPath)) {
    counter++
    newPath = join(dir, `${base} - ${counter}${ext}`)
  }
  
  return newPath
}

// IPC handlers
ipcMain.handle('download-track', async (event, { url, filename, downloadPath, preferredFormat }) => {
  try {
    // Ensure destination directory exists (supports override paths per album)
    try { if (downloadPath && !existsSync(downloadPath)) mkdirSync(downloadPath, { recursive: true }) } catch (_) {}
    
    // Check if final file already exists and get unique filename
    // We need to check what the final filename will be based on preferred format
    const finalExtension = preferredFormat === 'mp3' ? 'mp3' : extname(filename).slice(1) || 'flac'
    const finalBaseName = basename(filename, extname(filename))
    const finalFilenameWithExt = `${finalBaseName}.${finalExtension}`
    const potentialFinalPath = join(downloadPath, finalFilenameWithExt)
    
    // Get unique final filename if it already exists
    const uniqueFinalPath = getUniqueFilename(potentialFinalPath)
    const uniqueFinalFilename = basename(uniqueFinalPath)
    const uniqueFinalBaseName = basename(uniqueFinalPath, extname(uniqueFinalPath))
    
    // Download file - API usually returns FLAC, sometimes MP3
    // We'll download with a temporary name first to check actual format
    // Use the unique base name to ensure consistency
    const tempExtension = 'flac'
    const downloadFilename = `${uniqueFinalBaseName}.${tempExtension}`
    const tempFilePath = join(downloadPath, downloadFilename)
    
    await downloadFile(url, tempFilePath, (progress) => {
      mainWindow.webContents.send('download-progress', {
        filename, // Keep original filename for tracking
        progress: Math.round(progress),
      })
    }, downloadFilename)
    
    // After download, check if file is actually FLAC or MP3
    // Since API usually returns FLAC, we assume FLAC unless URL clearly indicates MP3
    const urlLower = url.toLowerCase()
    const isFlac = !urlLower.includes('.mp3') && !urlLower.endsWith('mp3')
    const wantsMp3 = preferredFormat === 'mp3'
    
    let finalFilePath = tempFilePath
    let finalFilename = downloadFilename
    
    // If user wants MP3 and we got FLAC, convert it
    if (isFlac && wantsMp3) {
      // Send converting status
      mainWindow.webContents.send('download-progress', {
        filename, // Keep original filename for tracking
        progress: 0,
        status: 'converting',
      })
      
      // Generate MP3 filename using the unique base name we already determined
      const mp3Filename = `${uniqueFinalBaseName}.mp3`
      const mp3FilePath = join(downloadPath, mp3Filename)
      
      // Convert FLAC to MP3
      await new Promise((resolve, reject) => {
        ffmpeg(tempFilePath)
          .outputOptions([
            '-codec:a libmp3lame',
            '-q:a 0', // Highest quality VBR
          ])
          .on('end', () => {
            // Delete original FLAC file
            try {
              unlinkSync(tempFilePath)
            } catch (err) {
              console.error('Failed to delete original FLAC file:', err)
            }
            finalFilePath = mp3FilePath
            finalFilename = mp3Filename
            resolve(undefined)
          })
          .on('error', (err) => {
            console.error('Conversion error:', err)
            reject(err)
          })
          .save(mp3FilePath)
      })
    } else if (wantsMp3 && !isFlac) {
      // Already MP3, use the unique filename we determined earlier
      finalFilePath = uniqueFinalPath
      finalFilename = uniqueFinalFilename
      
      if (tempFilePath !== finalFilePath) {
        try {
          // If target exists (shouldn't happen due to getUniqueFilename, but just in case)
          if (existsSync(finalFilePath)) {
            unlinkSync(finalFilePath)
          }
          // Rename to unique final filename
          const { renameSync } = require('fs')
          renameSync(tempFilePath, finalFilePath)
        } catch (err) {
          console.error('Failed to rename MP3 file:', err)
          finalFilePath = tempFilePath
          finalFilename = downloadFilename
        }
      }
    } else {
      // User wants FLAC or file is already in preferred format
      // Use the unique filename we determined earlier
      finalFilePath = uniqueFinalPath
      finalFilename = uniqueFinalFilename
      
      if (tempFilePath !== finalFilePath) {
        try {
          // If target exists (shouldn't happen due to getUniqueFilename, but just in case)
          if (existsSync(finalFilePath)) {
            unlinkSync(finalFilePath)
          }
          const { renameSync } = require('fs')
          renameSync(tempFilePath, finalFilePath)
        } catch (err) {
          console.error('Failed to rename file:', err)
          finalFilePath = tempFilePath
          finalFilename = downloadFilename
        }
      }
    }
    
    return { success: true, path: finalFilePath, filename: finalFilename }
  } catch (error) {
    console.error('Download failed:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

ipcMain.handle('cancel-download', async (_event, { filename, downloadPath }) => {
  try {
    const entry = activeDownloads.get(filename)
    if (entry) {
      try { entry.request.destroy() } catch (_) {}
      try { entry.file.close() } catch (_) {}
      activeDownloads.delete(filename)
    }
    // Remove partial file if exists
    if (downloadPath) {
      const filePath = join(downloadPath, filename)
      try { unlinkSync(filePath) } catch (_) {}
    }
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
})

ipcMain.handle('ensure-directory', async (_event, dirPath) => {
  try {
    if (dirPath && !existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true })
    }
    return { success: true }
  } catch (e) {
    console.error('ensure-directory failed:', e)
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
})

ipcMain.handle('reveal-in-folder', async (_event, filePath) => {
  try {
    if (filePath) {
      shell.showItemInFolder(filePath)
      return { success: true }
    }
    return { success: false, error: 'Invalid file path' }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
})

ipcMain.handle('select-download-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Vyberte složku pro stahování hudby',
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

ipcMain.handle('set-download-folder', (_event, folderPath) => {
  const settings = loadSettings()
  settings.downloadFolder = folderPath
  return saveSettings(settings)
})

ipcMain.handle('reset-download-folder', () => {
  const settings = loadSettings()
  delete settings.downloadFolder
  saveSettings(settings)
  // Return the default folder path
  const musicPath = join(app.getPath('music'), 'NICCMUSIC')
  if (!existsSync(musicPath)) {
    mkdirSync(musicPath, { recursive: true })
  }
  return musicPath
})

ipcMain.handle('get-download-folder', () => {
  const settings = loadSettings()
  const configured = settings.downloadFolder
  if (configured && existsSync(configured)) {
    return configured
  }
  const musicPath = join(app.getPath('music'), 'NICCMUSIC')
  if (!existsSync(musicPath)) {
    mkdirSync(musicPath, { recursive: true })
  }
  return musicPath
})

ipcMain.handle('open-folder', async (_event, folderPath) => {
  try {
    if (folderPath) {
      await shell.openPath(folderPath)
      return { success: true }
    }
    return { success: false, error: 'Invalid folder path' }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
})

ipcMain.handle('get-download-format', () => {
  const settings = loadSettings()
  return settings.downloadFormat || 'flac'
})

ipcMain.handle('set-download-format', (_event, format) => {
  const settings = loadSettings()
  settings.downloadFormat = format
  return saveSettings(settings)
})
