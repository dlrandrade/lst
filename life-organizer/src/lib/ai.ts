import axios from 'axios'

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || ''

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function chatWithAI(
  messages: ChatMessage[], 
  context?: { categories?: any[]; items?: any[] }
): Promise<string> {
  const systemPrompt = `Você é um assistente pessoal inteligente que ajuda o usuário a organizar sua vida. 
Você tem acesso aos dados do usuário incluindo categorias, itens, tarefas, compromissos, etc.
Responda em português de forma útil e amigável.

${context?.categories ? `Categorias do usuário: ${JSON.stringify(context.categories)}` : ''}
${context?.items ? `Itens recentes: ${JSON.stringify(context.items?.slice(0, 10))}` : ''}`

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3-8b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Life Organizer'
        }
      }
    )

    return response.data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua solicitação.'
  } catch (error) {
    console.error('AI Chat Error:', error)
    throw new Error('Erro ao comunicar com a IA')
  }
}
