import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from 'electron'
import { IPC_CHANNELS } from './channels'
import { getAIService, ChatMessage } from '../services/ai.service'
import { getOpenAIService, PROVIDER_PRESETS, ChatMessage as OpenAIChatMessage } from '../services/openai.service'
import fs from 'fs/promises'
import { dialog } from 'electron'

type Provider = 'anthropic' | 'openai' | 'deepseek' | 'openrouter'

// 默认使用 DeepSeek
let currentProvider: Provider = 'deepseek'
// 默认 DeepSeek API Key
let providerApiKey: Record<string, string> = {
  deepseek: 'sk-4b0cc4cab0364ffc9092defa54987644'
}

const anthropicService = getAIService()
const openaiService = getOpenAIService()

// 初始化时配置 DeepSeek
const deepseekPreset = PROVIDER_PRESETS.deepseek
if (deepseekPreset && providerApiKey.deepseek) {
  openaiService.setConfig({
    apiKey: providerApiKey.deepseek,
    baseURL: deepseekPreset.baseURL,
    model: deepseekPreset.model
  })
}

export function registerIPCHandlers() {
  // AI: 设置 Provider
  ipcMain.handle(IPC_CHANNELS.AI_SET_PROVIDER, (_, provider: Provider) => {
    currentProvider = provider
    // 重置 OpenAI service 配置
    if (provider !== 'anthropic') {
      const preset = PROVIDER_PRESETS[provider]
      if (preset && providerApiKey[provider]) {
        openaiService.setConfig({
          apiKey: providerApiKey[provider],
          baseURL: preset.baseURL,
          model: preset.model
        })
      }
    }
    return true
  })

  // AI: 获取支持的 Providers
  ipcMain.handle(IPC_CHANNELS.AI_GET_PROVIDERS, () => {
    return Object.keys(PROVIDER_PRESETS).map(key => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      baseURL: PROVIDER_PRESETS[key].baseURL,
      defaultModel: PROVIDER_PRESETS[key].model
    }))
  })

  // AI: 检查是否配置
  ipcMain.handle(IPC_CHANNELS.AI_IS_CONFIGURED, () => {
    if (currentProvider === 'anthropic') {
      return anthropicService.isConfigured()
    }
    return openaiService.isConfigured()
  })

  // AI: 设置 API Key
  ipcMain.handle(IPC_CHANNELS.AI_SET_API_KEY, (_, apiKey: string) => {
    providerApiKey[currentProvider] = apiKey

    if (currentProvider === 'anthropic') {
      anthropicService.setApiKey(apiKey)
    } else {
      const preset = PROVIDER_PRESETS[currentProvider]
      if (preset) {
        openaiService.setConfig({
          apiKey,
          baseURL: preset.baseURL,
          model: preset.model
        })
      }
    }
    return true
  })

  // AI: 发送消息（非流式）
  ipcMain.handle(IPC_CHANNELS.AI_CHAT, async (_: IpcMainInvokeEvent, params: {
    messages: ChatMessage[]
    model?: string
    maxTokens?: number
  }) => {
    if (currentProvider === 'anthropic') {
      return await anthropicService.sendMessage(params)
    }
    return await openaiService.sendMessage({
      messages: params.messages as OpenAIChatMessage[],
      model: params.model,
      maxTokens: params.maxTokens
    })
  })

  // AI: 流式消息
  ipcMain.on(IPC_CHANNELS.AI_STREAM, async (event, params: {
    messages: ChatMessage[]
    model?: string
    maxTokens?: number
  }) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return

    try {
      if (currentProvider === 'anthropic') {
        for await (const chunk of anthropicService.streamMessage(params)) {
          window.webContents.send(IPC_CHANNELS.AI_STREAM_CHUNK, chunk)
        }
      } else {
        for await (const chunk of openaiService.streamMessage({
          messages: params.messages as OpenAIChatMessage[],
          model: params.model,
          maxTokens: params.maxTokens
        })) {
          window.webContents.send(IPC_CHANNELS.AI_STREAM_CHUNK, chunk)
        }
      }
    } catch (error) {
      window.webContents.send(IPC_CHANNELS.AI_STREAM_CHUNK, {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // 文件: 选择文件
  ipcMain.handle(IPC_CHANNELS.FILE_SELECT, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Text', extensions: ['txt', 'md', 'js', 'ts', 'jsx', 'tsx', 'json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // 文件: 读取
  ipcMain.handle(IPC_CHANNELS.FILE_READ, async (_: IpcMainInvokeEvent, filePath: string) => {
    return await fs.readFile(filePath, 'utf-8')
  })

  // 文件: 写入
  ipcMain.handle(IPC_CHANNELS.FILE_WRITE, async (_: IpcMainInvokeEvent, filePath: string, content: string) => {
    await fs.writeFile(filePath, content, 'utf-8')
    return true
  })

  console.log('IPC handlers registered')
}
