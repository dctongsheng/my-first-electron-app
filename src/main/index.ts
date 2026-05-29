import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import pkg from '../../package.json'
import { registerIPCHandlers } from './ipc/handlers'
import { IPC_CHANNELS } from './ipc/channels'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#09090B',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // 开发时加载开发服务器，生产环境加载打包后的文件
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // 自动更新配置
  autoUpdater.autoDownload = false
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'dctongsheng',
    repo: 'my-first-electron-app'
  })

  // 发送版本号到渲染进程
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send(IPC_CHANNELS.APP_VERSION, pkg.version)
  })
}

// 更新事件监听
autoUpdater.on('checking-for-update', () => {
  sendMessage('info', '正在检查更新...')
})

autoUpdater.on('update-available', (info: any) => {
  sendMessage('available', `发现新版本 ${info.version}`)
})

autoUpdater.on('update-not-available', (info: any) => {
  sendMessage('none', `当前已是最新版本 ${info.version}`)
})

autoUpdater.on('download-progress', (progress: any) => {
  sendMessage('downloading', `下载进度: ${Math.floor(progress.percent)}%`)
})

autoUpdater.on('update-downloaded', (info: any) => {
  sendMessage('downloaded', `更新下载完成: ${info.version}`)
  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: '更新准备就绪',
    message: '新版本已下载完成，重启应用以完成更新',
    buttons: ['立即重启', '稍后']
  }).then(result => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall()
    }
  })
})

autoUpdater.on('error', (err: Error) => {
  sendMessage('error', `更新错误: ${err.message}`)
})

// IPC 通信
function sendMessage(event: string, message: string) {
  if (mainWindow) {
    mainWindow.webContents.send(IPC_CHANNELS.UPDATE_MESSAGE, { event, message })
  }
}

ipcMain.on(IPC_CHANNELS.UPDATE_CHECK, () => {
  autoUpdater.checkForUpdates()
})

ipcMain.on(IPC_CHANNELS.UPDATE_DOWNLOAD, () => {
  autoUpdater.downloadUpdate()
})

// 注册 IPC 处理器
registerIPCHandlers()

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
