import React from 'react'
import { marked } from 'marked'
import CodeBlock from './CodeBlock'

interface MessageBubbleProps {
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp?: number
}

export default function MessageBubble({ content, role, timestamp }: MessageBubbleProps) {
  // 简单的 Markdown 解析，提取代码块
  const parseContent = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g
    const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // 添加代码块前的文本
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        })
      }
      // 添加代码块
      parts.push({
        type: 'code',
        content: match[2],
        language: match[1] || 'typescript'
      })
      lastIndex = codeBlockRegex.lastIndex
    }

    // 添加剩余文本
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      })
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }]
  }

  const parts = parseContent(content)

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl ${
          role === 'user'
            ? 'bg-accent text-white rounded-tr-sm'
            : role === 'system'
            ? 'bg-primary border border-secondary text-gray-500 text-sm'
            : 'bg-secondary text-gray-100 rounded-tl-sm'
        }`}
      >
        {/* 消息内容 */}
        <div className="px-4 py-2.5">
          {parts.map((part, index) => (
            <div key={index}>
              {part.type === 'code' ? (
                <CodeBlock code={part.content} language={part.language} />
              ) : (
                <p
                  className="whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ __html: marked(part.content) }}
                />
              )}
            </div>
          ))}
        </div>

        {/* 时间戳 */}
        {timestamp && (
          <div
            className={`px-4 pb-2 text-xs opacity-60 ${
              role === 'user' ? 'text-white' : 'text-gray-500'
            }`}
          >
            {new Date(timestamp).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    </div>
  )
}
