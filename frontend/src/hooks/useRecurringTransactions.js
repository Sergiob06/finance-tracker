import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as recurringApi from '../api/recurringTransactions'

export function useRecurringTransactions() {
  return useQuery({
    queryKey: ['recurringTransactions'],
    queryFn: recurringApi.fetchRecurringTransactions,
  })
}

function useInvalidateRecurringTransactions() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] })
}

export function useCreateRecurringTransaction() {
  const invalidate = useInvalidateRecurringTransactions()
  return useMutation({ mutationFn: recurringApi.createRecurringTransaction, onSuccess: invalidate })
}

export function useUpdateRecurringTransaction() {
  const invalidate = useInvalidateRecurringTransactions()
  return useMutation({
    mutationFn: ({ id, data }) => recurringApi.updateRecurringTransaction(id, data),
    onSuccess: invalidate,
  })
}

export function useDeleteRecurringTransaction() {
  const invalidate = useInvalidateRecurringTransactions()
  return useMutation({ mutationFn: recurringApi.deleteRecurringTransaction, onSuccess: invalidate })
}
