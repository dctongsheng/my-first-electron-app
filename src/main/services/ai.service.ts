import Anthropic from '@anthropic-ai/sdk'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface StreamChunk {
  type: 'content' | 'error' | 'end'
  text?: string
  error?: string
}

export class AIService {
  private client: Anthropic | null = null
  private apiKey: string | null = null

  constructor() {
    // 从环境变量或配置中获取 API Key
    this.apiKey = process.env.ANTHROPIC_API_KEY || null

    if (this.apiKey) {
      this.client = new Anthropic({
        apiKey: this.apiKey
      })
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey
    this.client = new Anthropic({ apiKey })
  }

  isConfigured(): boolean {
    return !!this.client && !!this.apiKey
  }

  async sendMessage(params: {
    messages: ChatMessage[]
    model?: string
    maxTokens?: number
    system?: string
  }): Promise<{ content: string; model: string; usage?: any }> {
    if (!this.client) {
      throw new Error('Anthropic client not configured. Please set API key.')
    }

    const { messages, model = 'claude-3-5-sonnet-20241022', maxTokens = 4096, system } = params

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        messages: messages as any
      })

      const content = response.content
        .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
        .map((block) => block.text)
        .join('')

      return {
        content,
        model: response.model,
        usage: response.usage
      }
    } catch (error) {
      console.error('AI API Error:', error)
      throw error
    }
  }

  async *streamMessage(params: {
    messages: ChatMessage[]
    model?: string
    maxTokens?: number
    system?: string
  }): AsyncGenerator<StreamChunk> {
    if (!this.client) {
      yield { type: 'error', error: 'Anthropic client not configured. Please set API key.' }
      return
    }

    const { messages, model = 'claude-3-5-sonnet-20241022', maxTokens = 4096, system } = params

    try {
      const stream = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        messages: messages as any,
        stream: true
      })

      for await (const event of stream) {
        switch (event.type) {
          case 'content_block_delta':
            if (event.delta.type === 'text_delta') {
              yield { type: 'content', text: event.delta.text }
            }
            break
          case 'message_stop':
            yield { type: 'end' }
            break
          case 'error':
            yield { type: 'error', error: event.error.message }
            break
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      yield { type: 'error', error: errorMessage }
    }
  }
}

// 单例
let aiServiceInstance: AIService | null = null

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService()
  }
  return aiServiceInstance
}
