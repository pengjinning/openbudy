import { app, BrowserWindow, session } from 'electron'
import path from 'path'
import { registerAgentIpc } from './ipc/agent'
import { registerFileIpc } from './ipc/file'
import { registerStorageIpc } from './ipc/storage'

let mainWindow: BrowserWindow | null = null

const devServerUrl = process.env.VITE_DEV_SERVER_URL

// The policy below deliberately stays permissive where the app depends on it, so that
// enabling CSP does not change existing behaviour:
//   - script-src 'unsafe-inline'  : Vite's react-refresh preamble (dev) and the
//                                   agent-generated HTML previews, which are rendered as
//                                   `srcdoc` iframes and therefore inherit this policy.
//   - script-src cdn.jsdelivr.net : Monaco is fetched from the CDN by @monaco-editor/react.
//   - frame-src *                 : BrowserPreview embeds arbitrary remote URLs.
// `unsafe-eval` is intentionally absent, which is what Electron's security warning checks for.
const COMMON_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "img-src 'self' data: blob:",
  "worker-src 'self' blob:",
  'frame-src *',
  "object-src 'none'",
  "base-uri 'self'",
]

function buildCsp(): string {
  const connectSrc = devServerUrl
    ? `connect-src 'self' ws: ${devServerUrl} https://cdn.jsdelivr.net`
    : "connect-src 'self' https://cdn.jsdelivr.net"

  return [...COMMON_CSP, connectSrc].join('; ')
}

function installContentSecurityPolicy() {
  const policy = buildCsp()
  // Only the app's own document is given the CSP; remote responses (Monaco's CDN, URLs
  // loaded in BrowserPreview) must keep whatever policy they ship with.
  const appOrigin = devServerUrl ? new URL(devServerUrl).origin : null

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const isAppDocument = appOrigin
      ? details.url.startsWith(appOrigin)
      : details.url.startsWith('file://')

    callback({
      responseHeaders: isAppDocument
        ? { ...details.responseHeaders, 'Content-Security-Policy': [policy] }
        : details.responseHeaders,
    })
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    title: 'OpenBudy',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    frame: true,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#ffffff',
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  installContentSecurityPolicy()
  registerAgentIpc()
  registerFileIpc()
  registerStorageIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
