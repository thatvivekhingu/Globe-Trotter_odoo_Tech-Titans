import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { createInitialDb } from '../mock/data'
import { DEMO_STATE_KEY, hasDemoSession } from '../lib/authStorage'
import type { TripWiseState } from '../types/domain'
import { TripWiseContext, type TripWiseContextValue } from './TripWiseContext'
import { tripWiseReducer } from './reducer'


function createInitialState(): TripWiseState {
  if (typeof window !== 'undefined' && hasDemoSession()) {
    const stored = window.localStorage.getItem(DEMO_STATE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored) as TripWiseState
      } catch {
        window.localStorage.removeItem(DEMO_STATE_KEY)
      }
    }
  }

  return {
    db: createInitialDb(),
    currentUserId: null,
    selectedTripId: 'trip-konkan',
    activeCalendarView: 'calendar',
    selectedDayId: '2026-10-03',
    toast: null,
  }
}

export function TripWiseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripWiseReducer, undefined, createInitialState)

  useEffect(() => {
    if (hasDemoSession()) window.localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state))
  }, [state])

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

