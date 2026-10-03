import apiClient from './client'

export function fetchRecurringTransactions() {
  return apiClient.get('/recurring-transactions').then((res) => res.data.data)
}

export function createRecurringTransaction(data) {
  return apiClient.post('/recurring-transactions', data).then((res) => res.data.data)
}

export function updateRecurringTransaction(id, data) {
  return apiClient.put(`/recurring-transactions/${id}`, data).then((res) => res.data.data)
}

export function deleteRecurringTransaction(id) {
  return apiClient.delete(`/recurring-transactions/${id}`)
}
