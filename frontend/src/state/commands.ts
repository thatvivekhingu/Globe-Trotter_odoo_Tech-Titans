import type { SharedTrip, Trip, TripActivity, TripStop } from '../types/domain'

export interface CreateTripDraft {
  name: string
  description?: string
  startDate: string
  endDate: string
  budgetLimit?: number
  coverImageUrl?: string
}

export interface AddStopDraft {
  cityId: string
  arrivalDate: string
  departureDate: string
  notes?: string
}

export interface AddActivityDraft {
  stopId: string
  activityId: string
  date: string
  startTime: string
  durationMinutes: number
  estimatedCost: number
  notes?: string
}

export interface TripWiseCommands {
  createTrip: (draft: CreateTripDraft) => Promise<Trip>
  updateTrip: (tripId: string, changes: Partial<Trip>) => Promise<Trip>
  deleteTrip: (tripId: string) => Promise<void>
  shareTrip: (tripId: string) => Promise<SharedTrip>
  addStop: (tripId: string, draft: AddStopDraft) => Promise<TripStop>
  updateStop: (tripId: string, stopId: string, changes: Partial<TripStop>) => Promise<TripStop>
  removeStop: (tripId: string, stopId: string) => Promise<void>
  reorderStops: (tripId: string, orderedStopIds: string[]) => Promise<void>
  addActivity: (tripId: string, draft: AddActivityDraft) => Promise<TripActivity>
  updateActivity: (tripId: string, activityId: string, changes: Partial<TripActivity>) => Promise<TripActivity>
  removeActivity: (tripId: string, activityId: string) => Promise<void>
  reorderActivities: (tripId: string, stopId: string, orderedActivityIds: string[]) => Promise<void>
}
