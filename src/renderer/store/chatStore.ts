import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Conversation, Message, ChatState } from '../types/chat'

interface PersistState {
  conversations: Conversation[]
  currentConversationId: string | null
  currentModel: string
}

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString()

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString()

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      isLoading: false,
      currentModel: 'claude-3-5-sonnet-20241022',

      // 创建新对话
      createConversation: (title = '新对话') => {
        const id = generateId()
        const newConversation: Conversation = {
          id,
          title,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          model: get().currentModel
        }

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id
        }))

        return id
      },

      // 删除对话
      deleteConversation: (id) => {
        set((state) => {
          const filtered = state.conversations.filter((c) => c.id !== id)
          return {
            conversations: filtered,
            currentConversationId: state.currentConversationId === id ? null : state.currentConversationId
          }
        })
      },

      // 设置当前对话
      setCurrentConversation: (id) => {
        set({ currentConversationId: id })
      },

      // 添加消息
      addMessage: (conversationId, message) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, message],
                  updatedAt: Date.now()
                }
              : conv
          )
        }))
      },

      // 更新消息
      updateMessage: (conversationId, messageId, updates) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId ? { ...msg, ...updates } : msg
                  ),
                  updatedAt: Date.now()
                }
              : conv
          )
        }))
      },

      // 获取消息
      getMessages: (conversationId) => {
        const conv = get().conversations.find((c) => c.id === conversationId)
        return conv?.messages || []
      },

      // 设置加载状态
      setLoading: (isLoading) => set({ isLoading }),

      // 设置模型
      setModel: (currentModel) => set({ currentModel })
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        currentModel: state.currentModel
      })
    }
  )
)
