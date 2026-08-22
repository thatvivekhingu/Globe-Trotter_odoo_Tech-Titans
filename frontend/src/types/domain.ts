export type TripStatus = 'draft' | 'upcoming' | 'in-progress' | 'completed'
export type ExpenseCategory =
  | 'transportation'
  | 'accommodation'
  | 'activities'
  | 'food'
  | 'other'
export type ActivityCategory =
  | 'sightseeing'
  | 'food'
  | 'adventure'
  | 'nature'
  | 'shopping'
  | 'culture'
  | 'entertainment'
export type CostIndex = 'low' | 'medium' | 'high'
export type CalendarViewMode = 'calendar' | 'list' | 'timeline'
export type Language = 'en' | 'hi'
export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  language: Language
  role: UserRole
}

export interface Trip {
  id: string
  ownerId: string
  name: string
  description: string
  startDate: string
  endDate: string
  currency: 'INR'
  budgetLimit?: number
  coverImageUrl?: string
  status: TripStatus
  createdAt: string
  updatedAt: string
}

export interface City {
  id: string
  name: string
  country: string
  region: string
  popularity: number
  costIndex: CostIndex
  imageUrl: string
  imageAlt: string
}

export interface Activity {
  id: string
  cityId: string
  name: string
  category: ActivityCategory
  description: string
  defaultCost: number
  durationMinutes: number
  imageUrl?: string
  imageAlt?: string
}

export interface TripStop {
  id: string
  tripId: string
  cityId: string
  arrivalDate: string
  departureDate: string
  order: number
  notes?: string
}

export interface TripActivity {
  id: string
  tripId: string
  stopId: string
  activityId: string
  date: string
  startTime: string
  durationMinutes: number
  estimatedCost: number
  order: number
  notes?: string
}

export interface Expense {
  id: string
  tripId: string
  category: ExpenseCategory
  amount: number
  description: string
  date?: string
}

export interface SharedTrip {
  id: string
  tripId: string
  shareToken: string
  isActive: boolean
  createdAt: string
}

export interface SavedDestination {
  id: string
  userId: string
  cityId: string
  createdAt: string
}

export interface TripWiseDb {
  users: User[]
  trips: Trip[]
  cities: City[]
  activities: Activity[]
  tripStops: TripStop[]
  tripActivities: TripActivity[]
  expenses: Expense[]
  sharedTrips: SharedTrip[]
  savedDestinations: SavedDestination[]
}

export interface BudgetSummary {
  total: number
  costPerDay: number
  budgetLimit?: number
  remaining: number | null
  categories: Record<ExpenseCategory, number>
}

export interface ToastState {
  id: string
  message: string
  tone: 'success' | 'error' | 'info'
}

export interface TripWiseState {
  db: TripWiseDb
  currentUserId: string | null
  selectedTripId: string | null
  activeCalendarView: CalendarViewMode
  selectedDayId?: string
  selectedActivityId?: string
  toast: ToastState | null
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end?: string
  cityName: string
  cost: number
  category: ActivityCategory
}
