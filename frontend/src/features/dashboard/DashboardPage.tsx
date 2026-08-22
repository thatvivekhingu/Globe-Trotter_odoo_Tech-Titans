import { ArrowUpRight, CalendarDays, ChevronRight, Compass, MapPin, Plus, Sparkles, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDashboardData } from '../../hooks/useTripSelectors'
import { useTripWise } from '../../state/useTripWise'
import { formatCurrency, formatDateRange, formatRelativeDays } from '../../lib/formatters'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, MetricCard, SectionHeading } from '../../components/ui/Card'
import { EmptyState, Skeleton } from '../../components/ui/Feedback'
import { ImageWithFallback } from '../../components/ui/ImageWithFallback'
import { TripMapView } from '../../components/map/TripMapView'

export function DashboardPage() {
  const { currentUser, state } = useTripWise()
  const { upcoming, recent, recommendedCities } = useDashboardData()
  const nextTrip = upcoming[0]
  const totalPlanned = upcoming.reduce((sum, trip) => sum + trip.activities.length, 0)
  const totalBudget = upcoming.reduce((sum, trip) => sum + trip.budget.total, 0)

  return (
    <div className="space-y-10">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Saturday, 22 August 2026</p>
          <h1 className="mt-3 font-display text-5xl font-medium tracking-[-0.055em] text-ink sm:text-6xl">
            Welcome back, {currentUser?.name.split(' ')[0] || 'traveller'}.
          </h1>
          <p className="body-copy mt-4 max-w-xl text-sm">
            A little structure for the journey ahead, and plenty of room for the unexpected.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary" icon={<Sparkles size={16} />}>
            <Link to="/recommendations">AI Trip Planner</Link>
          </Button>
          <Button asChild icon={<Plus size={16} />}>
            <Link to="/trips/new">Plan a new trip</Link>
          </Button>
        </div>
      </section>

      {nextTrip ? (
        <>
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.8fr)]">
            <Card padding="none" className="relative min-h-[24rem] overflow-hidden bg-ink text-parchment sm:min-h-[28rem]">
              <ImageWithFallback src={nextTrip.trip.coverImageUrl} alt={`${nextTrip.trip.name} destination cover`} className="absolute inset-0 size-full object-cover opacity-65" fallbackClassName="absolute inset-0 size-full" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/35 to-transparent" />
              <div className="relative flex h-full min-h-[24rem] max-w-xl flex-col justify-between p-6 sm:min-h-[28rem] sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <Badge tone="sage">Next escape</Badge>
                  <span className="text-xs text-parchment/65">{formatRelativeDays(nextTrip.trip.startDate)}</span>
                </div>
                <div>
                  <p className="eyebrow text-parchment/60">{formatDateRange(nextTrip.trip.startDate, nextTrip.trip.endDate)}</p>
                  <h2 className="mt-3 font-display text-5xl font-medium leading-[0.95] tracking-[-0.05em] sm:text-6xl">{nextTrip.trip.name}</h2>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-parchment/72">{nextTrip.trip.description}</p>
                  <Button asChild variant="secondary" className="mt-6 bg-parchment text-ink hover:bg-white" icon={<ArrowUpRight size={16} />}>
                    <Link to={`/trips/${nextTrip.trip.id}/itinerary`}>Open itinerary</Link>
                  </Button>
                </div>
              </div>
            </Card>
            <Card className="flex flex-col justify-between bg-white/60">
              <div>
                <div className="flex items-center justify-between">
                  <p className="eyebrow">Trip pulse</p>
                  <Sparkles size={19} className="text-clay" aria-hidden="true" />
                </div>
                <div className="mt-8 grid gap-7">
                  <MetricCard label="Days until departure" value={formatRelativeDays(nextTrip.trip.startDate).replace('In ', '')} detail={formatDateRange(nextTrip.trip.startDate, nextTrip.trip.endDate)} accent="clay" />
                  <MetricCard label="Items planned" value={String(nextTrip.activities.length)} detail={`${nextTrip.stops.length} cities on the route`} accent="sage" />
                  <MetricCard label="Estimated budget" value={formatCurrency(nextTrip.budget.total)} detail={nextTrip.budget.budgetLimit ? `${formatCurrency(nextTrip.budget.budgetLimit)} limit` : 'No limit set'} />
                </div>
              </div>
              <Link to={`/trips/${nextTrip.trip.id}/budget`} className="mt-8 flex items-center justify-between border-t border-line pt-5 text-sm font-semibold text-ink/65 hover:text-ink">
                <span className="flex items-center gap-2"><WalletCards size={16} />View budget</span>
                <ChevronRight size={16} />
              </Link>
            </Card>
          </section>

          {/* Interactive Route Map on Dashboard */}
          <div>
            <SectionHeading eyebrow="Visual Route" title="Trip Map & Transit" description="Interactive stops and route flow." />
            <div className="mt-4">
              <TripMapView stops={nextTrip.stops} cities={state.db.cities} height="260px" />
            </div>
          </div>
        </>
      ) : (
        <EmptyState icon={<CalendarDays size={28} />} title="Your passport is waiting." description="Create your first trip and start turning a blank calendar into a story." action={<Button asChild icon={<Plus size={16} />}><Link to="/trips/new">Create a trip</Link></Button>} />
      )}
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]"><div className="space-y-5"><SectionHeading eyebrow="Keep going" title="Recent trips" action={<Button asChild variant="ghost" size="sm" icon={<ChevronRight size={15} />}><Link to="/trips">View all</Link></Button>} /><div className="grid gap-3">{recent.map((item) => <Link key={item.id} to={`/trips/${item.id}/itinerary`} className="group flex items-center gap-4 border-b border-line py-3 outline-none"><div className="size-16 shrink-0 overflow-hidden rounded-control bg-ink/5"><ImageWithFallback src={item.coverImageUrl} alt={`${item.name} cover`} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" fallbackClassName="size-full" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-display text-xl text-ink">{item.name}</h3><Badge tone={item.status === 'upcoming' ? 'sage' : 'neutral'}>{item.status}</Badge></div><p className="mt-1 text-xs text-ink/50">{formatDateRange(item.startDate, item.endDate)} · {item.stops.length} cities</p></div><ChevronRight size={17} className="shrink-0 text-ink/35 group-hover:text-clay" /></Link>)}</div></div><div className="space-y-5"><SectionHeading eyebrow="A little inspiration" title="Recommended for you" /><div className="grid gap-3">{recommendedCities.slice(0, 3).map((city) => <Link key={city.id} to={`/discover/cities?q=${encodeURIComponent(city.name)}`} className="group flex items-center gap-3 rounded-card border border-line bg-white/45 p-3 outline-none interactive-lift"><div className="size-14 shrink-0 overflow-hidden rounded-control"><ImageWithFallback src={city.imageUrl} alt={city.imageAlt} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" fallbackClassName="size-full" /></div><div className="min-w-0 flex-1"><h3 className="font-display text-xl text-ink">{city.name}</h3><p className="mt-0.5 flex items-center gap-1 text-xs text-ink/50"><MapPin size={12} />{city.region}</p></div><ArrowUpRight size={16} className="text-ink/35" /></Link>)}</div></div></section>
      <div className="hidden"><Compass /><Skeleton /><CalendarDays /><WalletCards /></div>
      <p className="sr-only">{totalPlanned} planned activities and {formatCurrency(totalBudget)} across upcoming trips.</p>
    </div>
  )
}
