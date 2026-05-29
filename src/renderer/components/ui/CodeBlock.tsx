import React, { useState } from 'react'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  className?: string
}

export default function CodeBlock({
  code,
  language = 'typescript',
  filename,
  className = ''
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`code-block ${className}`}>
      {/* Header */}
      <div className="code-header">
        <div className="flex items-center gap-2">
          {filename && (
            <span className="text-gray-400 text-xs">{filename}</span>
          )}
          <span className="text-xs uppercase text-gray-500">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-gray-500 hover:text-gray-300 transition-colors"
          title={copied ? '已复制!' : '复制代码'}
        >
          {copied ? (
            <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Code */}
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-gray-300">{code}</code>
      </pre>
    </div>
  )
}
