import { apiClient } from './client'
import type { ApiSharedTrip } from './types'

export async function createShare(tripId: number) {
  const response = await apiClient.post<ApiSharedTrip>(`/trips/${tripId}/share`)
  return response.data
}

export async function disableShare(tripId: number) {
  await apiClient.delete(`/trips/${tripId}/share`)
}
