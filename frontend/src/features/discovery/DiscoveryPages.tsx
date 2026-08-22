import { ArrowRight, Compass, Ticket, Utensils } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTripWise } from '../../state/useTripWise'
import { selectTrip, selectTripStops } from '../../state/selectors'
import { formatCategoryLabel } from '../../lib/formatters'
import { Button } from '../../components/ui/Button'
import { SectionHeading } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/Feedback'
import { DiscoveryToolbar } from './DiscoveryToolbar'
import { CityResultCard } from './CityResultCard'
import { ActivityResultCard } from './ActivityResultCard'

export function CitySearchPage() {
  const [params] = useSearchParams()
  const { state, currentUser, dispatch, notify } = useTripWise()
  const [query, setQuery] = useState(params.get('q') || '')
  const [country, setCountry] = useState('all')
  const [region, setRegion] = useState('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const selectedTrip = selectTrip(state.db, state.selectedTripId)
  const selectedStops = selectedTrip ? selectTripStops(state.db, selectedTrip.id) : []
  const savedIds = state.db.savedDestinations.filter((saved) => saved.userId === currentUser?.id).map((saved) => saved.cityId)
  const countries = [...new Set(state.db.cities.map((city) => city.country))]
  const regions = [...new Set(state.db.cities.map((city) => city.region))]
  const results = useMemo(() => state.db.cities.filter((city) => {
    const normalizedQuery = query.trim().toLowerCase()
    return (!normalizedQuery || `${city.name} ${city.country} ${city.region}`.toLowerCase().includes(normalizedQuery)) && (country === 'all' || city.country === country) && (region === 'all' || city.region === region)
  }), [country, query, region, state.db.cities])

  function addCity(cityId: string) {
    if (!selectedTrip) {
      notify('Create a trip before adding a destination.', 'info')
      return
    }
    if (selectedStops.some((stop) => stop.cityId === cityId)) {
      notify('That city is already on this route.', 'info')
      return
    }
    dispatch({ type: 'ADD_STOP', stop: { id: `stop-${selectedTrip.id}-${cityId}`, tripId: selectedTrip.id, cityId, arrivalDate: selectedTrip.startDate, departureDate: selectedTrip.endDate, order: selectedStops.length } })
    notify('City added to your route.')
  }

  function toggleSaved(cityId: string) {
    if (currentUser) dispatch({ type: 'TOGGLE_SAVED_DESTINATION', userId: currentUser.id, cityId })
    notify(savedIds.includes(cityId) ? 'Removed from saved destinations.' : 'Destination saved for later.')
  }

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Find your next chapter" title="City discovery" description="Collect places that feel like a good beginning, then add them to the route you are shaping." action={<Link to="/discover/activities" className="inline-flex items-center gap-2 text-sm font-semibold text-clay hover:text-ink">Browse activities <ArrowRight size={16} /></Link>} />
      <DiscoveryToolbar query={query} onQueryChange={setQuery} queryPlaceholder="Search cities, regions, or countries" filters={[{ label: 'Country', value: country, onChange: setCountry, options: [{ value: 'all', label: 'All countries' }, ...countries.map((item) => ({ value: item, label: item }))] }, { label: 'Region', value: region, onChange: setRegion, options: [{ value: 'all', label: 'All regions' }, ...regions.map((item) => ({ value: item, label: item }))] }]} onReset={() => { setQuery(''); setCountry('all'); setRegion('all') }} hasFilters={Boolean(query || country !== 'all' || region !== 'all')} view={view} onViewChange={setView} />
      <div className={view === 'grid' ? 'columns-1 gap-5 sm:columns-2 xl:columns-3' : 'grid gap-3 lg:grid-cols-2'}>{results.map((city) => <CityResultCard key={city.id} city={city} added={selectedStops.some((stop) => stop.cityId === city.id)} saved={savedIds.includes(city.id)} onAdd={() => addCity(city.id)} onToggleSaved={() => toggleSaved(city.id)} compact={view === 'list'} />)}</div>
      {!results.length ? <EmptyState icon={<Compass size={28} />} title="No destinations found" description="Try a different search or clear your filters. The best route can start with a surprising place." action={<Button variant="secondary" onClick={() => { setQuery(''); setCountry('all'); setRegion('all') }}>Clear filters</Button>} /> : null}
      <p className="sr-only">{results.length} destinations found.</p>
    </div>
  )
}

