import { apiClient } from './client'
import type {
  ApiTrip,
  ApiTripActivity,
  ApiTripDetail,
  ApiTripStop,
  TripActivityCreateInput,
  TripActivityUpdateInput,
  TripCreateInput,
  TripStopCreateInput,
  TripStopUpdateInput,
  TripUpdateInput,
} from './types'

export async function listTrips() {
  const response = await apiClient.get<ApiTrip[]>('/trips')
  return response.data
}

export async function getTripDetail(tripId: number) {
  const response = await apiClient.get<ApiTripDetail>(`/trips/${tripId}/itinerary`)
  return response.data
}

export async function createTrip(payload: TripCreateInput) {
  const response = await apiClient.post<ApiTrip>('/trips', payload)
  return response.data
}

export async function updateTrip(tripId: number, payload: TripUpdateInput) {
  const response = await apiClient.patch<ApiTrip>(`/trips/${tripId}`, payload)
  return response.data
}

export async function deleteTrip(tripId: number) {
  await apiClient.delete(`/trips/${tripId}`)
}

export async function createStop(tripId: number, payload: TripStopCreateInput) {
  const response = await apiClient.post<ApiTripStop>(`/trips/${tripId}/stops`, payload)
  return response.data
}

export async function updateStop(tripId: number, stopId: number, payload: TripStopUpdateInput) {
  const response = await apiClient.patch<ApiTripStop>(`/trips/${tripId}/stops/${stopId}`, payload)
  return response.data
}

export async function deleteStop(tripId: number, stopId: number) {
  await apiClient.delete(`/trips/${tripId}/stops/${stopId}`)
}

export async function reorderStops(tripId: number, orderedIds: number[]) {
  const response = await apiClient.post<ApiTripStop[]>(`/trips/${tripId}/stops/reorder`, { ordered_ids: orderedIds })
  return response.data
}

export async function createActivity(tripId: number, payload: TripActivityCreateInput) {
  const response = await apiClient.post<ApiTripActivity>(`/trips/${tripId}/activities`, payload)
  return response.data
}

export async function updateActivity(tripId: number, activityId: number, payload: TripActivityUpdateInput) {
  const response = await apiClient.patch<ApiTripActivity>(`/trips/${tripId}/activities/${activityId}`, payload)
  return response.data
}

export async function deleteActivity(tripId: number, activityId: number) {
  await apiClient.delete(`/trips/${tripId}/activities/${activityId}`)
}

export async function reorderActivities(tripId: number, stopId: number, orderedIds: number[]) {
  const response = await apiClient.post<ApiTripActivity[]>(`/trips/${tripId}/stops/${stopId}/activities/reorder`, { ordered_ids: orderedIds })
  return response.data
}
