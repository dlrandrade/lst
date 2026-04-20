import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

interface CategoryFormProps {
  onSubmit: (data: { name: string; icon: string; color: string }) => void
  onCancel: () => void
  initialData?: { name: string; icon: string; color: string }
}

const icons = [
  { value: 'book', label: 'Livro' },
  { value: 'dumbbell', label: 'Treino' },
  { value: 'utensils', label: 'Dieta' },
  { value: 'film', label: 'Filmes' },
  { value: 'droplets', label: 'Água' },
  { value: 'bible', label: 'Bíblia' },
  { value: 'file-text', label: 'Exames' },
  { value: 'pill', label: 'Remédios' },
  { value: 'calendar', label: 'Compromissos' },
  { value: 'check-square', label: 'Tarefas' }
]

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
]

export function CategoryForm({ onSubmit, onCancel, initialData }: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [selectedIcon, setSelectedIcon] = useState(initialData?.icon || 'book')
  const [selectedColor, setSelectedColor] = useState(initialData?.color || '#3B82F6')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name, icon: selectedIcon, color: selectedColor })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome da Categoria
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Dieta, Treino, Livros..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ícone
        </label>
        <div className="grid grid-cols-5 gap-2">
          {icons.map((icon) => (
            <button
              key={icon.value}
              type="button"
              onClick={() => setSelectedIcon(icon.value)}
              className={`p-2 rounded-lg border-2 transition-colors ${
                selectedIcon === icon.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              title={icon.label}
            >
              <span className="text-xs">{icon.label.slice(0, 2)}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cor
        </label>
        <div className="flex gap-2 flex-wrap">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                selectedColor === color ? 'border-gray-800 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="preview mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: selectedColor }}
          >
            <span className="text-xs font-bold">{name.slice(0, 2).toUpperCase() || '??'}</span>
          </div>
          <span className="font-medium">{name || 'Nome da Categoria'}</span>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {initialData ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  )
}

interface ItemFormProps {
  onSubmit: (data: { title: string; description?: string; url?: string; due_date?: string }) => void
  onCancel: () => void
  categoryId: string
  initialData?: { title: string; description?: string; url?: string; due_date?: string }
}

export function ItemForm({ onSubmit, onCancel, categoryId, initialData }: ItemFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [url, setUrl] = useState(initialData?.url || '')
  const [dueDate, setDueDate] = useState(initialData?.due_date || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({ title, description: description || undefined, url: url || undefined, due_date: dueDate || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="O que você quer adicionar?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalhes adicionais..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL (opcional)
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data de Vencimento (opcional)
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {initialData ? 'Atualizar' : 'Adicionar'}
        </button>
      </div>
    </form>
  )
}
