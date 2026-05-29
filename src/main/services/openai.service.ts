export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface StreamChunk {
  type: 'content' | 'error' | 'end'
  text?: string
  error?: string
}

export interface OpenAIConfig {
  apiKey: string
  baseURL?: string
  model?: string
}

export class OpenAIService {
  private config: OpenAIConfig | null = null

  constructor(config?: OpenAIConfig) {
    if (config) {
      this.config = config
    }
  }

  setConfig(config: OpenAIConfig) {
    this.config = config
  }

  isConfigured(): boolean {
    return !!this.config?.apiKey
  }

  async sendMessage(params: {
    messages: ChatMessage[]
    model?: string
    maxTokens?: number
    temperature?: number
  }): Promise<{ content: string; model: string; usage?: any }> {
    if (!this.config) {
      throw new Error('OpenAI service not configured. Please set API key.')
    }

    const { messages, model = this.config.model || 'gpt-4o-mini', maxTokens = 4096, temperature = 0.7 } = params
    const baseURL = this.config.baseURL || 'https://api.openai.com/v1'

    try {
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenAI API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content || ''

      return {
        content,
        model: data.model || model,
        usage: data.usage
      }
    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw error
    }
  }

  async *streamMessage(params: {
    messages: ChatMessage[]
    model?: string
    maxTokens?: number
    temperature?: number
    thinking?: boolean
    reasoning_effort?: 'low' | 'high'
  }): AsyncGenerator<StreamChunk> {
    if (!this.config) {
      yield { type: 'error', error: 'OpenAI service not configured. Please set API key.' }
      return
    }

    const { messages, model = this.config.model || 'gpt-4o-mini', maxTokens = 4096, temperature = 0.7, thinking, reasoning_effort } = params
    const baseURL = this.config.baseURL || 'https://api.openai.com/v1'

    try {
      const body: any = {
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
        stream: true
      }

      // DeepSeek specific parameters
      if (thinking) {
        body.thinking = { type: 'enabled' }
      }
      if (reasoning_effort) {
        body.reasoning_effort = reasoning_effort
      }

      const response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const error = await response.text()
        yield { type: 'error', error: `OpenAI API error: ${response.status} - ${error}` }
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        yield { type: 'error', error: 'No response body' }
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue

          const data = trimmed.slice(6)
          if (data === '[DONE]') {
            yield { type: 'end' }
            return
          }

          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta

            if (delta?.content) {
              yield { type: 'content', text: delta.content }
            }

            if (parsed.choices?.[0]?.finish_reason) {
              yield { type: 'end' }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }

      yield { type: 'end' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      yield { type: 'error', error: errorMessage }
    }
  }
}

// Provider presets
export const PROVIDER_PRESETS: Record<string, OpenAIConfig> = {
  openai: {
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini'
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-v4-pro'
  },
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'anthropic/claude-3.5-sonnet'
  }
}

// 单例
let openaiServiceInstance: OpenAIService | null = null

export function getOpenAIService(): OpenAIService {
  if (!openaiServiceInstance) {
    openaiServiceInstance = new OpenAIService()
  }
  return openaiServiceInstance
}
