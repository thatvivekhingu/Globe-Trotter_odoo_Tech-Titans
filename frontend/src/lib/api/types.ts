import type {
  ActivityCategory,
  CostIndex,
  ExpenseCategory,
  TripStatus,
} from '../../types/domain'

export interface ApiTrip {
  id: number
  owner_user_id: number
  name: string
  description: string | null
  start_date: string
  end_date: string
  currency: string
  budget_limit: string | number | null
  cover_image_url: string | null
  status: TripStatus
  created_at: string
  updated_at: string
}

export interface ApiCity {
  id: number
  slug: string
  name: string
  country: string
  region: string
  latitude: string | number | null
  longitude: string | number | null
  popularity_score: number
  cost_index: CostIndex
  image_url: string | null
  image_alt: string | null
}

export interface ApiActivity {
  id: number
  city_id: number
  slug: string
  name: string
  category: ActivityCategory
  description: string | null
  default_cost: string | number
  duration_minutes: number
  image_url: string | null
  image_alt: string | null
}

export interface ApiTripStop {
  id: number
  trip_id: number
  city_id: number
  arrival_date: string
  departure_date: string
  stop_order: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ApiTripActivity {
  id: number
  trip_id: number
  trip_stop_id: number
  activity_id: number
  scheduled_date: string
  start_time: string
  duration_minutes: number
  estimated_cost: string | number
  activity_order: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ApiExpense {
  id: number
  trip_id: number
  category: ExpenseCategory
  amount: string | number
  description: string
  expense_date: string | null
  is_actual: boolean
  created_at: string
  updated_at: string
}

export interface ApiTripDetail {
  trip: ApiTrip
  stops: ApiTripStop[]
  activities: ApiTripActivity[]
  expenses: ApiExpense[]
}

export interface ApiSharedTrip {
  id: number
  trip_id: number
  share_token: string
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export interface TripCreateInput {
  name: string
  description?: string
  start_date: string
  end_date: string
  currency: 'INR'
  budget_limit?: number
  cover_image_url?: string
}

export interface TripUpdateInput {
  name?: string
  description?: string
  start_date?: string
  end_date?: string
  currency?: 'INR'
  budget_limit?: number
  cover_image_url?: string
  status?: TripStatus
}

export interface TripStopCreateInput {
  city_id: number
  arrival_date: string
  departure_date: string
  notes?: string
}

export interface TripStopUpdateInput {
  city_id?: number
  arrival_date?: string
  departure_date?: string
  notes?: string
}

export interface TripActivityCreateInput {
  trip_stop_id: number
  activity_id: number
  scheduled_date: string
  start_time: string
  duration_minutes: number
  estimated_cost: number
  notes?: string
}

export interface TripActivityUpdateInput {
  trip_stop_id?: number
  activity_id?: number
  scheduled_date?: string
  start_time?: string
  duration_minutes?: number
  estimated_cost?: number
  notes?: string
}

export interface CityQuery {
  q?: string
  country?: string
  region?: string
  cost_index?: CostIndex
  offset?: number
  limit?: number
}

export interface ActivityQuery {
  q?: string
  city_id?: number
  category?: ActivityCategory
  max_cost?: number
  max_duration?: number
  offset?: number
  limit?: number
}
