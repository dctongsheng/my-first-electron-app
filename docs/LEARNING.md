# Electron 学习笔记：从 Hello World 到 AI Agent 桌面应用

## 项目概述

这是一个从零开始的 Electron 桌面应用开发学习项目，实现了从基础应用到完整的版本管理、自动发布、自动更新功能，并集成了多种 AI Provider 支持。

**项目地址：** https://github.com/dctongsheng/my-first-electron-app

**当前版本：** v1.1.4

---

## 第一部分：项目架构演进

### 1.1 从简单应用到现代化架构

**初始架构：**
```
my-first-electron-app/
├── package.json
├── index.js          # 主进程
├── index.html        # 渲染进程
└── node_modules/
```

**现代化架构（React + TypeScript + Vite）：**
```
my-first-electron-app/
├── package.json
├── electron.vite.config.ts    # Vite 配置
├── tailwind.config.js         # Tailwind 配置
├── postcss.config.js          # PostCSS 配置
├── src/
│   ├── main/                  # 主进程
│   │   ├── index.ts
│   │   ├── ipc/
│   │   │   ├── channels.ts    # IPC 通道定义
│   │   │   └── handlers.ts    # IPC 处理器
│   │   └── services/
│   │       ├── ai.service.ts         # Anthropic AI 服务
│   │       └── openai.service.ts    # OpenAI 兼容服务
│   ├── preload/               # 预加载脚本
│   │   └── index.ts
│   └── renderer/              # 渲染进程
│       ├── index.html
│       ├── components/        # React 组件
│       ├── hooks/             # 自定义 Hooks
│       ├── store/             # 状态管理
│       ├── styles/            # 样式文件
│       └── types/             # TypeScript 类型
└── out/                       # 编译输出
```

### 1.2 核心技术栈

- **Electron**: 桌面应用框架
- **electron-vite**: 快速的开发和构建工具
- **React + TypeScript**: 现代化 UI 开发
- **Tailwind CSS 3.x**: 实用优先的 CSS 框架
- **Zustand**: 轻量级状态管理（支持持久化）
- **@anthropic-ai/sdk**: Anthropic AI SDK
- **marked**: Markdown 解析

### 1.3 安装依赖

```bash
# Electron 核心依赖
npm install --save-dev electron electron-builder electron-vite

# React 相关
npm install react react-dom

# 开发依赖
npm install --save-dev @vitejs/plugin-react typescript @types/react @types/react-dom vite

# UI 相关
npm install --save-dev tailwindcss@3.4.17 postcss autoprefixer
npm install --save-dev @tailwindcss/forms @tailwindcss/typography

# 状态管理
npm install zustand

# 图标库
npm install lucide-react

# AI SDK
npm install @anthropic-ai/sdk

# 自动更新（必须是生产依赖！）
npm install --save electron-updater

# Markdown 解析
npm install marked
```

---

## 第二部分：配置文件详解

### 2.1 electron.vite.config.ts

```typescript
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        output: { entryFileNames: '[name].js' }
      }
    }
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src/renderer') }
    }
  }
})
```

### 2.2 package.json 关键配置

```json
{
  "name": "ai-agent-desktop",
  "version": "1.1.4",
  "main": "out/main/index.js",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build && electron-builder",
    "build:mac": "electron-vite build && electron-builder --mac"
  },
  "build": {
    "appId": "com.aiagent.desktop",
    "productName": "AI Agent",
    "files": ["out/**/*"],
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.developer-tools",
      "hardenedRuntime": true
    },
    "publish": {
      "provider": "github",
      "owner": "dctongsheng",
      "repo": "my-first-electron-app"
    }
  }
}
```

### 2.3 Tailwind CSS 3.x 配置

**重要！** Tailwind CSS 4.x 在生产构建时有配置问题，建议使用 3.x：

**tailwind.config.js:**
```javascript
module.exports = {
  darkMode: ['class'],
  content: ['./src/renderer/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#09090B', light: '#1E1E1E' },
        secondary: { DEFAULT: '#2D2D2D', light: '#3D3D3D' },
        accent: { DEFAULT: '#D4A27F', light: '#E0B89A' }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')
  ]
}
```

**postcss.config.js:**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

**globals.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 不要使用 @import "tailwindcss" */
```

---

## 第三部分：AI Provider 集成

### 3.1 支持的 AI Provider

| Provider | API Base URL | 默认模型 |
|----------|--------------|----------|
| Anthropic | https://api.anthropic.com | claude-3-5-sonnet-20241022 |
| DeepSeek | https://api.deepseek.com | deepseek-v4-pro |
| OpenAI | https://api.openai.com/v1 | gpt-4o-mini |
| OpenRouter | https://openrouter.ai/api/v1 | anthropic/claude-3.5-sonnet |

### 3.2 OpenAI 兼容服务实现

```typescript
// src/main/services/openai.service.ts
export class OpenAIService {
  private config: OpenAIConfig | null = null

