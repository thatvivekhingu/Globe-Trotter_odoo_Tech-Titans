/**
 * AiDestinationDiscovery — AI-powered personalised destination recommendations
 */
import {
  Globe,
  Loader2,
  MapPin,
  Sparkles,
  Star,
  Sun,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { getAiDestinations } from '../../lib/api/aiApi'
import type { ActivityCategory, DestinationRecommendation, DiscoveryResponse } from '../../lib/api/aiApi'
import { getApiErrorMessage } from '../../lib/api/client'
import { Button } from '../ui/Button'

const ALL_CATEGORIES: ActivityCategory[] = [
  'sightseeing', 'food', 'adventure', 'nature', 'shopping', 'culture', 'entertainment',
]

function MatchScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#85B09A' : score >= 60 ? '#D8A88F' : '#9EA6A5'
  return (
    <div className="relative flex size-12 items-center justify-center">
      <svg className="absolute inset-0" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="#E5E4E4" strokeWidth="4" />
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${(score / 100) * 125.6} 125.6`}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
        />
      </svg>
      <span className="text-xs font-bold text-ink">{score}</span>
    </div>
  )
}

function RecommendationCard({ rec }: { rec: DestinationRecommendation }) {
  return (
    <div className="group rounded-2xl border border-line bg-white p-5 transition-all hover:border-ink hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0 text-clay" />
            <h3 className="font-display text-base font-semibold text-ink">{rec.city}</h3>
            <span className="text-xs text-ink/40">{rec.country}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink/65">{rec.reason}</p>
        </div>
        <MatchScoreRing score={rec.match_score} />
      </div>

      {/* Highlights */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {rec.highlights.map((h) => (
          <span
            key={h}
            className="rounded-full border border-line px-2.5 py-0.5 text-[11px] font-medium text-ink/70"
          >
            {h}
          </span>
        ))}
      </div>

      {/* Meta row */}
      <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-3">
        <span className="flex items-center gap-1.5 text-[11px] text-ink/55">
          <Sun size={12} /> {rec.best_season}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-ink/55">
          <Wallet size={12} /> {rec.estimated_daily_budget}
        </span>
      </div>
    </div>
  )
}

interface AiDestinationDiscoveryProps {
  compact?: boolean
}

export function AiDestinationDiscovery({ compact = false }: AiDestinationDiscoveryProps) {
  const [budgetStyle, setBudgetStyle] = useState<'low' | 'medium' | 'high'>('medium')
  const [categories, setCategories] = useState<ActivityCategory[]>([])
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DiscoveryResponse | null>(null)

  function toggleCategory(cat: ActivityCategory) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  async function handleDiscover() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await getAiDestinations({
        budget_style: budgetStyle,
        preferred_categories: categories,
        count,
      })
      setResult(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load AI recommendations.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-ink text-parchment">
            <Globe size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">AI Destination Discovery</p>
            <p className="text-xs text-ink/50">Personalised recommendations based on your travel history</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      {!compact && (
        <div className="rounded-xl border border-line bg-parchment/50 p-4 space-y-4">
          {/* Budget style */}
          <div>
            <p className="text-xs font-semibold text-ink/70 mb-2">Budget preference</p>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBudgetStyle(b)}
                  className={[
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors capitalize',
                    budgetStyle === b
                      ? 'bg-ink text-parchment border-ink'
                      : 'bg-white text-ink/60 border-line hover:border-ink',
                  ].join(' ')}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="text-xs font-semibold text-ink/70 mb-2">Interests</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={[
                    'rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
                    categories.includes(cat)
                      ? 'bg-ink text-parchment border-ink'
                      : 'bg-white text-ink/60 border-line hover:border-ink',
                  ].join(' ')}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-ink/70">Number of suggestions</p>
            <select
              id="ai-discovery-count"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="rounded-control border border-line bg-white px-2 py-1 text-xs text-ink outline-none"
            >
              {[3, 5, 8, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <Button
        id="ai-discover-btn"
        onClick={() => { void handleDiscover() }}
        loading={loading}
        icon={loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
        className="w-full"
      >
        {loading ? 'Finding perfect destinations…' : 'Discover destinations for me'}
      </Button>

      {error && (
        <p className="rounded-xl border border-clay/30 bg-clay/5 px-3 py-2.5 text-xs text-clay">
          {error}
        </p>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Personalisation note */}
          <div className="flex items-start gap-2 rounded-xl bg-sage/10 px-4 py-3">
            <Star size={14} className="mt-0.5 shrink-0 text-sage" />
            <p className="text-xs text-ink/70 leading-relaxed">{result.personalization_summary}</p>
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {result.recommendations.map((rec) => (
              <RecommendationCard key={`${rec.city}-${rec.country}`} rec={rec} />
            ))}
          </div>

          <Button
            variant="secondary"
            onClick={() => { void handleDiscover() }}
            icon={<Sparkles size={13} />}
            className="w-full"
          >
            Refresh recommendations
          </Button>
        </div>
      )}
    </div>
  )
}
