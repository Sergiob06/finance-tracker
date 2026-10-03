import apiClient from './client'

export function fetchCategories() {
  return apiClient.get('/categories').then((res) => res.data.data)
}

export function createCategory(data) {
  return apiClient.post('/categories', data).then((res) => res.data.data)
}

export function updateCategory(id, data) {
  return apiClient.put(`/categories/${id}`, data).then((res) => res.data.data)
}

export function deleteCategory(id) {
  return apiClient.delete(`/categories/${id}`)
}
