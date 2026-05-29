# Electron 学习笔记：从 Hello World 到自动更新

## 项目概述

这是一个从零开始的 Electron 桌面应用开发学习项目，实现了从基础应用到完整的版本管理、自动发布和自动更新功能。

**项目地址：** https://github.com/dctongsheng/my-first-electron-app

---

## 第一部分：创建第一个 Electron 应用

### 1.1 项目初始化

```bash
mkdir my-first-electron-app
cd my-first-electron-app
npm init -y
npm install --save-dev electron electron-builder
```

### 1.2 核心文件结构

```
my-first-electron-app/
├── package.json          # 项目配置
├── index.js              # 主进程
├── index.html            # 渲染进程（页面）
└── node_modules/
```

### 1.3 主进程 (index.js)

主进程负责创建窗口和管理应用生命周期：

```javascript
const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  win.loadFile('index.html')
}

app.whenReady().then(createWindow)
```

### 1.4 渲染进程 (index.html)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>我的第一个 Electron 应用</title>
</head>
<body>
    <h1>Hello, Electron! 🚀</h1>
</body>
</html>
```

### 1.5 运行应用

```bash
npm start
```

---

## 第二部分：配置打包

### 2.1 package.json 配置

```json
{
  "scripts": {
    "start": "electron .",
    "build": "electron-builder"
  },
  "build": {
    "appId": "com.example.myfirstapp",
    "productName": "MyFirstApp",
    "mac": {
      "target": "dmg"
    }
  }
}
```

### 2.2 打包命令

```bash
npm run build
```

打包后会在 `dist/` 目录生成 `.dmg` 安装包。

---

## 第三部分：版本管理

### 3.1 语义化版本号

使用 `major.minor.patch` 格式：
- **major**: 破坏性更新
- **minor**: 新功能，向后兼容
- **patch**: Bug 修复

示例：`1.0.0` → `1.0.1` → `1.1.0` → `2.0.0`

### 3.2 Git Tag 标记版本

```bash
# 创建版本 tag
git tag v1.0.0

# 推送 tag 到远程
git push origin v1.0.0

# 使用 npm 自动更新版本号
npm version patch    # 1.0.0 → 1.0.1
npm version minor    # 1.0.1 → 1.1.0
npm version major    # 1.1.0 → 2.0.0
```

---

## 第四部分：GitHub Actions 自动发布

### 4.1 创建 Workflow 文件

创建 `.github/workflows/release.yml`：

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: macos-latest

    permissions:
      contents: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build and release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npm run build
```

### 4.2 配置 package.json 发布设置

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "你的GitHub用户名",
      "repo": "my-first-electron-app"
    }
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/你的GitHub用户名/my-first-electron-app.git"
  }
}
```

### 4.3 发布流程

```bash
# 1. 修改代码
# 2. 更新版本号
npm version patch

# 3. 提交并推送
git add .
git commit -m "Fix: xxx"
git push
git push origin --tags
```

推送 tag 后，GitHub Actions 会自动构建并发布到 GitHub Releases。

---

## 第五部分：自动更新功能

### 5.1 安装依赖

**注意！** `electron-updater` 必须作为**生产依赖**安装：

```bash
npm install --save electron-updater
```

### 5.2 主进程更新逻辑

```javascript
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')

let mainWindow

// 配置自动更新
autoUpdater.autoDownload = false

// 更新事件监听
autoUpdater.on('checking-for-update', () => {
  sendMessage('info', '正在检查更新...')
})

autoUpdater.on('update-available', (info) => {
  sendMessage('available', `发现新版本 ${info.version}`)
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

// IPC 通信
ipcMain.on('check-update', () => {
  autoUpdater.checkForUpdates()
})

ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate()
})
```

### 5.3 渲染进程 UI

```javascript
const { ipcRenderer } = require('electron')

// 检查更新
document.getElementById('checkUpdate').addEventListener('click', () => {
  ipcRenderer.send('check-update')
})

// 下载更新
ipcRenderer.on('update-message', (event, data) => {
  if (data.event === 'available') {
    // 显示下载按钮
  }
})
```

---

## 第六部分：遇到的坑

### 坑 1：electron-updater 找不到模块

**错误信息：**
```
Error: Cannot find module 'electron-updater'
```

**原因：**
`electron-updater` 被安装在 `devDependencies` 中，打包时不会包含。

**解决方案：**
将 `electron-updater` 移到 `dependencies`：

```bash
npm install --save electron-updater
```

### 坑 2：版本号显示不一致

**问题：**
打包后 `require('../package.json')` 无法正确读取版本号。

**解决方案：**
通过 IPC 从主进程获取版本号：

```javascript
// 主进程
const pkg = require('./package.json')
mainWindow.webContents.send('app-version', pkg.version)

// 渲染进程
ipcRenderer.on('app-version', (event, version) => {
  document.getElementById('version').textContent = version
})
```

### 坑 3：GitHub Release 默认为 Draft 状态

**问题：**
GitHub Actions 构建后，Release 默认是草稿状态，需要手动发布。

**解决方案：**
使用 `gh` 命令自动发布：

```bash
gh release edit v1.0.0 --draft=false
```

或在 workflow 中添加参数。

---

## 第七部分：完整工作流

### 开发流程

```bash
# 1. 开发新功能
# 修改代码

# 2. 测试
npm start

# 3. 提交代码
git add .
git commit -m "Feature: xxx"
git push

# 4. 发布新版本
npm version patch
git push
git push origin --tags

# 5. GitHub Actions 自动构建和发布
# 6. 用户点击应用内"检查更新"即可升级
```

### 发布检查清单

- [ ] 代码已测试
- [ ] `electron-updater` 在 `dependencies` 中
- [ ] 版本号已更新
- [ ] `build.publish` 配置正确
- [ ] Git tag 已推送
- [ ] GitHub Actions 构建成功
- [ ] Release 已发布（非 Draft 状态）

---

## 第八部分：参考资料

- [Electron 官方文档](https://www.electronjs.org/docs)
- [electron-builder 文档](https://www.electron.build/)
- [electron-updater 文档](https://www.electron.build/auto-update)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

## 总结

通过这个项目，学习了：

1. ✅ Electron 基础（主进程、渲染进程）
2. ✅ 应用打包（electron-builder）
3. ✅ 版本管理（语义化版本 + Git Tag）
4. ✅ CI/CD（GitHub Actions）
5. ✅ 自动更新（electron-updater）
6. ✅ 遇到并解决了多个实际问题

**关键要点：**
- `electron-updater` 必须是生产依赖
- 版本号统一从 `package.json` 读取
- GitHub Actions 简化了发布流程
- 完整的自动更新需要正确的配置

---

*文档创建时间：2026-05-29*
