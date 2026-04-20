import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Plus, LogOut, User, Settings } from 'lucide-react'
import { CategoryCard, AddCategoryCard } from './CategoryCard'
import { AIChat } from './AIChat'
import { Modal, CategoryForm, ItemForm } from './Modal'
import { ItemCard } from './ItemCard'
import { useCategories, useItems, useCreateCategory, useCreateItem, useUpdateItem, useDeleteItem, useDeleteCategory } from '../hooks/useData'
import { useAppStore } from '../stores/appStore'
import { v4 as uuidv4 } from 'uuid'

// Mock user ID - in real app this would come from auth
const MOCK_USER_ID = 'user-123'

export function Home() {
  const navigate = useNavigate()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const { data: categories = [], isLoading: loadingCategories } = useCategories(MOCK_USER_ID)
  const { data: items = [] } = useItems(MOCK_USER_ID, selectedCategory || undefined)
  
  const createCategory = useCreateCategory()
  const createItem = useCreateItem()
  const updateItem = useUpdateItem()
  const deleteItem = useDeleteItem()
  const deleteCategory = useDeleteCategory()

  const handleCreateCategory = async (data: { name: string; icon: string; color: string }) => {
    await createCategory.mutateAsync({
      ...data,
      user_id: MOCK_USER_ID
    })
    setIsCategoryModalOpen(false)
  }

  const handleCreateItem = async (data: { title: string; description?: string; url?: string; due_date?: string }) => {
    if (!selectedCategory) return
    await createItem.mutateAsync({
      ...data,
      category_id: selectedCategory,
      user_id: MOCK_USER_ID,
      completed: false
    })
    setIsItemModalOpen(false)
  }

  const handleToggleItem = async (item: any) => {
    await updateItem.mutateAsync({
      id: item.id,
      completed: !item.completed
    })
  }

  const handleDeleteItem = async (item: any) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      await deleteItem.mutateAsync(item.id)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria? Todos os itens serão removidos.')) {
      await deleteCategory.mutateAsync(id)
      if (selectedCategory === id) setSelectedCategory(null)
    }
  }

  const selectedCategoryData = categories.find(c => c.id === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Life Organizer</h1>
              <p className="text-sm text-gray-500">Organize sua vida em um só lugar</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsChatOpen(true)}
                className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-shadow"
              >
                <MessageCircle size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <User size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {/* Categories View */}
        {!selectedCategory ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Suas Categorias</h2>
              <span className="text-sm text-gray-500">{categories.length} categorias</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => setSelectedCategory(category.id)}
                  onDelete={() => handleDeleteCategory(category.id)}
                />
              ))}
              
              <AddCategoryCard onClick={() => setIsCategoryModalOpen(true)} />
            </div>
          </>
        ) : (
          /* Items View */
          <>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${selectedCategoryData?.color}20`, color: selectedCategoryData?.color }}
              >
                {selectedCategoryData && (
                  <span className="text-lg font-bold">{selectedCategoryData.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedCategoryData?.name}</h2>
                <p className="text-sm text-gray-500">{items.length} itens</p>
              </div>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onToggle={handleToggleItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>

            <button
              onClick={() => setIsItemModalOpen(true)}
              className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <Plus size={24} />
            </button>
          </>
        )}
      </main>

      {/* Modals */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Nova Categoria"
      >
        <CategoryForm
          onSubmit={handleCreateCategory}
          onCancel={() => setIsCategoryModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={`Adicionar em ${selectedCategoryData?.name}`}
      >
        <ItemForm
          categoryId={selectedCategory!}
          onSubmit={handleCreateItem}
          onCancel={() => setIsItemModalOpen(false)}
        />
      </Modal>

      {/* AI Chat */}
      <AIChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        context={{ categories, items }}
      />
    </div>
  )
}
