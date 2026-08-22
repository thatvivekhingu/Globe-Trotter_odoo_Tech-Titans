import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, MapPin, Calendar, DollarSign, CheckCircle2, PieChart as PieChartIcon } from 'lucide-react'
import { useTripWise } from '../../state/useTripWise'
import { formatCurrency, formatCategoryLabel } from '../../lib/formatters'
import { Button } from '../../components/ui/Button'
import { Card, SectionHeading } from '../../components/ui/Card'
import { Field, Select, TextInput } from '../../components/ui/Field'
import { Badge } from '../../components/ui/Badge'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { ExpenseCategory } from '../../types/domain'
import { generateRecommendation } from '../../lib/api/travelApi'
import { getApiErrorMessage } from '../../lib/api/client'

interface RecommendationResult {
  title: string
  summary: string
  cities: Array<{ name: string; region: string; days: number; reason: string }>
  suggestedStops: Array<{
    cityName: string
    arrivalDay: number
    departureDay: number
    activities: Array<{ name: string; category: string; cost: number; time: string; duration: number }>
  }>
  budgetDistribution: Record<ExpenseCategory, number>
  totalEstimatedCost: number
}

const chartColors: Record<ExpenseCategory, string> = {
  transportation: '#2A3439',
  accommodation: '#A45A52',
  activities: '#85B09A',
  food: '#D8A88F',
  other: '#9EA6A5',
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const numDays = Math.max(2, parseInt(days, 10) || 5)
    const numBudget = Math.max(5000, parseInt(budget, 10) || 30000)

    try {
      const response = await generateRecommendation({
        starting_city: originCity,
        days: numDays,
        budget: numBudget,
        travel_style: travelStyle,
        interests: [interest],
        destination_type: destinationType,
      })
      const cityDays = new Map<string, number>()
      response.days.forEach((day) => cityDays.set(day.city, (cityDays.get(day.city) || 0) + 1))
      const cities = response.suggestedCities.map((name) => ({
        name,
        region: response.days.find((day) => day.city === name)?.city || name,
        days: cityDays.get(name) || 1,
        reason: response.days.find((day) => day.city === name)?.theme || 'A curated stop in your route.',
      }))
      const suggestedStops = [...new Map(response.days.map((day) => [day.city, day])).values()].map((day) => ({
        cityName: day.city,
        arrivalDay: day.dayNumber,
        departureDay: day.dayNumber,
        activities: day.activities.map((activity) => ({ ...activity, duration: Number.parseInt(activity.duration, 10) || 60 })),
      }))
      const budgetDistribution = response.budgetBreakdown as Record<ExpenseCategory, number>
      setResult({ title: response.tripName, summary: response.summary, cities, suggestedStops, budgetDistribution, totalEstimatedCost: Object.values(budgetDistribution).reduce((total, amount) => total + amount, 0) })
      notify('Live recommendation generated from the TripWise API.')
    } catch (error) {
      notify(getApiErrorMessage(error, 'Recommendation service is unavailable. Start the backend and try again.'), 'error')
    } finally {
      setLoading(false)
    }

  }

  function handleCreateTripFromRecommendation() {
    if (!result) return
    const tripId = `trip-ai-${Date.now()}`
    const now = new Date()
    const startDate = new Date(now.setDate(now.getDate() + 14)).toISOString().slice(0, 10)
    const endDate = new Date(now.setDate(now.getDate() + parseInt(days, 10))).toISOString().slice(0, 10)

    // Find city objects
    const stops = result.cities.map((city, idx) => {
      const dbCity = state.db.cities.find((c) => c.name.toLowerCase().includes(city.name.toLowerCase())) || state.db.cities[0]
      return {
        id: `stop-ai-${Date.now()}-${idx}`,
        tripId,
        cityId: dbCity.id,
        arrivalDate: startDate,
        departureDate: endDate,
        order: idx,
      }
    })

    const activities = result.suggestedStops.flatMap((stop, stopIdx) => {
      const stopObj = stops[stopIdx] || stops[0]
      return stop.activities.map((act, actIdx) => {
        const dbAct = state.db.activities.find((a) => a.name.toLowerCase().includes(act.name.toLowerCase())) || state.db.activities[0]
        return {
          id: `act-ai-${Date.now()}-${stopIdx}-${actIdx}`,
          tripId,
          stopId: stopObj.id,
          activityId: dbAct.id,
          date: startDate,
          startTime: act.time,
          durationMinutes: act.duration,
          estimatedCost: act.cost,
          order: actIdx,
        }
      })
    })

    const expenses = (Object.entries(result.budgetDistribution) as [ExpenseCategory, number][]).map(([category, amount], idx) => ({
      id: `exp-ai-${Date.now()}-${idx}`,
      tripId,
      category,
      amount,
      date: startDate,
      description: `Estimated ${formatCategoryLabel(category)} allowance`,
    }))

    dispatch({
      type: 'CREATE_TRIP',
      trip: {
        id: tripId,
        ownerId: currentUser?.id || 'demo-user',
        name: result.title,
        description: result.summary,
        currency: 'INR',
        startDate,
        endDate,
        budgetLimit: result.totalEstimatedCost,
        status: 'upcoming',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })

    stops.forEach((stop) => dispatch({ type: 'ADD_STOP', stop }))
    activities.forEach((act) => dispatch({ type: 'ADD_TRIP_ACTIVITY', activity: act }))
    expenses.forEach((exp) => dispatch({ type: 'ADD_EXPENSE', expense: exp }))

    notify('Trip added to your account! Opening itinerary.')
    navigate(`/trips/${tripId}/itinerary`)
  }

  const categoryData = result ? (Object.entries(result.budgetDistribution) as [ExpenseCategory, number][]).map(([cat, amt]) => ({
    name: formatCategoryLabel(cat),
    amount: amt,
    category: cat,
  })) : []

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <SectionHeading
        eyebrow="Phase 16 · Intelligent Planning"
        title="Smart Trip Recommendation"
        description="Share your starting city, budget, and travel preferences to receive a complete, constraint-aware travel recommendation."
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Starting City" htmlFor="origin-city" required hint="Where your route begins">
              <div className="relative">
                <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
                <TextInput id="origin-city" value={originCity} onChange={(e) => setOriginCity(e.target.value)} className="pl-10" placeholder="e.g. Ahmedabad, Mumbai" required />
              </div>
            </Field>

            <Field label="Number of Days" htmlFor="trip-days" required hint="Total travel duration">
              <div className="relative">
                <Calendar size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
                <TextInput id="trip-days" type="number" min="2" max="30" value={days} onChange={(e) => setDays(e.target.value)} className="pl-10" required />
              </div>
            </Field>

            <Field label="Total Budget (₹ INR)" htmlFor="trip-budget" required hint="Target spending limit">
              <div className="relative">
                <DollarSign size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
                <TextInput id="trip-budget" type="number" min="5000" step="1000" value={budget} onChange={(e) => setBudget(e.target.value)} className="pl-10" required />
              </div>
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Travel Style" htmlFor="travel-style">
              <Select
                id="travel-style"
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                options={[
                  { value: 'balanced', label: 'Balanced pace' },
                  { value: 'backpacker', label: 'Budget / Backpacker' },
                  { value: 'luxury', label: 'Luxury & comfort' },
                  { value: 'relaxed', label: 'Slow & relaxed' },
                ]}
              />
            </Field>

            <Field label="Primary Interest" htmlFor="primary-interest">
              <Select
                id="primary-interest"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                options={[
                  { value: 'adventure', label: 'Adventure & outdoors' },
                  { value: 'heritage', label: 'Heritage & forts' },
                  { value: 'food', label: 'Food & culinary' },
                  { value: 'nature', label: 'Nature & calm' },
                  { value: 'culture', label: 'Culture & arts' },
                ]}
              />
            </Field>

            <Field label="Preferred Destination Type" htmlFor="dest-type">
              <Select
                id="dest-type"
                value={destinationType}
                onChange={(e) => setDestinationType(e.target.value)}
                options={[
                  { value: 'mountains', label: 'Mountains & hills' },
                  { value: 'coastal', label: 'Coastal & beaches' },
                  { value: 'royal', label: 'Royal & palaces' },
                  { value: 'nature', label: 'Nature & retreats' },
                ]}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between border-t border-line pt-5">
            <p className="text-xs text-ink/50 flex items-center gap-1.5">
              <Sparkles size={14} className="text-clay" />
              Constraint-aware recommendation with budget distribution
            </p>
            <Button type="submit" disabled={loading} icon={<Sparkles size={16} />}>
              {loading ? 'Analyzing options...' : 'Get AI Recommendation'}
            </Button>
          </div>
        </form>
      </Card>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="bg-ink text-parchment">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Badge tone="sage">Recommended Route</Badge>
                <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-parchment">
                  {result.title}
                </h2>
                <p className="mt-2 text-sm text-parchment/70 max-w-2xl leading-relaxed">
                  {result.summary}
                </p>
              </div>
              <Button onClick={handleCreateTripFromRecommendation} icon={<CheckCircle2 size={16} />}>
                Create This Trip
              </Button>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Suggested Cities & Activities */}
            <Card>
              <p className="eyebrow">Suggested Stops & Anchors</p>
              <h3 className="mt-2 font-display text-2xl text-ink">Itinerary Flow</h3>
              <div className="mt-6 space-y-6">
                {result.suggestedStops.map((stop, idx) => (
                  <div key={idx} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-xl text-ink flex items-center gap-2">
                        <MapPin size={16} className="text-clay" />
                        {stop.cityName}
                      </h4>
                      <Badge tone="clay">Days {stop.arrivalDay} - {stop.departureDay}</Badge>
                    </div>
                    <div className="mt-3 space-y-2">
                      {stop.activities.map((act, actIdx) => (
                        <div key={actIdx} className="flex items-center justify-between rounded-control bg-parchment/60 p-3 text-xs">
                          <div>
                            <p className="font-semibold text-ink">{act.name}</p>
                            <p className="text-ink/50 mt-0.5">{act.time} · {formatCategoryLabel(act.category as any)}</p>
                          </div>
                          <span className="font-semibold text-ink">{act.cost ? formatCurrency(act.cost) : 'Free'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Approximate Budget Distribution */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Estimated Spend</p>
                  <h3 className="mt-2 font-display text-2xl text-ink">Budget Distribution</h3>
                </div>
                <PieChartIcon size={20} className="text-clay" />
              </div>

              <div className="mt-4 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={4}>
                      {categoryData.map((item) => (
                        <Cell key={item.category} fill={chartColors[item.category as ExpenseCategory]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => formatCurrency(Number(val))} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-2 border-t border-line pt-4 text-xs">
                {categoryData.map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <span className="text-ink/60">{item.name}</span>
                    <span className="font-semibold text-ink">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-line pt-2 font-bold text-ink">
                  <span>Total Estimated Spend</span>
                  <span>{formatCurrency(result.totalEstimatedCost)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