  async *streamMessage(params: {
    messages: ChatMessage[]
    model?: string
    maxTokens?: number
    thinking?: boolean
    reasoning_effort?: 'low' | 'high'
  }): AsyncGenerator<StreamChunk> {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        stream: true,
        thinking,      // DeepSeek 特定参数
        reasoning_effort  // DeepSeek 特定参数
      })
    })

    // 解析 SSE 流
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    // ... 流解析逻辑
  }
}
```

### 3.3 IPC 通道设计

```typescript
// IPC 通道定义
export const IPC_CHANNELS = {
  AI_CHAT: 'ai:chat',
  AI_STREAM: 'ai:stream',
  AI_STREAM_CHUNK: 'ai:stream-chunk',
  AI_SET_API_KEY: 'ai:set-api-key',
  AI_SET_PROVIDER: 'ai:set-provider',
  AI_GET_PROVIDERS: 'ai:get-providers',
  AI_IS_CONFIGURED: 'ai:is-configured',
  // ...
}

// 多 Provider 管理
let currentProvider: Provider = 'deepseek'
let providerApiKey: Record<string, string> = {
  deepseek: 'sk-xxx...'
}

const anthropicService = getAIService()
const openaiService = getOpenAIService()
```

---

## 第四部分：遇到的坑与解决方案

### 坑 1：Tailwind CSS 4.x 构建失败

**错误信息：**
```
Error: Cannot apply unknown utility class `bg-primary`
```

**原因：**
Tailwind CSS 4.x 的配置在生产环境中不被正确识别。

**解决方案：**
降级到 Tailwind CSS 3.4.17，使用标准配置方式。

```bash
npm uninstall tailwindcss @tailwindcss/postcss
npm install --save-dev tailwindcss@3.4.17 postcss autoprefixer
```

### 坑 2：electron-updater 找不到模块

**错误信息：**
```
Error: Cannot find module 'electron-updater'
```

**原因：**
`electron-updater` 被安装在 `devDependencies` 中，打包时不会包含。

**解决方案：**
```bash
npm install --save electron-updater  # 注意是 --save 不是 --save-dev
```

### 坑 3：Electron 二进制下载失败

**错误信息：**
```
Error: Electron uninstall
```

**原因：**
网络问题导致 Electron 二进制文件下载不完整或损坏。

**解决方案：**
```bash
# 清除缓存
rm -rf ~/Library/Caches/electron/*
rm -rf node_modules/electron/dist

# 手动下载
curl -L -o ~/Library/Caches/electron/electron-v42.3.0-darwin-arm64.zip \
  https://github.com/electron/electron/releases/download/v42.3.0/electron-v42.3.0-darwin-arm64.zip

# 手动解压
mkdir -p node_modules/electron/dist
unzip ~/Library/Caches/electron/electron-*.zip -d node_modules/electron/

# 创建 path.txt
printf "Electron.app/Contents/MacOS/Electron" > node_modules/electron/path.txt
```

### 坑 4：GitHub Actions 构建超时

**原因：**
Electron 二进制文件较大，下载可能超时。

**解决方案：**
在 workflow 中增加超时时间或使用缓存。

---

## 第五部分：版本管理与发布

### 5.1 发布流程

```bash
# 1. 开发新功能
# 修改代码并测试

# 2. 更新版本号
npm version patch    # 1.1.3 → 1.1.4

# 3. 提交代码
git add .
git commit -m "feat: xxx"
git push

# 4. 推送 tag（已自动完成）
# npm version 会自动创建并推送 tag

# 5. GitHub Actions 自动构建
# 查看：https://github.com/dctongsheng/my-first-electron-app/actions
```

### 5.2 GitHub Actions Workflow

```yaml
name: Release

on:
  push:
    tags: ['v*']

jobs:
  release:
    strategy:
      matrix:
        os: [macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 第六部分：完整工作流

### 开发流程

```bash
# 1. 启动开发服务器
npm run dev

# 2. 修改代码并实时预览

# 3. 测试功能

# 4. 提交代码
git add .
git commit -m "Feature: xxx"
git push

# 5. 发布新版本（可选）
npm version patch
git push
```

### 发布检查清单

- [ ] 代码已测试
- [ ] `electron-updater` 在 `dependencies` 中
- [ ] 版本号已更新
- [ ] `build.publish` 配置正确
- [ ] Git tag 已推送
- [ ] GitHub Actions 构建成功
- [ ] Release 已发布

---

## 第七部分：参考资料

- [Electron 官方文档](https://www.electronjs.org/docs)
- [electron-vite 文档](https://electron-vite.org/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [electron-builder 文档](https://www.electron.build/)
- [DeepSeek API 文档](https://api.deepseek.com/docs)

---

## 总结

通过这个项目，学习了：

1. ✅ Electron 基础（主进程、渲染进程、IPC 通信）
2. ✅ 现代化前端架构（React + TypeScript + Vite）
3. ✅ 应用打包（electron-builder）
4. ✅ 版本管理（语义化版本 + Git Tag）
5. ✅ CI/CD（GitHub Actions）
6. ✅ 自动更新（electron-updater）
7. ✅ AI Provider 集成（Anthropic、OpenAI、DeepSeek、OpenRouter）
8. ✅ 状态管理（Zustand + 持久化）
9. ✅ 样式系统（Tailwind CSS）
10. ✅ 遇到并解决了多个实际问题

**关键要点：**
- `electron-updater` 必须是生产依赖
- Tailwind CSS 3.x 比 4.x 更稳定
- Electron 二进制下载问题需要手动处理
- OpenAI 兼容 API 需要处理 SSE 流
- GitHub Actions 简化了发布流程

---

*文档最后更新：2026-05-29*
*当前版本：v1.1.4*
