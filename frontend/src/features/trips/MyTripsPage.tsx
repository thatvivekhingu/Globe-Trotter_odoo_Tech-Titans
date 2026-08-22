import { Plus, Search, Ticket } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDashboardData } from '../../hooks/useTripSelectors'
import { useTripWise } from '../../state/useTripWise'
import { formatShareUrl } from '../../lib/formatters'
import { Button } from '../../components/ui/Button'
import { Card, SectionHeading } from '../../components/ui/Card'
import { ConfirmDialog, EmptyState } from '../../components/ui/Feedback'
import { TextInput } from '../../components/ui/Field'
import { TripCard } from './TripCard'

export function MyTripsPage() {
  const { trips } = useDashboardData()
  const { dispatch, notify } = useTripWise()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'draft' | 'completed'>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredTrips = useMemo(() => trips.filter((trip) => {
    const matchesQuery = trip.name.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'all' || trip.status === filter
    return matchesQuery && matchesFilter
  }), [filter, query, trips])

  function shareTrip(tripId: string) {
    const token = `tripwise-${tripId}`
    dispatch({ type: 'CREATE_SHARE', sharedTrip: { id: `share-${tripId}`, tripId, shareToken: token, isActive: true, createdAt: new Date().toISOString() } })
    const url = formatShareUrl(window.location.origin, token)
    void navigator.clipboard?.writeText(url)
    notify('Share link copied to your clipboard.')
  }

  function deleteTrip() {
    if (!deleteId) return
    dispatch({ type: 'DELETE_TRIP', tripId: deleteId })
    setDeleteId(null)
    notify('Trip deleted.')
  }

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Your travel shelf" title="My trips" description="Keep every route together, from first idea to final sunset." action={<Button asChild icon={<Plus size={16} />}><Link to="/trips/new">Plan a new trip</Link></Button>} />
      <Card padding="sm" className="flex flex-col gap-3 bg-white/50 sm:flex-row sm:items-center"><div className="relative flex-1"><Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" /><TextInput aria-label="Search trips" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your trips" className="pl-10" /></div><div className="hide-scrollbar flex gap-1 overflow-x-auto">{(['all', 'upcoming', 'draft', 'completed'] as const).map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={['shrink-0 rounded-full px-3 py-2 text-xs font-semibold capitalize', filter === item ? 'bg-ink text-parchment' : 'text-ink/55 hover:bg-ink/5'].join(' ')}>{item}</button>)}</div></Card>
      {filteredTrips.length ? <div className="grid gap-5 xl:grid-cols-2">{filteredTrips.map((item) => <TripCard key={item.id} trip={item.trip} stopCount={item.stops.length} activityCount={item.activities.length} total={item.budget.total} onDelete={() => setDeleteId(item.id)} onShare={() => shareTrip(item.id)} />)}</div> : <EmptyState icon={<Ticket size={28} />} title="Your passport is waiting." description="No trips match those filters yet. Start with a city, a date, or simply a good excuse to go." action={<Button asChild icon={<Plus size={16} />}><Link to="/trips/new">Create your first trip</Link></Button>} />}
      <ConfirmDialog open={Boolean(deleteId)} title="Delete trip?" description="This action cannot be undone. All stops, activities, and budget notes for this trip will be removed from the demo workspace." confirmLabel="Delete trip" onClose={() => setDeleteId(null)} onConfirm={deleteTrip} />
    </div>
  )
}
