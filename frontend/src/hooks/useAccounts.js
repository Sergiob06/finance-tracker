import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as accountsApi from '../api/accounts'

export function useAccounts() {
  return useQuery({ queryKey: ['accounts'], queryFn: accountsApi.fetchAccounts })
}

function useInvalidateAccounts() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: ['accounts'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
  }
}

export function useCreateAccount() {
  const invalidate = useInvalidateAccounts()
  return useMutation({ mutationFn: accountsApi.createAccount, onSuccess: invalidate })
}

export function useUpdateAccount() {
  const invalidate = useInvalidateAccounts()
  return useMutation({
    mutationFn: ({ id, data }) => accountsApi.updateAccount(id, data),
    onSuccess: invalidate,
  })
}

export function useDeleteAccount() {
  const invalidate = useInvalidateAccounts()
  return useMutation({ mutationFn: accountsApi.deleteAccount, onSuccess: invalidate })
}
