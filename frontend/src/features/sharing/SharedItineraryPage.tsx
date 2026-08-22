import { ArrowRight, Check, Copy, MapPin, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTripWise } from '../../state/useTripWise'
import { selectPublicTrip } from '../../state/selectors'
import { formatCategoryLabel, formatCurrency, formatDateRange, formatLongDate, formatTime } from '../../lib/formatters'
import { imageAssets } from '../../mock/data'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/Feedback'
import { ImageWithFallback } from '../../components/ui/ImageWithFallback'

export function SharedItineraryPage() {
  const { shareToken = '' } = useParams()
  const { state, dispatch, currentUser, notify } = useTripWise()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const shared = selectPublicTrip(state.db, shareToken)

  if (!shared) return <EmptyState title="This itinerary is no longer available" description="The link may be inactive or the itinerary may have been moved." action={<Button asChild><Link to="/dashboard">Go to TripWise</Link></Button>} />
  const publicTrip = shared
  const cover = publicTrip.trip.coverImageUrl || imageAssets.travelBag

  async function copyLink() {
    const url = window.location.href
    await navigator.clipboard?.writeText(url)
    setCopied(true)
    notify('Public link copied.')
    window.setTimeout(() => setCopied(false), 2200)
  }

  function copyTrip() {
    if (!currentUser) {
      notify('Sign in to copy this itinerary.', 'info')
      return
    }
    const copyId = `trip-copy-${Date.now()}`
    const now = new Date().toISOString()
    const trip = { ...publicTrip.trip, id: copyId, ownerId: currentUser.id, name: `${publicTrip.trip.name} · Copy`, status: 'draft' as const, createdAt: now, updatedAt: now }
    const stopIdMap = new Map(publicTrip.stops.map((stop) => [stop.id, `stop-copy-${Date.now()}-${stop.id}`]))
    const stops = publicTrip.stops.map((stop) => ({ ...stop, id: stopIdMap.get(stop.id) || stop.id, tripId: copyId }))
    const activities = publicTrip.activities.map((activity) => ({ ...activity, id: `activity-copy-${Date.now()}-${activity.id}`, tripId: copyId, stopId: stopIdMap.get(activity.stopId) || activity.stopId }))
    const expenses = state.db.expenses.filter((expense) => expense.tripId === publicTrip.trip.id).map((expense) => ({ ...expense, id: `expense-copy-${Date.now()}-${expense.id}`, tripId: copyId }))
    dispatch({ type: 'COPY_SHARED_TRIP', trip, stops, activities, expenses })
    notify('A private copy was added to My trips.')
    navigate(`/trips/${copyId}/builder`)
  }

  function shareOnSocial(platform: 'whatsapp' | 'twitter' | 'email') {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`Check out this travel itinerary for ${publicTrip.trip.name} on TripWise!`)
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank')
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
    } else if (platform === 'email') {
      window.open(`mailto:?subject=${encodeURIComponent(`Travel Itinerary: ${publicTrip.trip.name}`)}&body=${text}%0A%0A${url}`)
    }
  }

  return (
    <div className="min-h-screen bg-parchment">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-10">
        <Link to="/dashboard" className="font-display text-2xl font-semibold tracking-[-0.04em] text-ink">TripWise<span className="text-clay">.</span></Link>
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 border-r border-line pr-2 mr-1">
            <Button variant="ghost" size="sm" onClick={() => shareOnSocial('whatsapp')}>WhatsApp</Button>
            <Button variant="ghost" size="sm" onClick={() => shareOnSocial('twitter')}>X / Twitter</Button>
            <Button variant="ghost" size="sm" onClick={() => shareOnSocial('email')}>Email</Button>
          </div>
          <Button variant="secondary" size="sm" icon={copied ? <Check size={15} /> : <Copy size={15} />} onClick={copyLink}>{copied ? 'Link copied' : 'Copy link'}</Button>
          <Button size="sm" icon={<Share2 size={15} />} onClick={copyTrip}>Copy trip</Button>
        </div>
      </header>
      <main className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1500px] lg:grid-cols-2">
        <div className="relative min-h-[26rem] overflow-hidden lg:sticky lg:top-0 lg:h-[calc(100vh-5rem)]"><ImageWithFallback src={cover} alt="Shared destination, Lina Verovaya on Unsplash" className="absolute inset-0 size-full object-cover" fallbackClassName="absolute inset-0 size-full" /><div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" /><div className="absolute bottom-7 left-6 right-6 text-parchment sm:bottom-10 sm:left-10 sm:right-10"><p className="eyebrow text-parchment/65">A TripWise itinerary</p><p className="mt-3 max-w-lg font-display text-5xl font-medium leading-[0.95] tracking-[-0.055em] sm:text-6xl">{publicTrip.trip.name}</p><p className="mt-4 flex items-center gap-2 text-sm text-parchment/70"><MapPin size={15} />{publicTrip.stops.map((stop) => state.db.cities.find((city) => city.id === stop.cityId)?.name).filter(Boolean).join(' · ')}</p></div></div>
        <article className="px-5 py-10 sm:px-10 sm:py-14 lg:px-16 xl:px-24"><div className="max-w-xl"><p className="eyebrow">The route</p><h1 className="mt-4 font-display text-5xl font-medium leading-[0.94] tracking-[-0.055em] text-ink">A few days to remember.</h1><p className="body-copy mt-5 text-sm">{formatDateRange(publicTrip.trip.startDate, publicTrip.trip.endDate)} · This itinerary is read-only, made for sharing the shape of the journey.</p><div className="mt-10 space-y-8">{publicTrip.stops.map((stop) => { const city = state.db.cities.find((item) => item.id === stop.cityId); const activities = publicTrip.activities.filter((activity) => activity.stopId === stop.id); return <section key={stop.id} className="border-t border-line pt-6"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">{formatLongDate(stop.arrivalDate)}</p><h2 className="mt-2 font-display text-3xl font-medium text-ink">{city?.name}</h2></div><Badge tone="sage">{activities.length} {activities.length === 1 ? 'anchor' : 'anchors'}</Badge></div><div className="mt-5 space-y-3">{activities.map((tripActivity) => { const activity = state.db.activities.find((item) => item.id === tripActivity.activityId); return activity ? <div key={tripActivity.id} className="flex items-start gap-3 border-b border-line pb-3 last:border-b-0"><span className="mt-2 size-2 shrink-0 rounded-full bg-clay" /><div className="min-w-0 flex-1"><p className="font-semibold text-sm text-ink">{activity.name}</p><p className="mt-1 text-xs text-ink/50">{formatTime(tripActivity.startTime)} · {formatCategoryLabel(activity.category)}</p></div><p className="text-xs font-semibold text-ink/60">{tripActivity.estimatedCost ? formatCurrency(tripActivity.estimatedCost) : 'Free'}</p></div> : null })}</div></section> })}</div><div className="mt-12 border-t border-line pt-6"><p className="eyebrow">A note for the road</p><p className="mt-3 font-display text-2xl leading-snug text-ink">“Leave a little room in every day. That’s where the best stories tend to arrive.”</p><Link to="/dashboard" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-clay hover:text-ink">Plan your own journey <ArrowRight size={16} /></Link></div></div></article>
      </main>
    </div>
  )
}
