import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Category, Item } from '../types'

export function useCategories(userId: string) {
  return useQuery({
    queryKey: ['categories', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data as Category[]
    },
    enabled: !!userId
  })
}

export function useItems(userId: string, categoryId?: string) {
  return useQuery({
    queryKey: ['items', userId, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data as Item[]
    },
    enabled: !!userId
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single()
      
      if (error) throw error
      return data as Category
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories', data.user_id] })
    }
  })
}

export function useCreateItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (item: Omit<Item, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('items')
        .insert([item])
        .select()
        .single()
      
      if (error) throw error
      return data as Item
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['items', data.user_id] })
    }
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Item> & { id: string }) => {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as Item
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['items', data.user_id] })
    }
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    }
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['items'] })
    }
  })
}
