import { useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { createInitialDb } from '../mock/data'
import { DEMO_STATE_KEY } from '../lib/authStorage'
import type { TripWiseState } from '../types/domain'
import { TripWiseContext, type TripWiseContextValue } from './TripWiseContext'
import { tripWiseReducer } from './reducer'

const SYNC_CHANNEL_NAME = 'globetrotter-realtime-sync'

function createInitialState(): TripWiseState {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(DEMO_STATE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TripWiseState
        if (parsed?.db?.trips?.length) return parsed
      } catch {
        window.localStorage.removeItem(DEMO_STATE_KEY)
      }
    }
  }

  return {
    db: createInitialDb(),
    currentUserId: 'user-1',
    selectedTripId: 'trip-konkan',
    activeCalendarView: 'calendar',
    selectedDayId: '2026-10-03',
    toast: null,
  }
}

export function TripWiseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripWiseReducer, undefined, createInitialState)
  const isBroadcastingRef = useRef(false)
  const channelRef = useRef<BroadcastChannel | null>(null)

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
        // If state changed by collaborator in another tab
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
  const value = useMemo<TripWiseContextValue>(() => ({
    state,
    dispatch,
    currentUser,
    notify: (message, tone = 'success') => dispatch({ type: 'SHOW_TOAST', toast: { id: crypto.randomUUID(), message, tone } }),
    setSelectedTrip: (tripId) => dispatch({ type: 'SET_SELECTED_TRIP', tripId }),
    setCalendarView: (view) => dispatch({ type: 'SET_CALENDAR_VIEW', view }),
  }), [currentUser, state])

  return <TripWiseContext.Provider value={value}>{children}</TripWiseContext.Provider>
}
