import type {
  Activity,
  BudgetSummary,
  CalendarEvent,
  ExpenseCategory,
  Trip,
  TripStop,
  TripWiseDb,
} from '../types/domain'

export function selectTrip(db: TripWiseDb, tripId: string | null) {
  return db.trips.find((trip) => trip.id === tripId)
}

export function selectUserTrips(db: TripWiseDb, userId: string | null) {
  if (!userId) return []
  return db.trips
    .filter((trip) => trip.ownerId === userId)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
}

export function selectTripStops(db: TripWiseDb, tripId: string) {
  return db.tripStops
    .filter((stop) => stop.tripId === tripId)
    .sort((a, b) => a.order - b.order)
}

export function selectTripActivities(db: TripWiseDb, tripId: string) {
  return db.tripActivities
    .filter((activity) => activity.tripId === tripId)
    .sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order)
}

export function selectCity(db: TripWiseDb, cityId: string) {
  return db.cities.find((city) => city.id === cityId)
}

export function selectActivity(db: TripWiseDb, activityId: string) {
  return db.activities.find((activity) => activity.id === activityId)
}

export function selectActivitiesForStop(db: TripWiseDb, stopId: string) {
  return db.tripActivities
    .filter((activity) => activity.stopId === stopId)
    .sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order)
}

export function selectTripBudget(db: TripWiseDb, trip: Trip): BudgetSummary {
  const categories: Record<ExpenseCategory, number> = {
    transportation: 0,
    accommodation: 0,
    activities: 0,
    food: 0,
    other: 0,
  }

  db.expenses
    .filter((expense) => expense.tripId === trip.id)
    .forEach((expense) => {
      categories[expense.category] += expense.amount
    })

  db.tripActivities
    .filter((activity) => activity.tripId === trip.id)
    .forEach((activity) => {
      categories.activities += activity.estimatedCost
    })

  const total = Object.values(categories).reduce((sum, amount) => sum + amount, 0)
  const days = Math.max(
    1,
    Math.round(
      (new Date(`${trip.endDate}T12:00:00`).getTime() -
        new Date(`${trip.startDate}T12:00:00`).getTime()) /
        86400000,
    ) + 1,
  )

  return {
    total,
    costPerDay: Math.round(total / days),
    budgetLimit: trip.budgetLimit,
    remaining: trip.budgetLimit === undefined ? null : trip.budgetLimit - total,
    categories,
  }
}

export function selectCalendarEvents(db: TripWiseDb, tripId: string): CalendarEvent[] {
  return selectTripActivities(db, tripId).flatMap((tripActivity) => {
    const activity = selectActivity(db, tripActivity.activityId)
    const stop = db.tripStops.find((item) => item.id === tripActivity.stopId)
    const city = stop ? selectCity(db, stop.cityId) : undefined
    if (!activity || !city) return []

    return [
      {
        id: tripActivity.id,
        title: activity.name,
        start: `${tripActivity.date}T${tripActivity.startTime}`,
        cityName: city.name,
        cost: tripActivity.estimatedCost,
        category: activity.category,
      },
    ]
  })
}

export function selectTripSummary(db: TripWiseDb, trip: Trip) {
  const stops = selectTripStops(db, trip.id)
  const activities = selectTripActivities(db, trip.id)
  return {
    trip,
    stopCount: stops.length,
    activityCount: activities.length,
    budget: selectTripBudget(db, trip),
  }
}

export function selectPublicTrip(db: TripWiseDb, token: string) {
  const shared = db.sharedTrips.find((item) => item.shareToken === token && item.isActive)
  if (!shared) return undefined
  const trip = db.trips.find((item) => item.id === shared.tripId)
  if (!trip) return undefined
  return {
    trip,
    stops: selectTripStops(db, trip.id),
    activities: selectTripActivities(db, trip.id),
    budget: selectTripBudget(db, trip),
  }
}

export function selectRecommendedCities(db: TripWiseDb, savedCityIds: string[]) {
  return db.cities
    .filter((city) => !savedCityIds.includes(city.id))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 4)
}

export function selectCityActivities(db: TripWiseDb, cityId: string) {
  return db.activities.filter((activity) => activity.cityId === cityId)
}

export function selectTripDays(trip: Trip) {
  const days: string[] = []
  const cursor = new Date(`${trip.startDate}T12:00:00`)
  const end = new Date(`${trip.endDate}T12:00:00`)
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export function findStopForDate(stops: TripStop[], date: string) {
  return stops.find((stop) => date >= stop.arrivalDate && date <= stop.departureDate)
}

export function findActivityById(activities: Activity[], id: string) {
  return activities.find((activity) => activity.id === id)
}
