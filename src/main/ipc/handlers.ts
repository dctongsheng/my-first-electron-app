import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from 'electron'
import { IPC_CHANNELS } from './channels'
import { getAIService, ChatMessage } from '../services/ai.service'
import fs from 'fs/promises'
import { dialog } from 'electron'

export function registerIPCHandlers() {
  const aiService = getAIService()

  // AI: 检查是否配置
  ipcMain.handle(IPC_CHANNELS.AI_IS_CONFIGURED, () => {
    return aiService.isConfigured()
  })

  // AI: 设置 API Key
  ipcMain.handle(IPC_CHANNELS.AI_SET_API_KEY, (_, apiKey: string) => {
    aiService.setApiKey(apiKey)
    return true
  })

  // AI: 发送消息（非流式）
  ipcMain.handle(IPC_CHANNELS.AI_CHAT, async (_: IpcMainInvokeEvent, params: { messages: ChatMessage[]; model?: string; maxTokens?: number }) => {
    return await aiService.sendMessage(params)
  })

  // AI: 流式消息
  ipcMain.on(IPC_CHANNELS.AI_STREAM, async (event, params: { messages: ChatMessage[]; model?: string; maxTokens?: number }) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return

    try {
      for await (const chunk of aiService.streamMessage(params)) {
        window.webContents.send(IPC_CHANNELS.AI_STREAM_CHUNK, chunk)
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
