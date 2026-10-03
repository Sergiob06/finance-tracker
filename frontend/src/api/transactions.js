import apiClient from './client'

function toFormData(data) {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return
    formData.append(key, value)
  })

  return formData
}

export function fetchTransactions(params) {
  return apiClient.get('/transactions', { params }).then((res) => res.data)
}

export function createTransaction(data) {
  if (data.receipt instanceof File) {
    return apiClient.post('/transactions', toFormData(data)).then((res) => res.data.data)
  }

  return apiClient.post('/transactions', data).then((res) => res.data.data)
}

export function updateTransaction(id, data) {
  if (data.receipt instanceof File) {
    const formData = toFormData(data)
    formData.append('_method', 'PUT')
    return apiClient.post(`/transactions/${id}`, formData).then((res) => res.data.data)
  }

  return apiClient.put(`/transactions/${id}`, data).then((res) => res.data.data)
}

export function deleteTransaction(id) {
  return apiClient.delete(`/transactions/${id}`)
}

export async function exportTransactions(params, format) {
  const response = await apiClient.get(`/transactions/export/${format}`, {
    params,
    responseType: 'blob',
  })

  const url = URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.download = `transacciones.${format}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
