import { useCallback, useEffect, useState } from 'react'

declare global {
  interface Window {
    electronAPI: {
      ai: {
        isConfigured: () => Promise<boolean>
        setApiKey: (apiKey: string) => Promise<boolean>
        chat: (params: any) => Promise<any>
        chatStream: (params: any, onChunk: (chunk: any) => void) => () => void
      }
    }
  }
}

export function useAI() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // 检查 API 配置状态
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const configured = await window.electronAPI.ai.isConfigured()
        setIsConfigured(configured)
      } catch (error) {
        console.error('Failed to check AI config:', error)
        setIsConfigured(false)
      } finally {
        setIsChecking(false)
      }
    }
    checkConfig()
  }, [])

  // 设置 API Key
  const setApiKey = useCallback(async (apiKey: string) => {
    try {
      await window.electronAPI.ai.setApiKey(apiKey)
      const configured = await window.electronAPI.ai.isConfigured()
      setIsConfigured(configured)
      return configured
    } catch (error) {
      console.error('Failed to set API key:', error)
      return false
    }
  }, [])

  // 流式聊天
  const chatStream = useCallback(async (
    messages: Array<{ role: string; content: string }>,
    onChunk: (text: string) => void,
    onComplete?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!isConfigured) {
      onError?.('请先设置 Anthropic API Key')
      return
    }

    try {
      let fullText = ''

      const cleanup = window.electronAPI.ai.chatStream(
        { messages: messages as any },
        (chunk: any) => {
          if (chunk.type === 'content' && chunk.text) {
            fullText += chunk.text
            onChunk(fullText)
          } else if (chunk.type === 'error') {
            onError?.(chunk.error || 'Unknown error')
          } else if (chunk.type === 'end') {
            onComplete?.()
          }
        }
      )

      return cleanup
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Unknown error')
    }
  }, [isConfigured])

  return {
    isConfigured,
    isChecking,
    setApiKey,
    chatStream
  }
}
