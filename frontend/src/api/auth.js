import apiClient from './client'

export function register(data) {
  return apiClient.post('/register', data).then((res) => res.data)
}

export function login(data) {
  return apiClient.post('/login', data).then((res) => res.data)
}

export function logout() {
  return apiClient.post('/logout').then((res) => res.data)
}

export function fetchCurrentUser() {
  return apiClient.get('/user').then((res) => res.data)
}

export function forgotPassword(data) {
  return apiClient.post('/forgot-password', data).then((res) => res.data)
}

export function resetPassword(data) {
  return apiClient.post('/reset-password', data).then((res) => res.data)
}
