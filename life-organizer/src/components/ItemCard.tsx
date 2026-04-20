import React from 'react'
import { Item } from '../types'
import { Check, Trash2, Edit, ExternalLink, Calendar, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ItemCardProps {
  item: Item
  onToggle?: (item: Item) => void
  onEdit?: (item: Item) => void
  onDelete?: (item: Item) => void
}

export function ItemCard({ item, onToggle, onEdit, onDelete }: ItemCardProps) {
  return (
    <div className={`bg-white rounded-lg border p-3 transition-colors ${
      item.completed ? 'bg-gray-50 border-gray-200' : 'border-gray-100 hover:border-blue-200'
    }`}>
      <div className="flex items-start gap-3">
        {onToggle && (
          <button
            onClick={() => onToggle(item)}
            className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
              item.completed 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            {item.completed && <Check size={14} />}
          </button>
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
            {item.title}
          </h4>
          
          {item.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
          )}
          
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            {item.due_date && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {format(new Date(item.due_date), 'dd MMM', { locale: ptBR })}
              </span>
            )}
            
            {item.url && (
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:underline"
              >
                <ExternalLink size={12} />
                Link
              </a>
            )}
          </div>
        </div>
        
        {(onEdit || onDelete) && (
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="p-1 hover:bg-gray-100 rounded text-gray-500"
              >
                <Edit size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(item)}
                className="p-1 hover:bg-red-50 rounded text-red-500"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
