import axios from 'axios'
import { getAccessToken } from '../authStorage'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function checkApiHealth(): Promise<boolean> {
  try {
    await axios.get(`${apiClient.defaults.baseURL}/../health`, { timeout: 3000 })
    return true
  } catch {
    return false
  }
}

export function getApiStatusLabel(isOnline: boolean) {
  return isOnline ? 'Live API connected' : 'Preview mode active'
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      const messages = detail.map((item) => typeof item?.msg === 'string' ? item.msg : '').filter(Boolean)
      if (messages.length) return messages.join(' ')
    }
    if (!error.response) return 'The TripWise API is unavailable. Demo preview remains available until the backend is running.'
  }
  return fallback
}
