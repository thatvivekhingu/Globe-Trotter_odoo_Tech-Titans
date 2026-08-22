import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { createInitialDb, imageAssets } from '../mock/data'
import { getApiErrorMessage } from '../lib/api/client'
import { cachedRequest, clearApiCache, invalidateCache } from '../lib/api/cache'
import { listActivities, listCities } from '../lib/api/discoveryApi'
import { mapApiActivity, mapApiCity, mapApiSharedTrip, mapApiStop, mapApiTrip, mapApiTripActivity, mapApiTripDetail } from '../lib/api/mappers'
import { createShare as createRemoteShare } from '../lib/api/sharingApi'
import { createActivity as createRemoteActivity, createStop as createRemoteStop, createTrip as createRemoteTrip, deleteActivity as deleteRemoteActivity, deleteStop as deleteRemoteStop, deleteTrip as deleteRemoteTrip, getTripDetail, listTrips, reorderActivities as reorderRemoteActivities, reorderStops as reorderRemoteStops, updateActivity as updateRemoteActivity, updateStop as updateRemoteStop, updateTrip as updateRemoteTrip } from '../lib/api/tripsApi'
import type { ApiTripDetail } from '../lib/api/types'
import { DEMO_STATE_KEY, getAccessToken } from '../lib/authStorage'
import type { SharedTrip, Trip, TripActivity, TripStop, TripWiseState } from '../types/domain'
import { TripWiseContext, type RemoteMode, type RemoteStatus, type TripWiseContextValue } from './TripWiseContext'
import type { AddActivityDraft, AddStopDraft, CreateTripDraft, TripWiseCommands } from './commands'
import { tripWiseReducer } from './reducer'

const SYNC_CHANNEL_NAME = 'globetrotter-realtime-sync'

function createInitialState(): TripWiseState {
  const initialDb = createInitialDb()
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(DEMO_STATE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TripWiseState
        if (parsed?.db?.trips?.length) {
          const hasMmtTrip = parsed.db.trips.some(t => t.id === 'trip-goa-mmt')
          if (!hasMmtTrip) {
            parsed.db = initialDb
          } else {
            parsed.db.cities = initialDb.cities
            parsed.db.activities = initialDb.activities
          }
          return parsed
        }
      } catch {
        window.localStorage.removeItem(DEMO_STATE_KEY)
      }
    }
  }

  return {
    db: createInitialDb(),
    currentUserId: 'user-1',
    selectedTripId: 'trip-goa-mmt',
    activeCalendarView: 'calendar',
    selectedDayId: '2026-10-03',
    toast: null,
  }
}

function numericId(id: string) {
  const parsed = Number(id)
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error('This action requires a saved database record.')
  return parsed
}

function toLocalTripFromDraft(draft: CreateTripDraft, ownerId: string): Trip {
  const now = new Date().toISOString()
  return {
    id: `trip-${Date.now()}`,
    ownerId,
    name: draft.name.trim(),
    description: draft.description?.trim() || 'A new chapter waiting to be planned.',
    startDate: draft.startDate,
    endDate: draft.endDate,
    currency: 'INR',
    budgetLimit: draft.budgetLimit,
    coverImageUrl: draft.coverImageUrl?.trim() || imageAssets.amalfi,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  }
}

