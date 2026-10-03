import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as budgetsApi from '../api/budgets'

export function useBudgets(month) {
  return useQuery({ queryKey: ['budgets', month], queryFn: () => budgetsApi.fetchBudgets(month) })
}

function useInvalidateBudgets() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['budgets'] })
}

export function useCreateBudget() {
  const invalidate = useInvalidateBudgets()
  return useMutation({ mutationFn: budgetsApi.createBudget, onSuccess: invalidate })
}

export function useUpdateBudget() {
  const invalidate = useInvalidateBudgets()
  return useMutation({
    mutationFn: ({ id, data }) => budgetsApi.updateBudget(id, data),
    onSuccess: invalidate,
  })
}

export function useDeleteBudget() {
  const invalidate = useInvalidateBudgets()
  return useMutation({ mutationFn: budgetsApi.deleteBudget, onSuccess: invalidate })
}
