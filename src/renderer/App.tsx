import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import ApiKeyModal from './components/ApiKeyModal'
import { useAI } from './hooks/useAI'

declare global {
  interface Window {
    electronAPI: {
      onUpdateMessage: (callback: (data: { event: string; message: string }) => void) => void
      checkUpdate: () => void
      downloadUpdate: () => void
      onVersion: (callback: (version: string) => void) => void
    }
  }
}

export default function App() {
  const [version, setVersion] = useState<string>('-')
  const [updateStatus, setUpdateStatus] = useState<{
    event: string
    message: string
  } | null>(null)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)

  const { isConfigured, isChecking } = useAI()

  useEffect(() => {
    // 获取版本号
    window.electronAPI.onVersion((v) => setVersion(v))

    // 监听更新消息
    window.electronAPI.onUpdateMessage((data) => {
      setUpdateStatus(data)
    })
  }, [])

  useEffect(() => {
    // 如果不是在检查中且未配置，显示 API Key 模态框
    if (!isChecking && !isConfigured) {
      setShowApiKeyModal(true)
    }
  }, [isChecking, isConfigured])

  return (
    <div className="flex h-screen bg-primary text-gray-100">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        <Header
          version={version}
          isConfigured={isConfigured}
          onOpenApiKeyModal={() => setShowApiKeyModal(true)}
        />
        <ChatArea />
      </div>

      {/* 更新提示 */}
      {updateStatus && (
        <div className="fixed bottom-4 right-4 bg-secondary px-4 py-2 rounded-lg shadow-lg text-sm">
          {updateStatus.message}
        </div>
      )}

      {/* API Key 模态框 */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />
    </div>
  )
}
