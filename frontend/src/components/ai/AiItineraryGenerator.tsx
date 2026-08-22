/**
 * AiItineraryGenerator — modal + results for AI-generated itineraries
 */
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  IndianRupee,
  Lightbulb,
  Loader2,
  MapPin,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { generateAiItinerary } from '../../lib/api/aiApi'
import type { ActivityCategory, ItineraryDay, ItineraryResponse, TravelStyle } from '../../lib/api/aiApi'
import { getApiErrorMessage } from '../../lib/api/client'
import { Button } from '../ui/Button'

// ─── Category colours ──────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  sightseeing: 'bg-blue-100 text-blue-700',
  food: 'bg-orange-100 text-orange-700',
  adventure: 'bg-red-100 text-red-700',
  nature: 'bg-green-100 text-green-700',
  shopping: 'bg-purple-100 text-purple-700',
  culture: 'bg-amber-100 text-amber-700',
  entertainment: 'bg-pink-100 text-pink-700',
}

const ALL_CATEGORIES: ActivityCategory[] = [
  'sightseeing', 'food', 'adventure', 'nature', 'shopping', 'culture', 'entertainment',
]

// ─── Day card ──────────────────────────────────────────────────────────────
function DayCard({ day, index }: { day: ItineraryDay; index: number }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div className="rounded-xl border border-line overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-parchment/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-parchment">
            {index + 1}
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{day.theme}</p>
            <p className="text-xs text-ink/50">{day.date} · {day.activities.length} activities</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-medium text-ink/60">
            ₹{Number(day.total_cost).toLocaleString()}
          </span>
          {open ? <ChevronDown size={16} className="text-ink/40" /> : <ChevronRight size={16} className="text-ink/40" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-line divide-y divide-line bg-parchment/30">
          {day.notes && (
            <p className="px-4 py-2.5 text-xs italic text-ink/55">{day.notes}</p>
          )}
          {day.activities.map((activity, ai) => (
            <div key={ai} className="flex gap-3 px-4 py-3">
              <div className="w-12 shrink-0 text-center">
                <p className="text-xs font-semibold text-ink">{activity.time}</p>
                <p className="mt-0.5 text-[10px] text-ink/40">{activity.duration_minutes}m</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink">{activity.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[activity.category]}`}>
                    {activity.category}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink/60 leading-relaxed">{activity.description}</p>
                {activity.tips && (
                  <p className="mt-1 flex items-start gap-1 text-[11px] text-clay">
                    <Lightbulb size={11} className="mt-0.5 shrink-0" />
                    {activity.tips}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-semibold text-ink">
                  ₹{Number(activity.estimated_cost).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Results view ──────────────────────────────────────────────────────────
function ItineraryResults({
  result,
  onReset,
}: {
  result: ItineraryResponse
  onReset: () => void
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Hero summary */}
      <div className="rounded-2xl bg-ink p-5 text-parchment">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow text-parchment/50">AI-generated itinerary</p>
            <h2 className="mt-1 font-display text-2xl font-medium">{result.destination}</h2>
            <p className="mt-2 text-sm text-parchment/70 leading-relaxed">{result.summary}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-parchment/50">Total estimate</p>
            <p className="font-display text-2xl font-semibold">
              ₹{Number(result.total_estimated_cost).toLocaleString()}
            </p>
            <p className="text-xs text-parchment/40">{result.total_days} days</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-parchment/60">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {result.best_time_to_visit}
          </span>
        </div>
      </div>

      {/* Days */}
      <div className="space-y-3">
        {result.days.map((day, i) => (
          <DayCard key={day.date} day={day} index={i} />
        ))}
      </div>

      {/* Packing tips */}
      {result.packing_tips.length > 0 && (
        <div className="rounded-xl border border-line bg-sage/5 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Star size={14} className="text-sage" /> Packing tips
          </p>
          <ul className="mt-3 space-y-1.5">
            {result.packing_tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-ink/70">
                <span className="mt-0.5 size-1.5 rounded-full bg-sage shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button variant="secondary" onClick={onReset} className="w-full">
        Generate another itinerary
      </Button>
    </div>
  )
}

// ─── Main modal ────────────────────────────────────────────────────────────

interface AiItineraryGeneratorProps {
  open: boolean
  onClose: () => void
  defaultDestination?: string
  defaultStartDate?: string
  defaultEndDate?: string
}

export function AiItineraryGenerator({
  open,
  onClose,
  defaultDestination = '',
  defaultStartDate = '',
  defaultEndDate = '',
}: AiItineraryGeneratorProps) {
  const [destination, setDestination] = useState(defaultDestination)
  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(defaultEndDate)
  const [budget, setBudget] = useState('')
  const [style, setStyle] = useState<TravelStyle>('comfort')
  const [interests, setInterests] = useState<ActivityCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ItineraryResponse | null>(null)

  if (!open) return null

  function toggleInterest(cat: ActivityCategory) {
    setInterests((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!destination || !startDate || !endDate) return
    setLoading(true)
    setError(null)
    try {
      const res = await generateAiItinerary({
        destination,
        start_date: startDate,
        end_date: endDate,
        budget: budget ? parseFloat(budget) : undefined,
        currency: 'INR',
        interests,
        travel_style: style,
      })
      setResult(res)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not generate itinerary. Try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="AI Itinerary Generator"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-parchment shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-parchment px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-clay" />
            <h2 className="font-display text-lg font-semibold text-ink">AI Itinerary Generator</h2>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink/50 hover:bg-ink/5 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {result ? (
            <ItineraryResults result={result} onReset={() => setResult(null)} />
          ) : (
            <form onSubmit={(e) => { void handleGenerate(e) }} className="space-y-5">
              {/* Destination */}
              <div>
                <label htmlFor="ai-destination" className="block text-xs font-semibold text-ink/70 mb-1.5">
                  Destination *
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                  <input
                    id="ai-destination"
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Goa, India"
                    className="w-full rounded-control border border-line bg-white py-2.5 pl-9 pr-4 text-sm text-ink placeholder-ink/35 outline-none focus:border-ink"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ai-start" className="block text-xs font-semibold text-ink/70 mb-1.5">
                    Start date *
                  </label>
                  <input
                    id="ai-start"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-control border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label htmlFor="ai-end" className="block text-xs font-semibold text-ink/70 mb-1.5">
                    End date *
                  </label>
                  <input
                    id="ai-end"
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full rounded-control border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink"
                  />
                </div>
              </div>

              {/* Budget + Style */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ai-budget" className="block text-xs font-semibold text-ink/70 mb-1.5">
                    Budget (₹ optional)
                  </label>
                  <div className="relative">
                    <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                    <input
                      id="ai-budget"
                      type="number"
                      min="0"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. 25000"
                      className="w-full rounded-control border border-line bg-white py-2.5 pl-8 pr-3 text-sm text-ink placeholder-ink/35 outline-none focus:border-ink"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="ai-style" className="block text-xs font-semibold text-ink/70 mb-1.5">
                    Travel style
                  </label>
                  <select
                    id="ai-style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value as TravelStyle)}
                    className="w-full rounded-control border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink"
                  >
                    <option value="budget">Budget</option>
                    <option value="comfort">Comfort</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
              </div>

              {/* Interests */}
              <div>
                <p className="text-xs font-semibold text-ink/70 mb-2">Interests (optional)</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleInterest(cat)}
                      className={[
                        'rounded-full px-3 py-1 text-xs font-medium transition-colors border',
                        interests.includes(cat)
                          ? 'bg-ink text-parchment border-ink'
                          : 'bg-white text-ink/70 border-line hover:border-ink hover:text-ink',
                      ].join(' ')}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-clay/30 bg-clay/5 px-3 py-2.5 text-xs text-clay">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                loading={loading}
                icon={loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                className="w-full"
                disabled={!destination || !startDate || !endDate}
              >
                {loading ? 'Generating your itinerary…' : 'Generate itinerary'}
              </Button>
              {loading && (
                <p className="text-center text-xs text-ink/40">
                  <Clock size={11} className="inline mr-1" />
                  This may take 10–20 seconds — AI is crafting your perfect trip
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
