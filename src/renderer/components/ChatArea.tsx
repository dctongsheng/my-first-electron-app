import React, { useState, useEffect, useRef } from 'react'
import { MessageBubble } from './ui'
import { useChat } from '../hooks/useChat'
import FileUpload from './FileUpload'
import WorkflowPanel, { exampleWorkflowSteps } from './WorkflowPanel'

interface UploadedFile {
  path: string
  name: string
  content: string
}

export default function ChatArea() {
  const [input, setInput] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([])
  const [showWorkflow, setShowWorkflow] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, isLoading, sendMessage, regenerateLast, isConfigured } = useChat()

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() && attachedFiles.length === 0) return
    if (isLoading || !isConfigured) return

    // 构建包含文件内容的消息
    let messageContent = input

    if (attachedFiles.length > 0) {
      const fileContext = attachedFiles.map(f => `文件: ${f.name}\n\`\`\`${f.name}\n${f.content}\n\`\`\``).join('\n\n')
      messageContent = `${fileContext}\n\n${input}`
    }

    sendMessage(messageContent)
    setInput('')
    setAttachedFiles([])
    setShowWorkflow(true) // 模拟显示工作流
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant')

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 工作流面板 */}
      {showWorkflow && (
        <div className="px-4 py-2 border-b border-secondary">
          <WorkflowPanel steps={exampleWorkflowSteps} />
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-lg mb-2">开始一段新对话</p>
              <p className="text-sm">输入消息或使用 @ 提及文件</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                content={msg.content}
                role={msg.role}
                timestamp={msg.timestamp}
              />
            ))}

            {/* 加载指示器 */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 重新生成按钮 */}
      {lastAssistantMessage && !isLoading && (
        <div className="flex justify-center py-2">
          <button
            onClick={regenerateLast}
            className="text-sm text-gray-500 hover:text-accent transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            重新生成
          </button>
        </div>
      )}

      {/* 输入区 */}
      <div className="border-t border-secondary p-4">
        <div className="max-w-3xl mx-auto">
          {/* 文件上传 */}
          <div className="mb-2">
            <FileUpload onFilesChange={setAttachedFiles} />
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isConfigured ? "输入消息... (Shift+Enter 换行)" : "请先配置 API Key"}
                rows={1}
                disabled={!isConfigured}
                className="w-full bg-secondary text-gray-100 placeholder-gray-500 rounded-lg px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-accent transition-all disabled:opacity-50"
                style={{ minHeight: '48px', maxHeight: '200px' }}
              />
              <button className="absolute right-2 bottom-2 text-gray-500 hover:text-accent transition-colors p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
            </div>
            <button
              onClick={handleSend}
              disabled={(!input.trim() && attachedFiles.length === 0) || isLoading || !isConfigured}
              className="bg-accent hover:bg-accent-light text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
            </button>
          </div>

          {/* 提示文本 */}
          <div className="text-center mt-2 text-xs text-gray-600">
            Enter 发送 · Shift+Enter 换行 · @ 提及文件 · 拖拽上传
          </div>
        </div>
      </div>
    </div>
  )
}
