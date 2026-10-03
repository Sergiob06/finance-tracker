import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as transactionsApi from '../api/transactions'

export function useTransactions(filters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsApi.fetchTransactions(filters),
    placeholderData: (previousData) => previousData,
  })
}

function useInvalidateTransactions() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['accounts'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    queryClient.invalidateQueries({ queryKey: ['budgets'] })
  }
}

export function useCreateTransaction() {
  const invalidate = useInvalidateTransactions()
  return useMutation({ mutationFn: transactionsApi.createTransaction, onSuccess: invalidate })
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateTransactions()
  return useMutation({
    mutationFn: ({ id, data }) => transactionsApi.updateTransaction(id, data),
    onSuccess: invalidate,
  })
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateTransactions()
  return useMutation({ mutationFn: transactionsApi.deleteTransaction, onSuccess: invalidate })
}
