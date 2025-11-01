const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  downloadTrack: (data) =>
    ipcRenderer.invoke('download-track', data),
  
  selectDownloadFolder: () =>
    ipcRenderer.invoke('select-download-folder'),
  
  getDownloadFolder: () =>
    ipcRenderer.invoke('get-download-folder'),

  setDownloadFolder: (folderPath) =>
    ipcRenderer.invoke('set-download-folder', folderPath),

  resetDownloadFolder: () =>
    ipcRenderer.invoke('reset-download-folder'),

  cancelDownload: (data) =>
    ipcRenderer.invoke('cancel-download', data),

  revealInFolder: (filePath) =>
    ipcRenderer.invoke('reveal-in-folder', filePath),

  ensureDirectory: (dirPath) =>
    ipcRenderer.invoke('ensure-directory', dirPath),
  
  openFolder: (folderPath) =>
    ipcRenderer.invoke('open-folder', folderPath),
  
  onDownloadProgress: (callback) =>
    ipcRenderer.on('download-progress', (event, data) => callback(data)),
  
  removeDownloadProgressListener: () =>
    ipcRenderer.removeAllListeners('download-progress'),
  
  getDownloadFormat: () =>
    ipcRenderer.invoke('get-download-format'),
  
  setDownloadFormat: (format) =>
    ipcRenderer.invoke('set-download-format', format),
  
  // Update management
  checkForUpdates: () =>
    ipcRenderer.invoke('check-for-updates'),
  
  getUpdateInfo: () =>
    ipcRenderer.invoke('get-update-info'),
  
  downloadUpdate: () =>
    ipcRenderer.invoke('download-update'),
  
  installUpdate: () =>
    ipcRenderer.invoke('install-update'),
  
  onUpdateAvailable: (callback) =>
    ipcRenderer.on('update-available', (event, data) => callback(data)),
  
  onUpdateNotAvailable: (callback) =>
    ipcRenderer.on('update-not-available', () => callback()),
  
  onUpdateError: (callback) =>
    ipcRenderer.on('update-error', (event, data) => callback(data)),
  
  onUpdateDownloadProgress: (callback) =>
    ipcRenderer.on('update-download-progress', (event, data) => callback(data)),
  
  onUpdateDownloaded: (callback) =>
    ipcRenderer.on('update-downloaded', (event, data) => callback(data)),
  
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update-available')
    ipcRenderer.removeAllListeners('update-not-available')
    ipcRenderer.removeAllListeners('update-error')
    ipcRenderer.removeAllListeners('update-download-progress')
    ipcRenderer.removeAllListeners('update-downloaded')
  },
})
