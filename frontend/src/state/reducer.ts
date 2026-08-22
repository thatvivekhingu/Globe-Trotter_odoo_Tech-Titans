import type {
  Expense,
  SharedTrip,
  Trip,
  TripActivity,
  TripStop,
  TripWiseState,
  User,
} from '../types/domain'

export type TripWiseAction =
  | { type: 'SIGN_IN_DEMO'; userId: string }
  | { type: 'SYNC_AUTH_USER'; user: import('../types/domain').User }
  | { type: 'SIGN_OUT_DEMO' }
  | { type: 'SET_SELECTED_TRIP'; tripId: string | null }
  | { type: 'SET_SELECTED_DAY'; dayId: string | undefined }
  | { type: 'SET_SELECTED_ACTIVITY'; activityId: string | undefined }
  | { type: 'SET_CALENDAR_VIEW'; view: TripWiseState['activeCalendarView'] }
  | { type: 'SHOW_TOAST'; toast: NonNullable<TripWiseState['toast']> }
  | { type: 'DISMISS_TOAST' }
  | { type: 'CREATE_TRIP'; trip: Trip }
  | { type: 'UPDATE_TRIP'; tripId: string; changes: Partial<Trip> }
  | { type: 'DELETE_TRIP'; tripId: string }
  | { type: 'ADD_STOP'; stop: TripStop }
  | { type: 'UPDATE_STOP'; stopId: string; changes: Partial<TripStop> }
  | { type: 'REMOVE_STOP'; stopId: string }
  | { type: 'REORDER_STOPS'; tripId: string; orderedStopIds: string[] }
  | { type: 'ADD_TRIP_ACTIVITY'; activity: TripActivity }
  | { type: 'UPDATE_TRIP_ACTIVITY'; activityId: string; changes: Partial<TripActivity> }
  | { type: 'REMOVE_TRIP_ACTIVITY'; activityId: string }
  | { type: 'REORDER_TRIP_ACTIVITIES'; stopId: string; orderedActivityIds: string[] }
  | { type: 'ADD_EXPENSE'; expense: Expense }
  | { type: 'UPDATE_EXPENSE'; expenseId: string; changes: Partial<Expense> }
  | { type: 'DELETE_EXPENSE'; expenseId: string }
  | { type: 'UPDATE_PROFILE'; userId: string; changes: Partial<User> }
  | { type: 'TOGGLE_SAVED_DESTINATION'; userId: string; cityId: string }
  | { type: 'CREATE_SHARE'; sharedTrip: SharedTrip }
  | { type: 'COPY_SHARED_TRIP'; trip: Trip; stops: TripStop[]; activities: TripActivity[]; expenses: Expense[] }

function touchTrip(trips: Trip[], tripId: string) {
  return trips.map((trip) => trip.id === tripId ? { ...trip, updatedAt: new Date().toISOString() } : trip)
}

