import React from 'react'
import { Badge } from './ui'

interface HeaderProps {
  version: string
  isConfigured?: boolean
  onOpenApiKeyModal?: () => void
}

export default function Header({ version, isConfigured = true, onOpenApiKeyModal }: HeaderProps) {
  return (
    <header className="h-14 border-b border-secondary flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">A</span>
        </div>
        <h1 className="font-semibold text-lg">AI Agent Desktop</h1>
        {!isConfigured && (
          <Badge variant="warning" size="sm">未配置</Badge>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* API Key 配置按钮 */}
        <button
          onClick={onOpenApiKeyModal}
          className={`text-sm flex items-center gap-1.5 transition-colors ${
            isConfigured
              ? 'text-gray-500 hover:text-gray-300'
              : 'text-warning hover:text-warning-light'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964a6 6 0 117.743-7.743z" />
          </svg>
          API Key
        </button>

        {/* 版本号 */}
        <div className="text-sm text-gray-500">
          v{version}
        </div>
      </div>
    </header>
  )
}
