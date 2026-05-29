import { useChatStore } from '../store/chatStore'
import { useAI } from './useAI'
import type { Message } from '../types/chat'

export function useChat() {
  const {
    conversations,
    currentConversationId,
    isLoading,
    currentModel,
    createConversation,
    deleteConversation,
    setCurrentConversation,
    addMessage,
    updateMessage,
    getMessages,
    setLoading,
    setModel
  } = useChatStore()

  const { isConfigured, chatStream } = useAI()

  const currentConversation = conversations.find((c) => c.id === currentConversationId) || null
  const messages = currentConversation?.messages || []

  const sendMessage = async (content: string) => {
    // 如果没有当前对话，创建一个
    let conversationId = currentConversationId
    if (!conversationId) {
      conversationId = createConversation()
    }

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
      status: 'sent'
    }
    addMessage(conversationId, userMessage)

    // 创建助手消息占位符
    const assistantId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'sending'
    }
    addMessage(conversationId, assistantMessage)

    setLoading(true)

    // 准备消息历史
    const messageHistory = messages.map((m) => ({
      role: m.role,
      content: m.content
    }))
    messageHistory.push({ role: 'user', content })

    // 使用 AI 流式响应
    await chatStream(
      messageHistory,
      (text) => {
        updateMessage(conversationId!, assistantId, {
          content: text,
          status: 'sending'
        })
      },
      () => {
        updateMessage(conversationId!, assistantId, {
          status: 'sent',
          metadata: {
            model: currentModel
          }
        })
        setLoading(false)
      },
      (error) => {
        updateMessage(conversationId!, assistantId, {
          content: `错误: ${error}`,
          status: 'error'
        })
        setLoading(false)
      }
    )
  }

  const startNewChat = () => {
    const id = createConversation()
    setCurrentConversation(id)
  }

  const regenerateLast = () => {
    if (!currentConversation || messages.length === 0) return

    // 获取最后一条用户消息
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUserMessage) return

    // 删除这条消息之后的所有消息
    const lastUserIndex = messages.findIndex((m) => m.id === lastUserMessage.id)
    const messagesToKeep = messages.slice(0, lastUserIndex + 1)

    // 更新对话
    useChatStore.setState((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === currentConversationId
          ? { ...conv, messages: messagesToKeep, updatedAt: Date.now() }
          : conv
      )
    }))

    // 重新发送
    sendMessage(lastUserMessage.content)
  }

  return {
    // 状态
    conversations,
    currentConversation,
    messages,
    isLoading,
    currentModel,
    isConfigured,

    // 操作
    sendMessage,
    startNewChat,
    regenerateLast,
    deleteConversation: (id: string) => {
      deleteConversation(id)
      if (currentConversationId === id) {
        const remaining = conversations.filter((c) => c.id !== id)
        setCurrentConversation(remaining[0]?.id || null)
      }
    },
    selectConversation: setCurrentConversation,
    setModel
  }
}
