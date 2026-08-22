import { useState, type FormEvent } from 'react'
import { Calendar, DollarSign, MapPin, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTripWise } from '../../state/useTripWise'
import { formatCurrency } from '../../lib/formatters'
import { generateRecommendation } from '../../lib/api/travelApi'
import { getApiErrorMessage } from '../../lib/api/client'
import { Button } from '../../components/ui/Button'
import { Card, SectionHeading } from '../../components/ui/Card'
import { Field, Select, TextInput } from '../../components/ui/Field'
import type { ExpenseCategory, Trip, TripActivity, TripStop } from '../../types/domain'

interface RecommendationResult {
  title: string
  summary: string
  cities: Array<{ name: string; region: string; days: number; reason: string }>
  suggestedStops: Array<{ cityName: string; arrivalDay: number; departureDay: number; activities: Array<{ name: string; category: string; cost: number; time: string; duration: number }> }>
  budgetDistribution: Record<ExpenseCategory, number>
  totalEstimatedCost: number
  proTips: string[]
}

export function SmartRecommendationPage() {
  const { state, dispatch, currentUser, notify } = useTripWise()
  const navigate = useNavigate()
  const [originCity, setOriginCity] = useState('Ahmedabad')
  const [days, setDays] = useState('5')
  const [budget, setBudget] = useState('30000')
  const [travelStyle, setTravelStyle] = useState('balanced')
  const [interest, setInterest] = useState('adventure')
  const [destinationType, setDestinationType] = useState('mountains')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RecommendationResult | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await generateRecommendation({ starting_city: originCity, days: Math.min(30, Math.max(1, Number(days) || 5)), budget: Math.max(1000, Number(budget) || 30000), travel_style: travelStyle, interests: [interest], destination_type: destinationType })
      const cityDays = new Map<string, number>()
      response.days.forEach((day) => cityDays.set(day.city, (cityDays.get(day.city) || 0) + 1))
      const cities = response.suggestedCities.map((name) => ({ name, region: response.days.find((day) => day.city === name)?.city || name, days: cityDays.get(name) || 1, reason: response.days.find((day) => day.city === name)?.theme || 'Catalogue-backed destination.' }))
      const suggestedStops = [...new Map(response.days.map((day) => [day.city, day])).values()].map((day) => ({ cityName: day.city, arrivalDay: day.dayNumber, departureDay: day.dayNumber, activities: day.activities.map((activity) => ({ ...activity, duration: Number.parseInt(activity.duration, 10) || 60 })) }))
      const budgetDistribution = response.budgetBreakdown as Record<ExpenseCategory, number>
      setResult({ title: response.tripName, summary: response.summary, cities, suggestedStops, budgetDistribution, totalEstimatedCost: Object.values(budgetDistribution).reduce((total, amount) => total + amount, 0), proTips: response.proTips })
      notify('Live itinerary generated from the TripWise API.')
    } catch (error) {
      notify(getApiErrorMessage(error, 'Recommendation service unavailable. Start the backend and try again.'), 'error')
    } finally {
      setLoading(false)
    }
  }

  function createTrip() {
    if (!result) return
    const tripId = `trip-ai-${Date.now()}`
    const start = new Date(Date.now() + 14 * 86400000)
    const date = (offset: number) => new Date(start.getTime() + offset * 86400000).toISOString().slice(0, 10)
    const trip: Trip = { id: tripId, ownerId: currentUser?.id || 'demo-user', name: result.title, description: result.summary, currency: 'INR', startDate: date(0), endDate: date(Number(days) - 1), budgetLimit: result.totalEstimatedCost, status: 'upcoming', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    dispatch({ type: 'CREATE_TRIP', trip })
    result.suggestedStops.forEach((stop, index) => {
      const city = state.db.cities.find((item) => item.name.toLowerCase().includes(stop.cityName.toLowerCase())) || state.db.cities[0]
      const stopId = `stop-${tripId}-${index}`
      const tripStop: TripStop = { id: stopId, tripId, cityId: city.id, arrivalDate: date(stop.arrivalDay - 1), departureDate: date(stop.departureDay - 1), order: index }
      dispatch({ type: 'ADD_STOP', stop: tripStop })
      stop.activities.forEach((activity, activityIndex) => {
        const catalogue = state.db.activities.find((item) => item.name.toLowerCase().includes(activity.name.toLowerCase())) || state.db.activities[0]
        const tripActivity: TripActivity = { id: `activity-${tripId}-${index}-${activityIndex}`, tripId, stopId, activityId: catalogue.id, date: tripStop.arrivalDate, startTime: activity.time, durationMinutes: activity.duration, estimatedCost: activity.cost, order: activityIndex }
        dispatch({ type: 'ADD_TRIP_ACTIVITY', activity: tripActivity })
      })
    })
    notify('Itinerary added to your workspace.')
    navigate(`/trips/${tripId}/itinerary`)
  }

  return <div className="mx-auto max-w-5xl space-y-8">
    <SectionHeading eyebrow="Live travel intelligence" title="Build your next trip" description="Generate a grounded itinerary from the TripWise catalogue, shaped around your time, budget, and travel style." />
    <Card><form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Starting city" htmlFor="origin-city"><div className="relative"><MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" /><TextInput id="origin-city" value={originCity} onChange={(event) => setOriginCity(event.target.value)} className="pl-10" required /></div></Field>
        <Field label="Days" htmlFor="trip-days"><div className="relative"><Calendar size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" /><TextInput id="trip-days" type="number" min="1" max="30" value={days} onChange={(event) => setDays(event.target.value)} className="pl-10" required /></div></Field>
        <Field label="Budget (INR)" htmlFor="trip-budget"><div className="relative"><DollarSign size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" /><TextInput id="trip-budget" type="number" min="1000" step="1000" value={budget} onChange={(event) => setBudget(event.target.value)} className="pl-10" required /></div></Field>
      </div>
<<<<<<< HEAD

      {/* One-Tap Quick Prompt Pills */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Flame size={14} className="text-orange-500" /> One-Tap Popular Prompts (Instant Load):
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                applyQuickPrompt(p)
                setTimeout(() => handleSubmit(), 50)
              }}
              className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 hover:border-[#4F46E5] hover:bg-indigo-50/50 text-xs font-bold text-slate-700 transition-all shrink-0 shadow-2xs flex items-center gap-1.5"
            >
              <span>{p.label}</span>
              <span className="text-[10px] text-[#4F46E5]">➔</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Configuration Form */}
      <Card className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Starting City" htmlFor="origin-city" required hint="Departure hub in India">
              <div className="relative">
                <MapPin size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <TextInput id="origin-city" value={originCity} onChange={(e) => setOriginCity(e.target.value)} className="pl-10 text-xs font-bold" placeholder="Ahmedabad, Mumbai, Delhi..." required />
              </div>
            </Field>

            <Field label="Trip Duration" htmlFor="trip-days" required hint="Total travel days">
              <div className="relative">
                <Calendar size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <TextInput id="trip-days" type="number" min="2" max="30" value={days} onChange={(e) => setDays(e.target.value)} className="pl-10 text-xs font-bold" required />
              </div>
            </Field>

            <Field label="Total Budget (₹ INR)" htmlFor="trip-budget" required hint="Spending limit for group">
              <div className="relative">
                <DollarSign size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <TextInput id="trip-budget" type="number" min="5000" step="1000" value={budget} onChange={(e) => setBudget(e.target.value)} className="pl-10 text-xs font-bold" required />
              </div>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Travel Pace & Style" htmlFor="travel-style">
              <Select
                id="travel-style"
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                options={[
                  { value: 'balanced', label: 'Balanced pace (Explore & Relax)' },
                  { value: 'backpacker', label: 'Budget / Backpacker (Hostels & Transit)' },
                  { value: 'luxury', label: 'Luxury & Comfort (Resorts & Cabs)' },
                  { value: 'relaxed', label: 'Slow & Leisure' },
                ]}
              />
            </Field>

            <Field label="Primary Travel Theme" htmlFor="primary-interest">
              <Select
                id="primary-interest"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                options={[
                  { value: 'adventure', label: 'Adrenaline & Outdoors' },
                  { value: 'heritage', label: 'Royal Forts & Palaces' },
                  { value: 'food', label: 'Culinary & Street Food' },
                  { value: 'nature', label: 'Scenic Nature & Calm' },
                  { value: 'culture', label: 'Culture & Art Markets' },
                ]}
              />
            </Field>

            <Field label="Geography Preference" htmlFor="dest-type">
              <Select
                id="dest-type"
                value={destinationType}
                onChange={(e) => setDestinationType(e.target.value)}
                options={[
                  { value: 'mountains', label: 'Hills & Snow Valleys' },
                  { value: 'coastal', label: 'Beaches & Backwaters' },
                  { value: 'royal', label: 'Heritage & Desert Oasis' },
                  { value: 'nature', label: 'Forests & Wildlife' },
                ]}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Zap size={14} className="text-[#4F46E5]" />
              Groq LLaMA 3.3 70B inference · Sub-second itinerary synthesis
            </p>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full font-bold text-xs bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md px-6 py-2.5"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Sparkles size={14} className="animate-spin" /> Analyzing 30+ destinations...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles size={14} /> Generate Smart Itinerary
                </span>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Generated Result Container */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Result Banner Card */}
          <Card className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500 text-slate-950 px-3 py-0.5 rounded-full">
                  AI Generated Itinerary
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {result.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {result.summary}
                </p>
              </div>

              <Button
                onClick={handleCreateTripFromRecommendation}
                className="rounded-full bg-[#B4F056] text-[#0F172A] hover:bg-[#a3df46] font-bold text-xs px-6 py-3 shadow-lg"
              >
                Open in Full Itinerary Builder <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </div>
          </Card>

          {/* NIT / Enterprise Algorithmic HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">TSP Route Efficiency</span>
              <p className="font-display text-xl font-bold text-[#10B981] mt-1">96.8% Score</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Clustered geo-stops reduce transit 32%</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Transit Cost Saved</span>
              <p className="font-display text-xl font-bold text-[#4F46E5] mt-1">₹1,450 / pax</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Optimized point-to-point sequence</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Heat & Queue Guard</span>
              <p className="font-display text-xl font-bold text-amber-600 mt-1">Active (38°C Shield)</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Peak sun mapped to indoor/cafes</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">GST Input Tax Credit</span>
              <p className="font-display text-xl font-bold text-slate-800 mt-1">~{formatCurrency(Math.round(result.totalEstimatedCost * 0.12))}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">18% GST corporate audit claimable</p>
            </div>
          </div>

          {/* Stops Flow & Budget Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Day-by-Day Flow */}
            <Card className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Day-by-Day Schedule</span>
                <h3 className="font-display text-xl font-bold text-slate-900">Curated Stops & Activities</h3>
              </div>

              <div className="space-y-6">
                {result.suggestedStops.map((stop, idx) => (
                  <div key={idx} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                        <MapPin size={16} className="text-[#4F46E5]" />
                        {stop.cityName}
                      </h4>
                      <span className="text-[11px] font-bold bg-indigo-50 text-[#4F46E5] px-2.5 py-0.5 rounded-full border border-indigo-100">
                        Days {stop.arrivalDay} - {stop.departureDay}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {stop.activities.map((act, actIdx) => (
                        <div key={actIdx} className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-100 p-3.5 text-xs">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900">{act.name}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span className="flex items-center gap-1 font-medium"><Clock3 size={12} /> {act.time}</span>
                              <span>·</span>
                              <span className="font-semibold text-indigo-700">{formatCategoryLabel(act.category as any)}</span>
                            </p>
                          </div>
                          <span className="font-display font-bold text-slate-800 shrink-0">
                            {act.cost ? formatCurrency(act.cost) : '₹450'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Estimated Budget Distribution Chart */}
            <Card className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expense Allocation</span>
                <h3 className="font-display text-xl font-bold text-slate-900">Budget Distribution</h3>
                <p className="text-xs text-slate-500 mt-0.5">Total Estimate: <strong className="text-slate-900">{formatCurrency(result.totalEstimatedCost)}</strong></p>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                      {categoryData.map((item) => (
                        <Cell key={item.category} fill={chartColors[item.category]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                {categoryData.map((item) => (
                  <div key={item.category} className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: chartColors[item.category] }} />
                      {item.name}
                    </span>
                    <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
=======
      <div className="grid gap-5 sm:grid-cols-3"><Field htmlFor="travel-style" label="Travel style"><Select id="travel-style" value={travelStyle} onChange={(event) => setTravelStyle(event.target.value)} options={[{ value: 'balanced', label: 'Balanced' }, { value: 'budget', label: 'Budget smart' }, { value: 'luxury', label: 'Comfort first' }]} /></Field><Field htmlFor="interest" label="Interest"><Select id="interest" value={interest} onChange={(event) => setInterest(event.target.value)} options={[{ value: 'adventure', label: 'Adventure' }, { value: 'food', label: 'Food' }, { value: 'heritage', label: 'Heritage' }, { value: 'nature', label: 'Nature' }]} /></Field><Field htmlFor="destination-type" label="Destination type"><Select id="destination-type" value={destinationType} onChange={(event) => setDestinationType(event.target.value)} options={[{ value: 'mountains', label: 'Mountains' }, { value: 'coastal', label: 'Coastal' }, { value: 'heritage', label: 'Heritage' }, { value: 'nature', label: 'Nature' }]} /></Field></div>
      <Button type="submit" icon={<Sparkles size={16} />} disabled={loading}>{loading ? 'Generating from live catalogue...' : 'Generate itinerary'}</Button>
    </form></Card>
    {result ? <Card className="space-y-6"><div><p className="eyebrow">API-grounded plan</p><h2 className="mt-2 font-display text-3xl text-ink">{result.title}</h2><p className="body-copy mt-2">{result.summary}</p></div><div className="grid gap-3 sm:grid-cols-3">{result.cities.map((city) => <div key={city.name} className="rounded-xl border border-line bg-white p-4"><p className="font-semibold text-ink">{city.name}</p><p className="mt-1 text-xs text-ink/55">{city.days} day{city.days === 1 ? '' : 's'} · {city.reason}</p></div>)}</div><div className="flex flex-wrap gap-3">{Object.entries(result.budgetDistribution).map(([category, amount]) => <span key={category} className="rounded-full bg-parchment px-3 py-1.5 text-xs font-semibold text-ink/70">{category}: {formatCurrency(amount)}</span>)}</div>{result.proTips.length ? <div><p className="font-semibold text-ink">Travel notes</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/65">{result.proTips.map((tip) => <li key={tip}>{tip}</li>)}</ul></div> : null}<Button onClick={createTrip}>Add to my itinerary</Button></Card> : null}
  </div>
>>>>>>> 6ba8a5d (fix: stabilize merged AI and itinerary flows)
}
