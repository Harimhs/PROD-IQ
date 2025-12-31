export type Message = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

export type ChatResponse = {
  response: string
  timestamp: string
}

export type ApiError = {
  error: string
  code?: string
}
