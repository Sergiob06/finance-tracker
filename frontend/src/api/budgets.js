import apiClient from './client'

export function fetchBudgets(month) {
  return apiClient.get('/budgets', { params: { month } }).then((res) => res.data.data)
}

export function createBudget(data) {
  return apiClient.post('/budgets', data).then((res) => res.data.data)
}

export function updateBudget(id, data) {
  return apiClient.put(`/budgets/${id}`, data).then((res) => res.data.data)
}

export function deleteBudget(id) {
  return apiClient.delete(`/budgets/${id}`)
}
