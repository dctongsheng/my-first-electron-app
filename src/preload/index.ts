import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../main/ipc/channels'

contextBridge.exposeInMainWorld('electronAPI', {
  // AI 相关
  ai: {
    isConfigured: () => ipcRenderer.invoke(IPC_CHANNELS.AI_IS_CONFIGURED),
    setApiKey: (apiKey: string) => ipcRenderer.invoke(IPC_CHANNELS.AI_SET_API_KEY, apiKey),
    chat: (params: any) => ipcRenderer.invoke(IPC_CHANNELS.AI_CHAT, params),
    chatStream: (params: any, onChunk: (chunk: any) => void) => {
      const listener = (_: any, chunk: any) => onChunk(chunk)
      ipcRenderer.on(IPC_CHANNELS.AI_STREAM_CHUNK, listener)
      ipcRenderer.send(IPC_CHANNELS.AI_STREAM, params)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.AI_STREAM_CHUNK, listener)
    }
  },

  // 文件操作
  file: {
    select: () => ipcRenderer.invoke(IPC_CHANNELS.FILE_SELECT),
    read: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_READ, path),
    write: (path: string, content: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_WRITE, path, content)
  },

  // 更新相关
  onUpdateMessage: (callback: (data: { event: string; message: string }) => void) => {
    ipcRenderer.on(IPC_CHANNELS.UPDATE_MESSAGE, (_, data) => callback(data))
  },
  checkUpdate: () => ipcRenderer.send(IPC_CHANNELS.UPDATE_CHECK),
  downloadUpdate: () => ipcRenderer.send(IPC_CHANNELS.UPDATE_DOWNLOAD),

  // 版本信息
  onVersion: (callback: (version: string) => void) => {
    ipcRenderer.on(IPC_CHANNELS.APP_VERSION, (_, version) => callback(version))
  }
})
