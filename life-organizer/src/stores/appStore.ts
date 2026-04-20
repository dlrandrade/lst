import { create } from 'zustand'
import { Category, Item } from '../types'

interface AppState {
  categories: Category[]
  items: Item[]
  selectedCategory: string | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setCategories: (categories: Category[]) => void
  setItems: (items: Item[]) => void
  setSelectedCategory: (categoryId: string | null) => void
  addCategory: (category: Category) => void
  updateCategory: (category: Category) => void
  deleteCategory: (id: string) => void
  addItem: (item: Item) => void
  updateItem: (item: Item) => void
  deleteItem: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  categories: [],
  items: [],
  selectedCategory: null,
  isLoading: false,
  error: null,

  setCategories: (categories) => set({ categories }),
  setItems: (items) => set({ items }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  
  addCategory: (category) => set((state) => ({ 
    categories: [...state.categories, category] 
  })),
  
  updateCategory: (category) => set((state) => ({
    categories: state.categories.map(c => c.id === category.id ? category : c)
  })),
  
  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter(c => c.id !== id)
  })),
  
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  
  updateItem: (item) => set((state) => ({
    items: state.items.map(i => i.id === item.id ? item : i)
  })),
  
  deleteItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error })
}))