export function tripWiseReducer(state: TripWiseState, action: TripWiseAction): TripWiseState {
  switch (action.type) {
    case 'SIGN_IN_DEMO':
      return { ...state, currentUserId: action.userId }
    case 'SYNC_AUTH_USER':
      return {
        ...state,
        currentUserId: action.user.id,
        db: {
          ...state.db,
          users: [...state.db.users.filter((user) => user.id !== action.user.id), action.user],
        },
      }
    case 'SIGN_OUT_DEMO':
      return { ...state, currentUserId: null, selectedTripId: null }
    case 'SET_SELECTED_TRIP':
      return { ...state, selectedTripId: action.tripId }
    case 'SET_SELECTED_DAY':
      return { ...state, selectedDayId: action.dayId }
    case 'SET_SELECTED_ACTIVITY':
      return { ...state, selectedActivityId: action.activityId }
    case 'SET_CALENDAR_VIEW':
      return { ...state, activeCalendarView: action.view }
    case 'SHOW_TOAST':
      return { ...state, toast: action.toast }
    case 'DISMISS_TOAST':
      return { ...state, toast: null }
    case 'CREATE_TRIP':
      return {
        ...state,
        db: { ...state.db, trips: [...state.db.trips, action.trip] },
        selectedTripId: action.trip.id,
      }
    case 'UPDATE_TRIP':
      return {
        ...state,
        db: { ...state.db, trips: state.db.trips.map((trip) => trip.id === action.tripId ? { ...trip, ...action.changes, updatedAt: new Date().toISOString() } : trip) },
      }
    case 'DELETE_TRIP':
      return {
        ...state,
        db: {
          ...state.db,
          trips: state.db.trips.filter((trip) => trip.id !== action.tripId),
          tripStops: state.db.tripStops.filter((stop) => stop.tripId !== action.tripId),
          tripActivities: state.db.tripActivities.filter((activity) => activity.tripId !== action.tripId),
          expenses: state.db.expenses.filter((expense) => expense.tripId !== action.tripId),
          sharedTrips: state.db.sharedTrips.filter((shared) => shared.tripId !== action.tripId),
        },
        selectedTripId: state.selectedTripId === action.tripId ? null : state.selectedTripId,
      }
    case 'ADD_STOP':
      return {
        ...state,
        db: { ...state.db, tripStops: [...state.db.tripStops, action.stop], trips: touchTrip(state.db.trips, action.stop.tripId) },
      }
    case 'UPDATE_STOP':
      return {
        ...state,
        db: { ...state.db, tripStops: state.db.tripStops.map((stop) => stop.id === action.stopId ? { ...stop, ...action.changes } : stop) },
      }
    case 'REMOVE_STOP':
      return {
        ...state,
        db: {
          ...state.db,
          tripStops: state.db.tripStops.filter((stop) => stop.id !== action.stopId),
          tripActivities: state.db.tripActivities.filter((activity) => activity.stopId !== action.stopId),
        },
      }
    case 'REORDER_STOPS':
      return {
        ...state,
        db: {
          ...state.db,
          tripStops: state.db.tripStops.map((stop) => {
            const order = action.orderedStopIds.indexOf(stop.id)
            return order === -1 ? stop : { ...stop, order }
          }),
        },
      }
    case 'ADD_TRIP_ACTIVITY':
      return {
        ...state,
        db: { ...state.db, tripActivities: [...state.db.tripActivities, action.activity], trips: touchTrip(state.db.trips, action.activity.tripId) },
      }
    case 'UPDATE_TRIP_ACTIVITY':
      return {
        ...state,
        db: { ...state.db, tripActivities: state.db.tripActivities.map((activity) => activity.id === action.activityId ? { ...activity, ...action.changes } : activity) },
      }
    case 'REMOVE_TRIP_ACTIVITY':
      return {
        ...state,
        db: { ...state.db, tripActivities: state.db.tripActivities.filter((activity) => activity.id !== action.activityId) },
      }
    case 'REORDER_TRIP_ACTIVITIES':
      return {
        ...state,
        db: {
          ...state.db,
          tripActivities: state.db.tripActivities.map((activity) => {
            const order = action.orderedActivityIds.indexOf(activity.id)
            return order === -1 ? activity : { ...activity, order }
          }),
        },
      }
    case 'ADD_EXPENSE':
      return { ...state, db: { ...state.db, expenses: [...state.db.expenses, action.expense] } }
    case 'UPDATE_EXPENSE':
      return { ...state, db: { ...state.db, expenses: state.db.expenses.map((expense) => expense.id === action.expenseId ? { ...expense, ...action.changes } : expense) } }
    case 'DELETE_EXPENSE':
      return { ...state, db: { ...state.db, expenses: state.db.expenses.filter((expense) => expense.id !== action.expenseId) } }
    case 'UPDATE_PROFILE':
      return { ...state, db: { ...state.db, users: state.db.users.map((user) => user.id === action.userId ? { ...user, ...action.changes } : user) } }
    case 'TOGGLE_SAVED_DESTINATION': {
      const existing = state.db.savedDestinations.find((saved) => saved.userId === action.userId && saved.cityId === action.cityId)
      return {
        ...state,
        db: {
          ...state.db,
          savedDestinations: existing
            ? state.db.savedDestinations.filter((saved) => saved.id !== existing.id)
            : [...state.db.savedDestinations, { id: `saved-${action.cityId}`, userId: action.userId, cityId: action.cityId, createdAt: new Date().toISOString() }],
        },
      }
    }
    case 'CREATE_SHARE':
      return { ...state, db: { ...state.db, sharedTrips: [...state.db.sharedTrips.filter((shared) => shared.tripId !== action.sharedTrip.tripId), action.sharedTrip] } }
    case 'COPY_SHARED_TRIP':
      return {
        ...state,
        db: {
          ...state.db,
          trips: [...state.db.trips, action.trip],
          tripStops: [...state.db.tripStops, ...action.stops],
          tripActivities: [...state.db.tripActivities, ...action.activities],
          expenses: [...state.db.expenses, ...action.expenses],
        },
        selectedTripId: action.trip.id,
      }
    default:
      return state
  }
}
