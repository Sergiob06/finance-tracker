import apiClient from './client'

export function fetchSavingsGoals() {
  return apiClient.get('/savings-goals').then((res) => res.data.data)
}

export function createSavingsGoal(data) {
  return apiClient.post('/savings-goals', data).then((res) => res.data.data)
}

export function updateSavingsGoal(id, data) {
  return apiClient.put(`/savings-goals/${id}`, data).then((res) => res.data.data)
}

export function deleteSavingsGoal(id) {
  return apiClient.delete(`/savings-goals/${id}`)
}

export function contributeSavingsGoal(id, amount) {
  return apiClient.post(`/savings-goals/${id}/contribute`, { amount }).then((res) => res.data.data)
}
