import React, { useState } from 'react'
import { useAI } from '../hooks/useAI'
import { Modal } from './ui'
import Button from './ui/Button'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const { setApiKey } = useAI()
  const [apiKey, setApiKeyInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('请输入 API Key')
      return
    }

    setIsSaving(true)
    setError('')

    const success = await setApiKey(apiKey.trim())

    setIsSaving(false)

    if (success) {
      onClose()
    } else {
      setError('设置 API Key 失败，请检查格式是否正确')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="配置 Anthropic API Key">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          请输入你的 Anthropic API Key 以启用 AI 功能。
          <br />
          <a
            href="https://console.anthropic.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            获取 API Key →
          </a>
        </p>

        <div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full bg-primary border border-secondary rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {error && (
          <p className="text-sm text-danger">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
