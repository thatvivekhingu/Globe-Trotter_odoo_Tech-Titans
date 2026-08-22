import { createContext } from 'react'
import type { Dispatch } from 'react'
import type { CalendarViewMode, TripWiseState, User } from '../types/domain'
import type { TripWiseCommands } from './commands'
import type { TripWiseAction } from './reducer'

export type RemoteMode = 'demo' | 'remote'
export type RemoteStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface TripWiseContextValue {
  state: TripWiseState
  dispatch: Dispatch<TripWiseAction>
  currentUser: User | undefined
  notify: (message: string, tone?: NonNullable<TripWiseState['toast']>['tone']) => void
  setSelectedTrip: (tripId: string | null) => void
  setCalendarView: (view: CalendarViewMode) => void
  remoteMode: RemoteMode
  remoteStatus: RemoteStatus
  remoteError: string | null
  refreshRemote: () => Promise<void>
  refreshTrip: (tripId: string) => Promise<void>
  commands: TripWiseCommands
}

export const TripWiseContext = createContext<TripWiseContextValue | null>(null)
