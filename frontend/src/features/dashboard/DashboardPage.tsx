import { ArrowUpRight, Calendar, CalendarDays, ChevronRight, MapPin, Plus, Sparkles, TrendingUp, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDashboardData } from '../../hooks/useTripSelectors'
import { useTripWise } from '../../state/useTripWise'
import { formatCurrency, formatDateRange, formatRelativeDays } from '../../lib/formatters'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, SectionHeading } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/Feedback'
import { ImageWithFallback } from '../../components/ui/ImageWithFallback'
import { TripMapView } from '../../components/map/TripMapView'

import { LiveWeatherWidget } from '../../components/weather/LiveWeatherWidget'

export function DashboardPage() {
  const { currentUser, state } = useTripWise()
  const { upcoming, recent, recommendedCities } = useDashboardData()
  const nextTrip = upcoming[0]

  const budgetLimit = nextTrip?.budget.budgetLimit || 75000
  const budgetSpent = nextTrip?.budget.total || 45700
  const percentBudget = Math.min(100, Math.round((budgetSpent / budgetLimit) * 100))

  const destinationCity = state.db.cities.find(c => c.id === nextTrip?.stops[0]?.cityId) || state.db.cities[0]

  return (
    <div className="space-y-9">
      {/* 1. Live Flight & Departure Status Ticker */}
      <div className="bg-[#0F172A] text-white py-2.5 px-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-800">
        <div className="flex items-center gap-2.5 text-xs font-bold">
          <span className="bg-[#10B981] text-[#0F172A] px-2 py-0.5 rounded-md text-[10px] uppercase font-extrabold tracking-wider">
            Live Flight
          </span>
          <span className="text-slate-200">IndiGo 6E-5342 (BOM ➔ GOI) · Gate 14B · Status: <span className="text-[#B4F056]">On Time</span> · Boarding 06:45 AM</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="hidden sm:inline">🏨 Taj Fort Aguada (Ocean View Suite) Confirmed</span>
          <Link to="/booking" className="text-[#B4F056] font-bold hover:underline">View Ticket ➔</Link>
        </div>
      </div>

      {/* Top Welcome Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-semibold text-slate-600 mb-2.5">
            <Calendar size={13} className="text-[#4F46E5]" />
            Saturday, 22 August 2026
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Welcome back, {currentUser?.name.split(' ')[0] || 'Priyanka'}.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500 font-normal">
            Your real-time travel command center with live weather, synced itineraries, and smart expense tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild variant="secondary" icon={<Sparkles size={15} />} className="rounded-full shadow-2xs">
            <Link to="/recommendations">AI Trip Planner</Link>
          </Button>
          <Button asChild icon={<Plus size={15} />} className="rounded-full shadow-sm">
            <Link to="/trips/new">Plan a new trip</Link>
          </Button>
        </div>
      </section>

      {/* Hero Next Trip & Pulse Cards */}
      {nextTrip ? (
        <>
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(22rem,0.9fr)]">
            {/* Hero Trip Card */}
            <div className="relative min-h-[26rem] sm:min-h-[30rem] rounded-3xl overflow-hidden border border-slate-200/80 shadow-md group">
              <ImageWithFallback
                src={nextTrip.trip.coverImageUrl}
                alt={`${nextTrip.trip.name} destination cover`}
                className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-700"
                fallbackClassName="absolute inset-0 size-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

              <div className="relative flex h-full flex-col justify-between p-6 sm:p-9 text-white">
                <div className="flex items-center justify-between gap-3">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#10B981] text-[#0F172A] text-xs font-bold uppercase tracking-wider shadow-sm">
                    Next Escape
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
                    {formatRelativeDays(nextTrip.trip.startDate)}
                  </span>
                </div>

                <div className="space-y-3 max-w-xl">
                  <p className="text-xs uppercase tracking-widest text-[#B4F056] font-bold">
                    {formatDateRange(nextTrip.trip.startDate, nextTrip.trip.endDate)}
                  </p>
                  <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-white">
                    {nextTrip.trip.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed">
                    {nextTrip.trip.description}
                  </p>

                  <div className="pt-3 flex items-center gap-3">
                    <Button asChild variant="secondary" className="rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs" icon={<ArrowUpRight size={15} />}>
                      <Link to={`/trips/${nextTrip.trip.id}/itinerary`}>Open Itinerary</Link>
                    </Button>
                    <Button asChild variant="ghost" className="rounded-full text-white hover:bg-white/20 text-xs">
                      <Link to={`/trips/${nextTrip.trip.id}/builder`}>Edit Route</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Pulse Card */}
            <Card className="flex flex-col justify-between border border-slate-200/80 shadow-md p-6 sm:p-7 bg-white">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p className="eyebrow">Trip Pulse</p>
                      <h3 className="font-display text-lg font-bold text-slate-900 leading-tight">Live Analytics</h3>
                    </div>
                  </div>
                  <Sparkles size={18} className="text-[#4F46E5]" />
                </div>

                <div className="mt-6 space-y-4">
                  {/* Days metric */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-900/60">Days to Departure</p>
                      <p className="font-display text-2xl font-bold text-indigo-950 mt-0.5">
                        {formatRelativeDays(nextTrip.trip.startDate).replace('In ', '')}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 bg-white px-2.5 py-1 rounded-full shadow-2xs">
                      Confirmed
                    </span>
                  </div>

                  {/* Planned items */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-900/60">Anchors & Activities</p>
                      <p className="font-display text-2xl font-bold text-emerald-950 mt-0.5">
                        {nextTrip.activities.length} Planned
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-white px-2.5 py-1 rounded-full shadow-2xs">
                      {nextTrip.stops.length} Cities
                    </span>
                  </div>

                  {/* Estimated budget */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Estimated Budget</p>
                      <span className="font-display text-base font-bold text-slate-900">
                        {formatCurrency(budgetSpent)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#4F46E5] h-full rounded-full transition-all" style={{ width: `${percentBudget}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 mt-1.5">
                      <span>{percentBudget}% of limit used</span>
                      <span>Limit: {formatCurrency(budgetLimit)}</span>
                    </div>
                  </div>

                  {/* Destination Weather Forecast */}
                  <LiveWeatherWidget city={destinationCity} />
                </div>
              </div>

              <Link
                to={`/trips/${nextTrip.trip.id}/budget`}
                className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-[#4F46E5] hover:text-indigo-800 transition-colors"
              >
                <span className="flex items-center gap-1.5"><WalletCards size={15} />Open Full Budget & Splitter</span>
                <ChevronRight size={15} />
              </Link>
            </Card>
          </section>

          {/* Interactive Route Map on Dashboard */}
          <div className="space-y-4">
            <SectionHeading
              eyebrow="Geographical Overview"
              title="Interactive Transit & Stop Route"
              description="Real coordinates and connection lines across planned itinerary stops."
            />
            <TripMapView stops={nextTrip.stops} cities={state.db.cities} height="280px" />
          </div>
        </>
      ) : (
        <EmptyState
          icon={<CalendarDays size={28} />}
          title="Your passport is waiting."
          description="Create your first trip and start turning a blank calendar into a story."
          action={
            <Button asChild icon={<Plus size={16} />}>
              <Link to="/trips/new">Create a trip</Link>
            </Button>
          }
        />
      )}

      {/* Recent Trips & Inspiration Grid */}
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)]">
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Keep going"
            title="Recent Trips"
            action={
              <Button asChild variant="ghost" size="sm" icon={<ChevronRight size={15} />}>
                <Link to="/trips">View all</Link>
              </Button>
            }
          />
          <div className="grid gap-3">
            {recent.map((item) => (
              <Link
                key={item.id}
                to={`/trips/${item.id}/itinerary`}
                className="group flex items-center gap-4 p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  <ImageWithFallback
                    src={item.coverImageUrl}
                    alt={`${item.name} cover`}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                    fallbackClassName="size-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-display text-lg font-bold text-slate-900">{item.name}</h3>
                    <Badge tone={item.status === 'upcoming' ? 'sage' : 'neutral'}>{item.status}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatDateRange(item.startDate, item.endDate)} · {item.stops.length} stops
                  </p>
                </div>
                <ChevronRight size={17} className="shrink-0 text-slate-400 group-hover:text-[#4F46E5] group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeading eyebrow="Inspiration" title="Recommended Destinations" />
          <div className="grid gap-3">
            {recommendedCities.slice(0, 3).map((city) => (
              <Link
                key={city.id}
                to={`/discover/cities?q=${encodeURIComponent(city.name)}`}
                className="group flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-3 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="size-14 shrink-0 overflow-hidden rounded-xl">
                  <ImageWithFallback
                    src={city.imageUrl}
                    alt={city.imageAlt}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                    fallbackClassName="size-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-bold text-slate-900">{city.name}</h3>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={12} className="text-[#4F46E5]" />
                    {city.region}
                  </p>
                </div>
                <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#4F46E5] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