export function TripWiseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripWiseReducer, undefined, createInitialState)
  const isBroadcastingRef = useRef(false)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const [remoteStatus, setRemoteStatus] = useState<RemoteStatus>('idle')
  const [remoteError, setRemoteError] = useState<string | null>(null)
  const remoteMode: RemoteMode = getAccessToken() ? 'remote' : 'demo'

  // 1. LocalStorage Persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state))
    }
  }, [state])

  // 2. Real-time Multi-Tab Broadcast Sync
  useEffect(() => {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return

    const channel = new BroadcastChannel(SYNC_CHANNEL_NAME)
    channelRef.current = channel

    channel.onmessage = (event) => {
      if (event.data?.type === 'SYNC_STATE' && event.data?.payload) {
        isBroadcastingRef.current = true
        const incomingState = event.data.payload as TripWiseState
        if (incomingState?.db) {
          window.localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(incomingState))
        }
        isBroadcastingRef.current = false
      }
    }

    return () => {
      channel.close()
    }
  }, [])

  // Broadcast local changes to other tabs
  useEffect(() => {
    if (isBroadcastingRef.current || !channelRef.current) return
    channelRef.current.postMessage({ type: 'SYNC_STATE', payload: state })
  }, [state])

  // 3. Auto-dismiss Toast Timer
  useEffect(() => {
    if (!state.toast) return undefined
    const timer = window.setTimeout(() => dispatch({ type: 'DISMISS_TOAST' }), 3600)
    return () => window.clearTimeout(timer)
  }, [state.toast])

  const currentUser = state.db.users.find((user) => user.id === state.currentUserId)

  const refreshTrip = useCallback(async (tripId: string) => {
    if (!getAccessToken()) return
    const detail = await cachedRequest<ApiTripDetail>(`trip:${numericId(tripId)}:detail`, () => getTripDetail(numericId(tripId)))
    dispatch({ type: 'REPLACE_TRIP_DETAIL', detail: mapApiTripDetail(detail) })
  }, [])

  const refreshRemote = useCallback(async () => {
    const userId = state.currentUserId
    if (!getAccessToken() || !userId) return

    setRemoteStatus('loading')
    setRemoteError(null)
    try {
      const [apiTrips, apiCities, apiActivities] = await Promise.all([
        cachedRequest(`trips:${userId}`, listTrips),
        cachedRequest('cities', () => listCities({ limit: 100 })),
        cachedRequest('activities', () => listActivities({ limit: 100 })),
      ])
      const details = await Promise.all(apiTrips.map((trip) => cachedRequest(`trip:${trip.id}:detail`, () => getTripDetail(trip.id))))
      dispatch({
        type: 'HYDRATE_REMOTE',
        trips: apiTrips.map(mapApiTrip),
        cities: apiCities.map(mapApiCity),
        activities: apiActivities.map(mapApiActivity),
        details: details.map(mapApiTripDetail),
      })
      setRemoteStatus('ready')
    } catch (error) {
      setRemoteStatus('error')
      setRemoteError(getApiErrorMessage(error))
      throw error
    }
  }, [state.currentUserId])

  useEffect(() => {
    if (!state.currentUserId || !getAccessToken()) return undefined
    const timer = window.setTimeout(() => { void refreshRemote().catch(() => undefined) }, 0)
    return () => window.clearTimeout(timer)
  }, [refreshRemote, state.currentUserId])

  const commands = useMemo<TripWiseCommands>(() => {
    const remote = Boolean(getAccessToken())
    const ownerId = state.currentUserId || 'user-1'

    return {
      async createTrip(draft) {
        if (remote) {
          const trip = mapApiTrip(await createRemoteTrip({
            name: draft.name.trim(),
            description: draft.description?.trim() || undefined,
            start_date: draft.startDate,
            end_date: draft.endDate,
            currency: 'INR',
            budget_limit: draft.budgetLimit,
            cover_image_url: draft.coverImageUrl?.trim() || undefined,
          }))
          dispatch({ type: 'CREATE_TRIP', trip })
          invalidateCache(`trips:${ownerId}`)
          return trip
        }
        const trip = toLocalTripFromDraft(draft, ownerId)
        dispatch({ type: 'CREATE_TRIP', trip })
        return trip
      },

      async updateTrip(tripId, changes) {
        if (remote) {
          const trip = mapApiTrip(await updateRemoteTrip(numericId(tripId), {
            name: changes.name,
            description: changes.description,
            start_date: changes.startDate,
            end_date: changes.endDate,
            currency: changes.currency,
            budget_limit: changes.budgetLimit,
            cover_image_url: changes.coverImageUrl,
            status: changes.status,
          }))
          dispatch({ type: 'UPDATE_TRIP', tripId, changes: trip })
          invalidateCache(`trips:${ownerId}`, `trip:${numericId(tripId)}:detail`)
          return trip
        }
        const existing = state.db.trips.find((trip) => trip.id === tripId)
        const trip = existing ? { ...existing, ...changes, updatedAt: new Date().toISOString() } : undefined
        dispatch({ type: 'UPDATE_TRIP', tripId, changes })
        if (!trip) throw new Error('Trip not found.')
        return trip
      },

      async deleteTrip(tripId) {
        if (remote) {
          await deleteRemoteTrip(numericId(tripId))
          invalidateCache(`trips:${ownerId}`, `trip:${numericId(tripId)}:detail`)
        }
        dispatch({ type: 'DELETE_TRIP', tripId })
      },

      async shareTrip(tripId) {
        let sharedTrip: SharedTrip
        if (remote) {
          sharedTrip = mapApiSharedTrip(await createRemoteShare(numericId(tripId)))
        } else {
          sharedTrip = {
            id: `share-${tripId}`,
            tripId,
            shareToken: `tripwise-${tripId}`,
            isActive: true,
            createdAt: new Date().toISOString(),
          }
        }
        dispatch({ type: 'CREATE_SHARE', sharedTrip })
        return sharedTrip
      },

      async addStop(tripId, draft: AddStopDraft) {
        if (remote) {
          const stop = mapApiStop(await createRemoteStop(numericId(tripId), {
            city_id: numericId(draft.cityId),
            arrival_date: draft.arrivalDate,
            departure_date: draft.departureDate,
            notes: draft.notes,
          }))
          dispatch({ type: 'ADD_STOP', stop })
          invalidateCache(`trip:${numericId(tripId)}:detail`)
          return stop
        }
        const stop: TripStop = {
          id: `stop-${tripId}-${draft.cityId}-${Date.now()}`,
          tripId,
          cityId: draft.cityId,
          arrivalDate: draft.arrivalDate,
          departureDate: draft.departureDate,
          order: state.db.tripStops.filter((item) => item.tripId === tripId).length,
          notes: draft.notes,
        }
        dispatch({ type: 'ADD_STOP', stop })
        return stop
      },

      async updateStop(tripId, stopId, changes) {
        if (remote) {
          const stop = mapApiStop(await updateRemoteStop(numericId(tripId), numericId(stopId), {
            city_id: changes.cityId ? numericId(changes.cityId) : undefined,
            arrival_date: changes.arrivalDate,
            departure_date: changes.departureDate,
            notes: changes.notes,
          }))
          dispatch({ type: 'UPDATE_STOP', stopId, changes: stop })
          invalidateCache(`trip:${numericId(tripId)}:detail`)
          return stop
        }
        const existing = state.db.tripStops.find((stop) => stop.id === stopId)
        const stop = existing ? { ...existing, ...changes } : undefined
        dispatch({ type: 'UPDATE_STOP', stopId, changes })
        if (!stop) throw new Error('City stop not found.')
        return stop
      },

      async removeStop(tripId, stopId) {
        if (remote) {
          await deleteRemoteStop(numericId(tripId), numericId(stopId))
          invalidateCache(`trip:${numericId(tripId)}:detail`)
        }
        dispatch({ type: 'REMOVE_STOP', stopId })
      },

      async reorderStops(tripId, orderedStopIds) {
        if (remote) {
          await reorderRemoteStops(numericId(tripId), orderedStopIds.map(numericId))
          invalidateCache(`trip:${numericId(tripId)}:detail`)
        }
        dispatch({ type: 'REORDER_STOPS', tripId, orderedStopIds })
      },

      async addActivity(tripId, draft: AddActivityDraft) {
        if (remote) {
          const activity = mapApiTripActivity(await createRemoteActivity(numericId(tripId), {
            trip_stop_id: numericId(draft.stopId),
            activity_id: numericId(draft.activityId),
            scheduled_date: draft.date,
            start_time: draft.startTime,
            duration_minutes: draft.durationMinutes,
            estimated_cost: draft.estimatedCost,
            notes: draft.notes,
          }))
          dispatch({ type: 'ADD_TRIP_ACTIVITY', activity })
          invalidateCache(`trip:${numericId(tripId)}:detail`)
          return activity
        }
        const activity: TripActivity = {
          id: `trip-activity-${tripId}-${draft.activityId}-${Date.now()}`,
          tripId,
          stopId: draft.stopId,
          activityId: draft.activityId,
          date: draft.date,
          startTime: draft.startTime,
          durationMinutes: draft.durationMinutes,
          estimatedCost: draft.estimatedCost,
          order: state.db.tripActivities.filter((item) => item.stopId === draft.stopId).length,
          notes: draft.notes,
        }
        dispatch({ type: 'ADD_TRIP_ACTIVITY', activity })
        return activity
      },

      async updateActivity(tripId, activityId, changes) {
        if (remote) {
          const activity = mapApiTripActivity(await updateRemoteActivity(numericId(tripId), numericId(activityId), {
            trip_stop_id: changes.stopId ? numericId(changes.stopId) : undefined,
            activity_id: changes.activityId ? numericId(changes.activityId) : undefined,
            scheduled_date: changes.date,
            start_time: changes.startTime,
            duration_minutes: changes.durationMinutes,
            estimated_cost: changes.estimatedCost,
            notes: changes.notes,
          }))
          dispatch({ type: 'UPDATE_TRIP_ACTIVITY', activityId, changes: activity })
          invalidateCache(`trip:${numericId(tripId)}:detail`)
          return activity
        }
        const existing = state.db.tripActivities.find((item) => item.id === activityId)
        const activity = existing ? { ...existing, ...changes } : undefined
        dispatch({ type: 'UPDATE_TRIP_ACTIVITY', activityId, changes })
        if (!activity) throw new Error('Itinerary activity not found.')
        return activity
      },

      async removeActivity(tripId, activityId) {
        if (remote) {
          await deleteRemoteActivity(numericId(tripId), numericId(activityId))
          invalidateCache(`trip:${numericId(tripId)}:detail`)
        }
        dispatch({ type: 'REMOVE_TRIP_ACTIVITY', activityId })
      },

      async reorderActivities(tripId, stopId, orderedActivityIds) {
        if (remote) {
          await reorderRemoteActivities(numericId(tripId), numericId(stopId), orderedActivityIds.map(numericId))
          invalidateCache(`trip:${numericId(tripId)}:detail`)
        }
        dispatch({ type: 'REORDER_TRIP_ACTIVITIES', stopId, orderedActivityIds })
      },
    }
  }, [state, dispatch])

  const value = useMemo<TripWiseContextValue>(() => ({
    state,
    dispatch,
    currentUser,
    notify: (message, tone = 'success') => dispatch({ type: 'SHOW_TOAST', toast: { id: crypto.randomUUID(), message, tone } }),
    setSelectedTrip: (tripId) => dispatch({ type: 'SET_SELECTED_TRIP', tripId }),
    setCalendarView: (view) => dispatch({ type: 'SET_CALENDAR_VIEW', view }),
    remoteMode,
    remoteStatus,
    remoteError,
    refreshRemote,
    refreshTrip,
    commands,
  }), [commands, currentUser, dispatch, refreshRemote, refreshTrip, remoteError, remoteMode, remoteStatus, state])

  useEffect(() => () => clearApiCache(), [])

  return <TripWiseContext.Provider value={value}>{children}</TripWiseContext.Provider>
}
