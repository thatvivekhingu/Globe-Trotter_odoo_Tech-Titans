import { ArrowRight, ArrowUpRight, Building2, Calendar, CalendarDays, ChevronRight, Flame, MapPin, Plane, Plus, ShieldCheck, Sparkles, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDashboardData } from '../../hooks/useTripSelectors'
import { useTripWise } from '../../state/useTripWise'
import { formatCurrency, formatDateRange, formatRelativeDays } from '../../lib/formatters'
import { Badge } from '../../components/ui/Badge'
import { Button, MacWindowControls } from '../../components/ui/Button'
import { Card, SectionHeading } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/Feedback'
import { ImageWithFallback } from '../../components/ui/ImageWithFallback'
import { TripMapView } from '../../components/map/TripMapView'
import { useState, useEffect } from 'react'
import { LiveWeatherWidget } from '../../components/weather/LiveWeatherWidget'

export function DashboardPage() {
  const { currentUser, state } = useTripWise()
  const { upcoming, recent, recommendedCities } = useDashboardData()
  const nextTrip = upcoming[0]

  const budgetLimit = nextTrip?.budget.budgetLimit || 75000
  const budgetSpent = nextTrip?.budget.total || 45700
  const percentBudget = Math.min(100, Math.round((budgetSpent / budgetLimit) * 100))

  const destinationCity = state.db.cities.find(c => c.id === nextTrip?.stops[0]?.cityId) || state.db.cities[0]

  // Real-time ticking countdown
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, mins: 28, secs: 42 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 }
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 }
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const quickPillActions = [
    { label: 'AI Trip Architect', to: '/recommendations', icon: Sparkles, color: 'from-indigo-600 to-violet-600', badge: 'Groq 3.3' },
    { label: 'Curated Tour Packages', to: '/packages', icon: Flame, color: 'from-orange-500 to-amber-500', badge: '40% Off' },
    { label: 'Live Bookings', to: '/booking', icon: Plane, color: 'from-blue-600 to-cyan-600', badge: 'Razorpay' },
    { label: 'Receipt OCR Scanner', to: '/trips/trip-goa-mmt/budget', icon: WalletCards, color: 'from-emerald-600 to-teal-600', badge: 'Neural' },
    { label: 'Visa & Insurance', to: '/forex', icon: ShieldCheck, color: 'from-slate-800 to-slate-900', badge: 'Embassy' },
    { label: 'Odoo ERP Sync', to: '/odoo', icon: Building2, color: 'from-purple-700 to-indigo-900', badge: 'Enterprise' },
  ]

  return (
    <div className="space-y-9">
      {/* 1. Live Flight & Reservation Ticker with Live Ticking Countdown */}
      <div className="bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950 text-white py-3.5 px-5 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-xl border border-slate-800/80 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
          <MacWindowControls className="mr-1 hidden sm:flex" />
          <span className="bg-[#10B981] text-[#0F172A] px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold tracking-wider animate-pulse">
            Live Flight
          </span>
          <span className="text-slate-200">
            ✈️ IndiGo 6E-5342 (BOM ➔ GOI) · Gate 14B · Seat 14A · PNR: <span className="font-mono text-[#B4F056]">GT-7K9A2X</span>
          </span>
        </div>

        {/* Dynamic Countdown Clock */}
        <div className="flex items-center gap-2 font-mono text-xs bg-black/40 px-3.5 py-1.5 rounded-2xl border border-white/10 text-white">
          <span className="text-slate-400 font-sans text-[11px] font-bold">Takeoff In:</span>
          <span className="text-[#B4F056] font-bold">
            {String(timeLeft.days).padStart(2, '0')}d : {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.mins).padStart(2, '0')}m : {String(timeLeft.secs).padStart(2, '0')}s
          </span>
        </div>
      </div>

      {/* Weather Advisory & Smart Packing Alert */}
      <div className="p-3.5 px-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex flex-wrap items-center justify-between gap-3 text-xs backdrop-blur-md">
        <div className="flex items-center gap-2.5 font-medium">
          <span className="text-base">🌦️</span>
          <span><strong>Destination Advisory (Goa):</strong> Light coastal showers expected in afternoon (28°C). Pack a quick-dry windcheater and waterproof sandals.</span>
        </div>
        <Link to="/packing" className="text-[#4F46E5] font-bold hover:underline shrink-0">
          Open Packing Checklist ➔
        </Link>
      </div>

      {/* 2. Top Welcome Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50/90 border border-indigo-200/80 text-[11px] font-bold text-[#4F46E5] mb-2.5 backdrop-blur-md">
            <Calendar size={13} />
            Saturday, 22 August 2026 · AI Travel Copilot Active
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Welcome back, {currentUser?.name.split(' ')[0] || 'Priyanka'}.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500 font-normal">
            Your real-time travel intelligence workspace with Groq LLaMA 3.3 AI, neural OCR expense tracking, and live GIS maps.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild variant="secondary" icon={<Sparkles size={15} />} className="rounded-full shadow-xs">
            <Link to="/recommendations">AI Trip Planner</Link>
          </Button>
          <Button asChild icon={<Plus size={15} />} className="rounded-full shadow-md bg-linear-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700">
            <Link to="/trips/new">Plan a new trip</Link>
          </Button>
        </div>
      </section>

      {/* 3. Quick-Action Floating Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickPillActions.map((act) => (
          <Link
            key={act.label}
            to={act.to}
            className="group relative p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-2xs hover:bg-white hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className={`size-10 rounded-2xl bg-linear-to-br ${act.color} text-white flex items-center justify-center shadow-md`}>
                <act.icon size={18} />
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider bg-slate-100/90 text-slate-700 px-2 py-0.5 rounded-full group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
                {act.badge}
              </span>
            </div>
            <p className="font-display text-xs font-bold text-slate-800 mt-4 group-hover:text-[#4F46E5] transition-colors leading-snug">
              {act.label}
            </p>
          </Link>
        ))}
      </div>

      {/* 4. Hero Next Trip & Pulse Cards */}
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

                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    <Button asChild className="rounded-full bg-[#B4F056] text-[#0F172A] hover:bg-[#a3df46] font-bold text-xs shadow-md">
                      <Link to={`/trips/${nextTrip.trip.id}/itinerary`}>
                        Open Itinerary Workspace <ArrowRight size={14} className="ml-1" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="rounded-full bg-white/10 hover:bg-white/20 text-white text-xs border border-white/20 backdrop-blur-xs">
                      <Link to={`/trips/${nextTrip.trip.id}/budget`}>
                        <WalletCards size={14} className="mr-1.5" /> Budget Ledger
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Pulse & Weather Widget */}
            <Card className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl border border-slate-200 bg-white shadow-xs">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Destination Pulse</span>
                    <h3 className="font-display text-lg font-bold text-slate-900">{destinationCity?.name || 'Goa'}, India</h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    {nextTrip.stops.length} Stops Active
                  </span>
                </div>

                {/* Estimated Budget Usage Progress */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Budget Spent:</span>
                    <span className="text-[#4F46E5] font-display text-base">{formatCurrency(budgetSpent)}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#4F46E5] h-full rounded-full transition-all duration-500" style={{ width: `${percentBudget}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>{percentBudget}% limit consumed</span>
                    <span>Total Limit: {formatCurrency(budgetLimit)}</span>
                  </div>
                </div>

                {/* Satellite Weather Forecast */}
                <LiveWeatherWidget city={destinationCity} />
              </div>

              <Link
                to={`/trips/${nextTrip.trip.id}/budget`}
                className="mt-5 flex items-center justify-between pt-3.5 border-t border-slate-100 text-xs font-bold text-[#4F46E5] hover:text-indigo-800 transition-colors"
              >
                <span className="flex items-center gap-1.5"><WalletCards size={15} />Open Full Budget & Splitter</span>
                <ChevronRight size={15} />
              </Link>
            </Card>
          </section>

          {/* 5. Interactive Route Map on Dashboard */}
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

      {/* 6. Recent Trips & Recommended Destinations Grid */}
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
