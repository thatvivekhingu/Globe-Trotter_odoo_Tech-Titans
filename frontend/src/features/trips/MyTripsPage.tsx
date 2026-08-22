import { Plus, Search, Ticket } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../../lib/api/client'
import { copyToClipboard } from '../../lib/clipboard'
import { useDashboardData } from '../../hooks/useTripSelectors'
import { useTripWise } from '../../state/useTripWise'
import { formatShareUrl } from '../../lib/formatters'
import { Button } from '../../components/ui/Button'
import { Card, SectionHeading } from '../../components/ui/Card'
import { ConfirmDialog, EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { TextInput } from '../../components/ui/Field'
import { TripCard } from './TripCard'

export function MyTripsPage() {
  const { trips } = useDashboardData()
  const { commands, notify, remoteError, remoteMode, remoteStatus, refreshRemote } = useTripWise()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'draft' | 'completed'>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  const filteredTrips = useMemo(() => trips.filter((trip) => {
    const matchesQuery = trip.name.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'all' || trip.status === filter
    return matchesQuery && matchesFilter
  }), [filter, query, trips])

  async function shareTrip(tripId: string) {
    try {
      const shared = await commands.shareTrip(tripId)
      await copyToClipboard(formatShareUrl(window.location.origin, shared.shareToken))
      notify('Share link copied to your clipboard.')
    } catch (error) {
      notify(getApiErrorMessage(error, 'We could not create a share link.'), 'error')
    }
  }

  async function deleteTrip() {
    if (!deleteId) return
    setDeletePending(true)
    try {
      await commands.deleteTrip(deleteId)
      setDeleteId(null)
      notify('Trip deleted.')
    } catch (error) {
      notify(getApiErrorMessage(error, 'We could not delete this trip.'), 'error')
    } finally {
      setDeletePending(false)
    }
  }

  const isInitialLoading = remoteMode === 'remote' && remoteStatus === 'loading' && !trips.length
  const hasRemoteError = remoteMode === 'remote' && remoteStatus === 'error'

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Your travel shelf" title="My trips" description="Keep every route together, from first idea to final sunset." action={<Button asChild icon={<Plus size={16} />}><Link to="/trips/new">Plan a new trip</Link></Button>} />
      <Card padding="sm" className="flex flex-col gap-3 bg-white/50 sm:flex-row sm:items-center"><div className="relative flex-1"><Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" aria-hidden="true" /><TextInput aria-label="Search trips" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your trips" className="pl-10" /></div><div className="hide-scrollbar flex gap-1 overflow-x-auto">{(['all', 'upcoming', 'draft', 'completed'] as const).map((item) => <button type="button" key={item} onClick={() => setFilter(item)} aria-pressed={filter === item} className={['shrink-0 rounded-full px-3 py-2 text-xs font-semibold capitalize', filter === item ? 'bg-ink text-parchment' : 'text-ink/55 hover:bg-ink/5'].join(' ')}>{item}</button>)}</div></Card>
      {hasRemoteError && trips.length ? <ErrorState title="Some trips may be out of date" description={remoteError || 'We could not refresh your trips.'} onRetry={() => { void refreshRemote().catch(() => undefined) }} /> : null}
      {isInitialLoading ? <div className="grid gap-5 xl:grid-cols-2" aria-busy="true" aria-label="Loading trips"><Skeleton className="aspect-[1.7/1] min-h-80" /><Skeleton className="aspect-[1.7/1] min-h-80" /></div> : hasRemoteError && !trips.length ? <ErrorState title="Your trips could not load" description={remoteError || 'We could not load your trips right now.'} onRetry={() => { void refreshRemote().catch(() => undefined) }} /> : filteredTrips.length ? <div className="grid gap-5 xl:grid-cols-2">{filteredTrips.map((item) => <TripCard key={item.id} trip={item.trip} stopCount={item.stops.length} activityCount={item.activities.length} total={item.budget.total} onDelete={() => setDeleteId(item.id)} onShare={() => { void shareTrip(item.id) }} />)}</div> : <EmptyState icon={<Ticket size={28} />} title="Your passport is waiting." description="No trips match those filters yet. Start with a city, a date, or simply a good excuse to go." action={<Button asChild icon={<Plus size={16} />}><Link to="/trips/new">Create your first trip</Link></Button>} />}
      <ConfirmDialog open={Boolean(deleteId)} title="Delete trip?" description="This action cannot be undone. All stops, activities, and budget notes for this trip will be removed from the demo workspace." confirmLabel="Delete trip" loading={deletePending} onClose={() => { if (!deletePending) setDeleteId(null) }} onConfirm={() => { void deleteTrip() }} />
    </div>
  )
}
