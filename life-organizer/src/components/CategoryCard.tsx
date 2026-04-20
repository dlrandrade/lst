import React from 'react'
import { Category } from '../types'
import { 
  Book, 
  Dumbbell, 
  Utensils, 
  Film, 
  Droplets, 
  BookOpen, 
  FileText, 
  Pill, 
  Calendar, 
  CheckSquare,
  Plus,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react'

const iconMap: Record<string, any> = {
  'book': Book,
  'dumbbell': Dumbbell,
  'utensils': Utensils,
  'film': Film,
  'droplets': Droplets,
  'bible': BookOpen,
  'file-text': FileText,
  'pill': Pill,
  'calendar': Calendar,
  'check-square': CheckSquare,
  'default': Book
}

interface CategoryCardProps {
  category: Category
  onClick: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function CategoryCard({ category, onClick, onEdit, onDelete }: CategoryCardProps) {
  const Icon = iconMap[category.icon] || iconMap['default']
  
  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow relative group"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${category.color}20`, color: category.color }}
        >
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{category.name}</h3>
          <p className="text-sm text-gray-500">Toque para ver detalhes</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {onEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Edit size={16} className="text-gray-600" />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="p-1 hover:bg-red-50 rounded"
            >
              <Trash2 size={16} className="text-red-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface AddCategoryCardProps {
  onClick: () => void
}

export function AddCategoryCard({ onClick }: AddCategoryCardProps) {
  return (
    <div 
      className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center min-h-[100px]"
      onClick={onClick}
    >
      <div className="text-center text-gray-400">
        <Plus size={32} className="mx-auto mb-2" />
        <span className="text-sm font-medium">Nova Categoria</span>
      </div>
    </div>
  )
}
