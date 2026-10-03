import apiClient from './client'

export function fetchAccounts() {
  return apiClient.get('/accounts').then((res) => res.data.data)
}

export function createAccount(data) {
  return apiClient.post('/accounts', data).then((res) => res.data.data)
}

export function updateAccount(id, data) {
  return apiClient.put(`/accounts/${id}`, data).then((res) => res.data.data)
}

export function deleteAccount(id) {
  return apiClient.delete(`/accounts/${id}`)
}
