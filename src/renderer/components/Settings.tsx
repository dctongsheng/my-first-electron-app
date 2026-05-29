import React from 'react'
import { Modal } from './ui'
import Button from './ui/Button'
import { useAI } from '../hooks/useAI'
import { Settings as SettingsIcon, Key, Palette, Info } from 'lucide-react'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const { isConfigured } = useAI()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="设置">
      <div className="space-y-6">
        {/* API 配置 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-4 h-4 text-accent" />
            <h3 className="font-medium">API 配置</h3>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Anthropic API Key</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isConfigured ? 'text-success' : 'text-warning'}`}>
                {isConfigured ? '已配置' : '未配置'}
              </span>
              <Button size="sm" variant="secondary">
                更新
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
          <select className="w-full bg-primary border border-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
            <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (推荐)</option>
            <option value="claude-3-opus-20240229">Claude 3 Opus</option>
            <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
          </select>
        </div>

        {/* 外观 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-accent" />
            <h3 className="font-medium">外观</h3>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">主题</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded bg-primary text-gray-100 text-sm">
                深色
              </button>
              <button className="px-3 py-1 rounded bg-secondary text-gray-400 text-sm">
                浅色
              </button>
            </div>
          </div>
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
              <span>1.0.2</span>
            </div>
            <div className="flex justify-between">
              <span>构建</span>
              <span>Development</span>
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