export function ActivitySearchPage() {
  const { state, dispatch, notify } = useTripWise()
  const [query, setQuery] = useState('')
  const [cityId, setCityId] = useState('all')
  const [category, setCategory] = useState('all')
  const [costFilter, setCostFilter] = useState('all')
  const [durationFilter, setDurationFilter] = useState('all')
  const selectedTrip = selectTrip(state.db, state.selectedTripId)
  const selectedTripActivities = state.db.tripActivities.filter((activity) => activity.tripId === selectedTrip?.id)

  const results = useMemo(() => state.db.activities.filter((activity) => {
    const normalizedQuery = query.trim().toLowerCase()
    const matchesQuery = !normalizedQuery || `${activity.name} ${activity.description}`.toLowerCase().includes(normalizedQuery)
    const matchesCity = cityId === 'all' || activity.cityId === cityId
    const matchesCategory = category === 'all' || activity.category === category

    let matchesCost = true
    if (costFilter === 'free') matchesCost = activity.defaultCost === 0
    else if (costFilter === 'under-500') matchesCost = activity.defaultCost > 0 && activity.defaultCost <= 500
    else if (costFilter === '500-1500') matchesCost = activity.defaultCost > 500 && activity.defaultCost <= 1500
    else if (costFilter === 'above-1500') matchesCost = activity.defaultCost > 1500

    let matchesDuration = true
    if (durationFilter === 'short') matchesDuration = activity.durationMinutes <= 60
    else if (durationFilter === 'medium') matchesDuration = activity.durationMinutes > 60 && activity.durationMinutes <= 120
    else if (durationFilter === 'long') matchesDuration = activity.durationMinutes > 120 && activity.durationMinutes <= 240
    else if (durationFilter === 'full') matchesDuration = activity.durationMinutes > 240

    return matchesQuery && matchesCity && matchesCategory && matchesCost && matchesDuration
  }), [category, cityId, costFilter, durationFilter, query, state.db.activities])

  const categories = [...new Set(state.db.activities.map((activity) => activity.category))]

  function addActivity(activityId: string) {
    if (!selectedTrip) {
      notify('Create a trip before adding an activity.', 'info')
      return
    }
    const activity = state.db.activities.find((item) => item.id === activityId)
    if (!activity) return
    const stops = selectTripStops(state.db, selectedTrip.id)
    const stop = stops.find((item) => item.cityId === activity.cityId) || stops[0]
    if (!stop) {
      notify('Add a city stop first, then choose activities for it.', 'info')
      return
    }
    if (selectedTripActivities.some((item) => item.activityId === activityId)) {
      notify('That activity is already in your itinerary.', 'info')
      return
    }
    dispatch({ type: 'ADD_TRIP_ACTIVITY', activity: { id: `trip-activity-${selectedTrip.id}-${activityId}`, tripId: selectedTrip.id, stopId: stop.id, activityId, date: stop.arrivalDate, startTime: '10:00', durationMinutes: activity.durationMinutes, estimatedCost: activity.defaultCost, order: selectedTripActivities.length } })
    notify('Activity added to your itinerary.')
  }

  const hasFilters = Boolean(query || cityId !== 'all' || category !== 'all' || costFilter !== 'all' || durationFilter !== 'all')

  const resetFilters = () => {
    setQuery('')
    setCityId('all')
    setCategory('all')
    setCostFilter('all')
    setDurationFilter('all')
  }

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Fill the days well" title="Activity discovery" description="Choose a few anchors for each day. Filter by interest, budget, or duration." action={<Link to="/discover/cities" className="inline-flex items-center gap-2 text-sm font-semibold text-clay hover:text-ink">Explore cities <ArrowRight size={16} /></Link>} />
      <DiscoveryToolbar
        query={query}
        onQueryChange={setQuery}
        queryPlaceholder="Search experiences, food, and culture"
        filters={[
          { label: 'City', value: cityId, onChange: setCityId, options: [{ value: 'all', label: 'All cities' }, ...state.db.cities.map((city) => ({ value: city.id, label: city.name }))] },
          { label: 'Category', value: category, onChange: setCategory, options: [{ value: 'all', label: 'All categories' }, ...categories.map((item) => ({ value: item, label: formatCategoryLabel(item) }))] },
          { label: 'Cost', value: costFilter, onChange: setCostFilter, options: [{ value: 'all', label: 'All costs' }, { value: 'free', label: 'Free (₹0)' }, { value: 'under-500', label: 'Under ₹500' }, { value: '500-1500', label: '₹500 - ₹1,500' }, { value: 'above-1500', label: '₹1,500+' }] },
          { label: 'Duration', value: durationFilter, onChange: setDurationFilter, options: [{ value: 'all', label: 'All durations' }, { value: 'short', label: 'Under 1 hour' }, { value: 'medium', label: '1 - 2 hours' }, { value: 'long', label: '2 - 4 hours' }, { value: 'full', label: 'Half-day+ (4h+)' }] },
        ]}
        onReset={resetFilters}
        hasFilters={hasFilters}
      />
      <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">{results.map((activity) => <ActivityResultCard key={activity.id} activity={activity} city={state.db.cities.find((city) => city.id === activity.cityId)} added={selectedTripActivities.some((item) => item.activityId === activity.id)} onAdd={() => addActivity(activity.id)} />)}</div>
      {!results.length ? <EmptyState icon={<Utensils size={28} />} title="No activities found" description="Try adjusting your cost, category, or duration filters to see more options." action={<Button variant="secondary" onClick={resetFilters}>Clear filters</Button>} /> : null}
      <div className="rounded-card border border-clay/20 bg-clay/5 p-5 text-sm text-ink/65"><div className="flex items-start gap-3"><Ticket size={18} className="mt-0.5 shrink-0 text-clay" /><p><span className="font-semibold text-ink">A gentle rule of thumb:</span> plan one or two anchors per day, then leave some space for the places you find by accident.</p></div></div>
    </div>
  )
}
