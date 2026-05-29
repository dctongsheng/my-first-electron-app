export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  status?: 'sending' | 'sent' | 'error'
  metadata?: {
    model?: string
    tokens?: number
    tools?: ToolCall[]
  }
}

export interface ToolCall {
  name: string
  arguments: Record<string, unknown>
  result?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  model?: string
}

export interface ChatState {
  conversations: Conversation[]
  currentConversationId: string | null
  isLoading: boolean
  currentModel: string

  // 操作
  createConversation: (title?: string) => string
  deleteConversation: (id: string) => void
  setCurrentConversation: (id: string | null) => void

  // 消息操作
  addMessage: (conversationId: string, message: Message) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void
  getMessages: (conversationId: string) => Message[]

  // 状态
  setLoading: (loading: boolean) => void
  setModel: (model: string) => void
}
