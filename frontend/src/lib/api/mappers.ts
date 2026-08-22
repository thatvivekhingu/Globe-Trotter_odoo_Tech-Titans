import { imageAssets } from '../../mock/data'
import type {
  Activity,
  City,
  Expense,
  SharedTrip,
  Trip,
  TripActivity,
  TripStop,
} from '../../types/domain'
import type {
  ApiActivity,
  ApiCity,
  ApiExpense,
  ApiSharedTrip,
  ApiTrip,
  ApiTripActivity,
  ApiTripDetail,
  ApiTripStop,
} from './types'

export function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return 0
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function toDateString(value: string | Date) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10)
}

export function toShortTime(value: string) {
  return value.slice(0, 5)
}

const cityFallbackImages: Record<string, { url: string; alt: string }> = {
  ahmedabad: { url: imageAssets.espresso, alt: 'A vintage espresso cup on a marble table, Grace Hazell on Unsplash' },
  mumbai: { url: imageAssets.seville, alt: 'Intricate Moorish architecture, Klaus Kreuer on Unsplash' },
  goa: { url: imageAssets.amalfi, alt: 'A warm coastal village at sunset, Enzo Cetrangolo on Unsplash' },
  delhi: { url: imageAssets.seville, alt: 'Intricate Moorish architecture, Klaus Kreuer on Unsplash' },
  jaipur: { url: imageAssets.seville, alt: 'Intricate Moorish architecture, Klaus Kreuer on Unsplash' },
  udaipur: { url: imageAssets.patagonia, alt: 'A serene mountain lake, Florian Delée on Unsplash' },
  bengaluru: { url: imageAssets.kyoto, alt: 'A cozy wooden street, Roméo A. on Unsplash' },
  manali: { url: imageAssets.patagonia, alt: 'A serene mountain lake, Florian Delée on Unsplash' },
}

const activityFallbackImages: Record<string, { url: string; alt: string }> = {
  'goa-baga-beach-sunrise': cityFallbackImages.goa,
  'goa-arabian-sea-scuba': cityFallbackImages.manali,
  'goa-home-style-thali': { url: imageAssets.ramen, alt: 'Steaming bowl of authentic ramen, Susann Schuster on Unsplash' },
  'mumbai-gateway-blue-hour': cityFallbackImages.mumbai,
  'mumbai-fort-food-walk': { url: imageAssets.ramen, alt: 'Steaming bowl of authentic ramen, Susann Schuster on Unsplash' },
  'jaipur-amber-fort-trail': cityFallbackImages.jaipur,
  'jaipur-johari-bazaar': cityFallbackImages.bengaluru,
  'udaipur-lake-pichola-sunset': cityFallbackImages.udaipur,
  'delhi-humayun-tomb-walk': cityFallbackImages.delhi,
  'manali-solang-meadow-hike': cityFallbackImages.manali,
  'bengaluru-indiranagar-coffee-crawl': cityFallbackImages.ahmedabad,
  'ahmedabad-heritage-pol-walk': cityFallbackImages.ahmedabad,
}

export function mapApiTrip(item: ApiTrip): Trip {
  return {
    id: String(item.id),
    ownerId: String(item.owner_user_id),
    name: item.name,
    description: item.description ?? '',
    startDate: toDateString(item.start_date),
    endDate: toDateString(item.end_date),
    currency: 'INR',
    budgetLimit: item.budget_limit === null ? undefined : toNumber(item.budget_limit),
    coverImageUrl: item.cover_image_url || imageAssets.amalfi,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

export function mapApiCity(item: ApiCity): City {
  const fallback = cityFallbackImages[item.slug] || { url: imageAssets.amalfi, alt: `${item.name} travel destination` }
  return {
    id: String(item.id),
    name: item.name,
    country: item.country,
    region: item.region,
    popularity: item.popularity_score,
    costIndex: item.cost_index,
    imageUrl: item.image_url || fallback.url,
    imageAlt: item.image_alt || fallback.alt,
  }
}

export function mapApiActivity(item: ApiActivity): Activity {
  const fallback = activityFallbackImages[item.slug] || { url: imageAssets.amalfi, alt: `${item.name} experience` }
  return {
    id: String(item.id),
    cityId: String(item.city_id),
    name: item.name,
    category: item.category,
    description: item.description ?? '',
    defaultCost: toNumber(item.default_cost),
    durationMinutes: item.duration_minutes,
    imageUrl: item.image_url || fallback.url,
    imageAlt: item.image_alt || fallback.alt,
  }
}

export function mapApiStop(item: ApiTripStop): TripStop {
  return {
    id: String(item.id),
    tripId: String(item.trip_id),
    cityId: String(item.city_id),
    arrivalDate: toDateString(item.arrival_date),
    departureDate: toDateString(item.departure_date),
    order: item.stop_order,
    notes: item.notes || undefined,
  }
}

export function mapApiTripActivity(item: ApiTripActivity): TripActivity {
  return {
    id: String(item.id),
    tripId: String(item.trip_id),
    stopId: String(item.trip_stop_id),
    activityId: String(item.activity_id),
    date: toDateString(item.scheduled_date),
    startTime: toShortTime(item.start_time),
    durationMinutes: item.duration_minutes,
    estimatedCost: toNumber(item.estimated_cost),
    order: item.activity_order,
    notes: item.notes || undefined,
  }
}

export function mapApiExpense(item: ApiExpense): Expense {
  return {
    id: String(item.id),
    tripId: String(item.trip_id),
    category: item.category,
    amount: toNumber(item.amount),
    description: item.description,
    date: item.expense_date ? toDateString(item.expense_date) : undefined,
  }
}

export function mapApiSharedTrip(item: ApiSharedTrip): SharedTrip {
  return {
    id: String(item.id),
    tripId: String(item.trip_id),
    shareToken: item.share_token,
    isActive: item.is_active,
    createdAt: item.created_at,
  }
}

export function mapApiTripDetail(item: ApiTripDetail) {
  return {
    trip: mapApiTrip(item.trip),
    stops: item.stops.map(mapApiStop),
    activities: item.activities.map(mapApiTripActivity),
    expenses: item.expenses.map(mapApiExpense),
  }
}
