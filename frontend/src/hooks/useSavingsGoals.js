import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as savingsGoalsApi from '../api/savingsGoals'

export function useSavingsGoals() {
  return useQuery({ queryKey: ['savingsGoals'], queryFn: savingsGoalsApi.fetchSavingsGoals })
}

function useInvalidateSavingsGoals() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['savingsGoals'] })
}

export function useCreateSavingsGoal() {
  const invalidate = useInvalidateSavingsGoals()
  return useMutation({ mutationFn: savingsGoalsApi.createSavingsGoal, onSuccess: invalidate })
}

export function useUpdateSavingsGoal() {
  const invalidate = useInvalidateSavingsGoals()
  return useMutation({
    mutationFn: ({ id, data }) => savingsGoalsApi.updateSavingsGoal(id, data),
    onSuccess: invalidate,
  })
}

export function useDeleteSavingsGoal() {
  const invalidate = useInvalidateSavingsGoals()
  return useMutation({ mutationFn: savingsGoalsApi.deleteSavingsGoal, onSuccess: invalidate })
}

export function useContributeSavingsGoal() {
  const invalidate = useInvalidateSavingsGoals()
  return useMutation({
    mutationFn: ({ id, amount }) => savingsGoalsApi.contributeSavingsGoal(id, amount),
    onSuccess: invalidate,
  })
}
