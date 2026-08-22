import { createContext } from 'react'
import type { Dispatch } from 'react'
import type { CalendarViewMode, TripWiseState, User } from '../types/domain'
import type { TripWiseAction } from './reducer'

export interface TripWiseContextValue {
  state: TripWiseState
  dispatch: Dispatch<TripWiseAction>
  currentUser: User | undefined
  notify: (message: string, tone?: NonNullable<TripWiseState['toast']>['tone']) => void
  setSelectedTrip: (tripId: string | null) => void
  setCalendarView: (view: CalendarViewMode) => void
}

export const TripWiseContext = createContext<TripWiseContextValue | null>(null)
