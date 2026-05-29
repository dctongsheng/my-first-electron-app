import React, { useState, useEffect } from 'react'
import { Modal } from './ui'
import Button from './ui/Button'
import { useAI } from '../hooks/useAI'
import { Settings as SettingsIcon, Key, Palette, Info, Server } from 'lucide-react'

interface Provider {
  id: string
  name: string
  baseURL: string
  defaultModel: string
}

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const { isConfigured, setApiKey } = useAI()
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState('deepseek')
  const [apiKey, setApiKeyInput] = useState('sk-4b0cc4cab0364ffc9092defa54987644')

  useEffect(() => {
    // 获取可用的 providers
    if (window.electronAPI.ai.getProviders) {
      window.electronAPI.ai.getProviders().then(setProviders).catch(console.error)
    }
  }, [])

  const handleSaveApiKey = async () => {
    if (window.electronAPI.ai.setProvider) {
      await window.electronAPI.ai.setProvider(selectedProvider)
    }
    const success = await setApiKey(apiKey)
    if (success) {
      alert('API Key 已保存')
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="设置">
      <div className="space-y-6">
        {/* Provider 选择 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-4 h-4 text-accent" />
            <h3 className="font-medium">AI 服务提供商</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedProvider === provider.id
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-gray-400 hover:text-gray-100'
                }`}
              >
                {provider.name}
              </button>
            ))}
          </div>
          {providers.find((p) => p.id === selectedProvider) && (
            <div className="mt-2 text-xs text-gray-500">
              API: {providers.find((p) => p.id === selectedProvider)?.baseURL}
            </div>
          )}
        </div>

        {/* API 配置 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-4 h-4 text-accent" />
            <h3 className="font-medium">API Key</h3>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="输入 API Key"
              className="w-full bg-secondary border-none text-gray-100 placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isConfigured ? 'text-success' : 'text-warning'}`}>
                {isConfigured ? '✓ 已配置' : '⚠ 未配置'}
              </span>
              <Button size="sm" onClick={handleSaveApiKey}>
                保存
              </Button>
            </div>
          </div>
        </div>

        {/* 模型选择 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <SettingsIcon className="w-4 h-4 text-accent" />
            <h3 className="font-medium">模型设置</h3>
          </div>
          <select
            value={selectedProvider === 'deepseek' ? 'deepseek-v4-pro' :
                   selectedProvider === 'openai' ? 'gpt-4o-mini' :
                   selectedProvider === 'openrouter' ? 'anthropic/claude-3.5-sonnet' : 'claude-3-5-sonnet-20241022'}
            className="w-full bg-primary border border-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {selectedProvider === 'deepseek' && (
              <>
                <option value="deepseek-v4-pro">DeepSeek V4 Pro</option>
                <option value="deepseek-chat">DeepSeek Chat</option>
              </>
            )}
            {selectedProvider === 'openai' && (
              <>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
              </>
            )}
            {selectedProvider === 'openrouter' && (
              <>
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                <option value="openai/gpt-4o">GPT-4o</option>
                <option value="deepseek/deepseek-v4-pro">DeepSeek V4 Pro</option>
              </>
            )}
            {selectedProvider === 'anthropic' && (
              <>
                <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
              </>
            )}
          </select>
        </div>

        {/* 关于 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-accent" />
            <h3 className="font-medium">关于</h3>
          </div>
          <div className="text-sm text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>版本</span>
              <span>1.1.4</span>
            </div>
            <div className="flex justify-between">
              <span>构建</span>
              <span>Production</span>
            </div>
          </div>
        </div>

        {/* 关闭按钮 */}
        <div className="flex justify-end pt-2">
          <Button onClick={onClose}>关闭</Button>
        </div>
      </div>
    </Modal>
  )
}
