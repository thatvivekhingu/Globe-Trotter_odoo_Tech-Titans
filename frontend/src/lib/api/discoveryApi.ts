import { apiClient } from './client'
import type { ActivityQuery, ApiActivity, ApiCity, CityQuery } from './types'

export async function listCities(params: CityQuery = {}) {
  const response = await apiClient.get<ApiCity[]>('/cities', { params })
  return response.data
}

export async function listActivities(params: ActivityQuery = {}) {
  const response = await apiClient.get<ApiActivity[]>('/activities', { params })
  return response.data
}
