import { useMutation, useQuery } from '@tanstack/react-query'
import * as authApi from '../api/auth'
import { useAuthStore } from '../store/authStore'

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => setAuth({ user: data.user, token: data.token }),
  })
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => setAuth({ user: data.user, token: data.token }),
  })
}

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth)

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => clearAuth(),
  })
}

export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword })
}

export function useResetPassword() {
  return useMutation({ mutationFn: authApi.resetPassword })
}

export function useCurrentUser() {
  const token = useAuthStore((state) => state.token)
  const setUser = useAuthStore((state) => state.setUser)

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () =>
      authApi.fetchCurrentUser().then((data) => {
        setUser(data.data)
        return data.data
      }),
    enabled: Boolean(token),
    retry: false,
  })
}
