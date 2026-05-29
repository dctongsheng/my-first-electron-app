import React, { useState } from 'react'
import { useChat } from '../hooks/useChat'
import { Trash2, MessageSquare, Settings } from 'lucide-react'
import SettingsModal from './Settings'

export default function Sidebar() {
  const {
    conversations,
    currentConversationId,
    selectConversation,
    deleteConversation,
    startNewChat
  } = useChat()

  const [showSettings, setShowSettings] = useState(false)

  // 按日期分组对话
  const groupedConversations = React.useMemo(() => {
    const groups: Record<string, typeof conversations> = {}
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000

    conversations.forEach((conv) => {
      const age = now - conv.updatedAt
      let group = '更早'

      if (age < day) {
        group = '今天'
      } else if (age < 7 * day) {
        group = '本周'
      } else if (age < 30 * day) {
        group = '本月'
      }

      if (!groups[group]) groups[group] = []
      groups[group].push(conv)
    })

    return groups
  }, [conversations])

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('确定要删除这个对话吗？')) {
      deleteConversation(id)
    }
  }

  return (
    <>
      <aside className="w-64 bg-secondary-light border-r border-secondary flex flex-col">
        {/* 新对话按钮 */}
        <div className="p-3">
          <button
            onClick={startNewChat}
            className="w-full bg-accent hover:bg-accent-light text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新对话
          </button>
        </div>

        {/* 对话列表 */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          {Object.keys(groupedConversations).length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>还没有对话</p>
            </div>
          ) : (
            Object.entries(groupedConversations).map(([group, convs]) => (
              <div key={group}>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2 mt-2 first:mt-0">
                  {group}
                </div>
                <div className="space-y-1">
                  {convs.map((conv) => (
                    <div key={conv.id} className="group relative">
                      <button
                        onClick={() => selectConversation(conv.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          currentConversationId === conv.id
                            ? 'bg-primary text-white'
                            : 'hover:bg-primary text-gray-400 hover:text-gray-100'
                        }`}
                      >
                        <div className="truncate">{conv.title}</div>
                        <div className="text-xs opacity-60 mt-0.5">
                          {conv.messages.length} 条消息
                        </div>
                      </button>

                      {/* 删除按钮 */}
                      <button
                        onClick={(e) => handleDelete(e, conv.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-500 hover:text-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部设置 */}
        <div className="p-3 border-t border-secondary">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary transition-colors text-sm text-gray-400"
          >
            <Settings className="w-4 h-4" />
            设置
          </button>
        </div>
      </aside>

      {/* 设置弹窗 */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}
