import { useState } from 'react'
import { chatWithAI, ChatMessage } from '../lib/ai'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (content: string, context?: { categories?: any[]; items?: any[] }) => {
    setIsLoading(true)
    setError(null)

    const userMessage: ChatMessage = { role: 'user', content }
    setMessages(prev => [...prev, userMessage])

    try {
      const allMessages = [...messages, userMessage]
      const response = await chatWithAI(allMessages, context)
      
      const assistantMessage: ChatMessage = { role: 'assistant', content: response }
      setMessages(prev => [...prev, assistantMessage])
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat
  }
}
