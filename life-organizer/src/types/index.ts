export interface Category {
  id: string
  name: string
  icon: string
  color: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Item {
  id: string
  category_id: string
  title: string
  description?: string
  url?: string
  completed?: boolean
  due_date?: string
  metadata?: Record<string, any>
  user_id: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}
