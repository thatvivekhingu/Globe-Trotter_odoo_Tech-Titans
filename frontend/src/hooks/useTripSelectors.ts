import { useMemo } from 'react'
import {
  selectActivity,
  selectActivitiesForStop,
  selectCalendarEvents,
  selectCity,
  selectRecommendedCities,
  selectTrip,
  selectTripActivities,
  selectTripBudget,
  selectTripDays,
  selectTripStops,
  selectUserTrips,
} from '../state/selectors'
import { useTripWise } from '../state/useTripWise'

export function useCurrentTrip(tripId?: string) {
  const { state } = useTripWise()
  const resolvedId = tripId || state.selectedTripId
  return useMemo(() => selectTrip(state.db, resolvedId), [resolvedId, state.db])
}

export function useTripData(tripId?: string) {
  const { state } = useTripWise()
  const resolvedId = tripId || state.selectedTripId
  return useMemo(() => {
    const trip = selectTrip(state.db, resolvedId)
    if (!trip) return undefined
    const stops = selectTripStops(state.db, trip.id)
    const activities = selectTripActivities(state.db, trip.id)
    return {
      trip,
      stops,
      activities,
      days: selectTripDays(trip),
      budget: selectTripBudget(state.db, trip),
      calendarEvents: selectCalendarEvents(state.db, trip.id),
      cityForStop: (stopId: string) => {
        const stop = stops.find((item) => item.id === stopId)
        return stop ? selectCity(state.db, stop.cityId) : undefined
      },
      activityForTripActivity: (activityId: string) => {
        const tripActivity = activities.find((item) => item.id === activityId)
        return tripActivity ? selectActivity(state.db, tripActivity.activityId) : undefined
      },
      activitiesForStop: (stopId: string) => selectActivitiesForStop(state.db, stopId),
    }
  }, [resolvedId, state.db])
}

export function useDashboardData() {
  const { state, currentUser } = useTripWise()
  return useMemo(() => {
    const trips = selectUserTrips(state.db, currentUser?.id || null)
    const summaries = trips.map((trip) => ({
      trip,
      ...trip,
      stops: selectTripStops(state.db, trip.id),
      activities: selectTripActivities(state.db, trip.id),
      budget: selectTripBudget(state.db, trip),
    }))
    const savedCityIds = state.db.savedDestinations.filter((saved) => saved.userId === currentUser?.id).map((saved) => saved.cityId)
    return {
      trips: summaries,
      upcoming: summaries.filter((item) => item.status === 'upcoming' || item.status === 'in-progress'),
      recent: [...summaries].reverse().slice(0, 3),
      recommendedCities: selectRecommendedCities(state.db, savedCityIds),
    }
  }, [currentUser?.id, state.db])
}
