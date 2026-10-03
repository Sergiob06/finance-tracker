import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as categoriesApi from '../api/categories'

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: categoriesApi.fetchCategories })
}

function useInvalidateCategories() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['budgets'] })
  }
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({ mutationFn: categoriesApi.createCategory, onSuccess: invalidate })
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: ({ id, data }) => categoriesApi.updateCategory(id, data),
    onSuccess: invalidate,
  })
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({ mutationFn: categoriesApi.deleteCategory, onSuccess: invalidate })
}
