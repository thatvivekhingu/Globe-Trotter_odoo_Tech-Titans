/**
 * AiBudgetInsights — AI budget analysis panel for the Budget page
 */
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { getAiBudgetInsights } from '../../lib/api/aiApi'
import type { BudgetInsight, BudgetOptimizerResponse } from '../../lib/api/aiApi'
import { getApiErrorMessage } from '../../lib/api/client'
import { Button } from '../ui/Button'

const STATUS_CONFIG: Record<
  BudgetInsight['status'],
  { icon: React.ReactNode; color: string; label: string }
> = {
  on_track: {
    icon: <CheckCircle2 size={15} />,
    color: 'text-sage',
    label: 'On track',
  },
  overspending: {
    icon: <TrendingUp size={15} />,
    color: 'text-clay',
    label: 'Overspending',
  },
  underspending: {
    icon: <TrendingDown size={15} />,
    color: 'text-ink/50',
    label: 'Underspending',
  },
  no_data: {
    icon: <AlertTriangle size={15} />,
    color: 'text-ink/30',
    label: 'No data',
  },
}

const HEALTH_CONFIG = {
  healthy: { color: 'bg-sage/15 border-sage/30 text-sage', label: 'Healthy' },
  warning: { color: 'bg-amber-50 border-amber-200 text-amber-700', label: 'Warning' },
  critical: { color: 'bg-clay/10 border-clay/30 text-clay', label: 'Critical' },
}

interface InsightCardProps {
  insight: BudgetInsight
}

function InsightCard({ insight }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false)
  const config = STATUS_CONFIG[insight.status]
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={config.color}>{config.icon}</span>
            <p className="text-sm font-semibold text-ink capitalize">{insight.category}</p>
            <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
          </div>
          <p className="mt-1.5 text-xs text-ink/65 leading-relaxed">{insight.message}</p>
          {insight.suggested_adjustment && (
            <p className="mt-1 text-xs font-medium text-ink/50">
              Suggested: ₹{Number(insight.suggested_adjustment).toLocaleString()}
            </p>
          )}
        </div>
        {insight.saving_tip && (
          <button
            onClick={() => setExpanded((o) => !o)}
            aria-label={expanded ? 'Hide tip' : 'Show saving tip'}
            className="shrink-0 rounded-full p-1 text-ink/30 hover:text-ink"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        )}
      </div>
      {expanded && insight.saving_tip && (
        <div className="mt-3 rounded-lg border border-sage/20 bg-sage/5 px-3 py-2.5">
          <p className="text-xs text-ink/70 leading-relaxed">
            💡 {insight.saving_tip}
          </p>
        </div>
      )}
    </div>
  )
}

interface AiBudgetInsightsProps {
  tripId: number
}

export function AiBudgetInsights({ tripId }: AiBudgetInsightsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BudgetOptimizerResponse | null>(null)
  const [open, setOpen] = useState(false)

  async function fetchInsights() {
    if (result) {
      setOpen((o) => !o)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getAiBudgetInsights(tripId)
      setResult(data)
      setOpen(true)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load AI budget insights.'))
    } finally {
      setLoading(false)
    }
  }

  const healthConfig = result ? HEALTH_CONFIG[result.overall_health] : null

  return (
    <div className="rounded-2xl border border-line bg-parchment overflow-hidden">
      {/* Trigger header */}
      <button
        id="ai-budget-insights-trigger"
        onClick={() => { void fetchInsights() }}
        disabled={loading}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 hover:bg-parchment/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-ink text-parchment">
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              {loading ? 'Analysing your budget…' : 'AI Budget Analysis'}
            </p>
            <p className="text-xs text-ink/50">
              {result ? result.headline : 'Get personalised saving tips from AI'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {result && healthConfig && (
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${healthConfig.color}`}>
              {healthConfig.label}
            </span>
          )}
          {result && (
            open ? <ChevronUp size={16} className="text-ink/40" /> : <ChevronDown size={16} className="text-ink/40" />
          )}
        </div>
      </button>

      {/* Expanded insights */}
      {open && result && (
        <div className="border-t border-line px-5 py-5 space-y-5">
          {/* Summary */}
          <div className="rounded-xl bg-ink p-4 text-parchment">
            <div className="flex items-start gap-3">
              <Wallet size={17} className="mt-0.5 shrink-0 text-sage" />
              <p className="text-sm leading-relaxed">{result.summary}</p>
            </div>
            {result.reallocation_advice && (
              <p className="mt-3 border-t border-parchment/10 pt-3 text-xs text-parchment/60 leading-relaxed">
                {result.reallocation_advice}
              </p>
            )}
          </div>

          {/* Category insights */}
          <div>
            <p className="text-xs font-semibold text-ink/60 mb-3">Category analysis</p>
            <div className="space-y-2.5">
              {result.insights.map((insight) => (
                <InsightCard key={insight.category} insight={insight} />
              ))}
            </div>
          </div>

          {/* Top savings */}
          {result.top_saving_opportunities.length > 0 && (
            <div className="rounded-xl border border-sage/30 bg-sage/5 p-4">
              <p className="text-sm font-semibold text-ink mb-3">
                🎯 Top saving opportunities
              </p>
              <ul className="space-y-2">
                {result.top_saving_opportunities.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-ink/70">
                    <span className="mt-1 size-1.5 rounded-full bg-sage shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setResult(null); void fetchInsights() }}
            icon={<Sparkles size={13} />}
          >
            Refresh analysis
          </Button>
        </div>
      )}

      {error && (
        <p className="border-t border-line px-5 py-3 text-xs text-clay">{error}</p>
      )}
    </div>
  )
}
