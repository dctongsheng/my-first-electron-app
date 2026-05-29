const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.loadFile('index.html')

  // 开发时打开开发者工具
  // mainWindow.webContents.openDevTools()

  // 自动更新配置
  autoUpdater.autoDownload = false
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: '你的GitHub用户名',
    repo: 'my-first-electron-app'
  })
}

// 更新事件监听
autoUpdater.on('checking-for-update', () => {
  sendMessage('info', '正在检查更新...')
})

autoUpdater.on('update-available', (info) => {
  sendMessage('available', `发现新版本 ${info.version}`)
})

autoUpdater.on('update-not-available', (info) => {
  sendMessage('none', `当前已是最新版本 ${info.version}`)
})

autoUpdater.on('download-progress', (progress) => {
  sendMessage('downloading', `下载进度: ${Math.floor(progress.percent)}%`)
})

autoUpdater.on('update-downloaded', (info) => {
  sendMessage('downloaded', `更新下载完成: ${info.version}`)
  dialog.showMessageBox(mainWindow, {
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

autoUpdater.on('error', (err) => {
  sendMessage('error', `更新错误: ${err.message}`)
})

// IPC 通信
function sendMessage(event, message) {
  if (mainWindow) {
    mainWindow.webContents.send('update-message', { event, message })
  }
}

ipcMain.on('check-update', () => {
  autoUpdater.checkForUpdates()
})

ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate()
})

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
