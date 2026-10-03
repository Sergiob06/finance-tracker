import apiClient from './client'

export function fetchDashboard() {
  return apiClient.get('/dashboard').then((res) => res.data.data)
}
