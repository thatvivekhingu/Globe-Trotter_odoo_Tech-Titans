import { CalendarDays, ChevronRight, MoreHorizontal, Pencil, Share2, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Trip } from '../../types/domain'
import { formatCurrency, formatDateRange, formatStatusLabel } from '../../lib/formatters'
import { Badge } from '../../components/ui/Badge'
import { Button, IconButton } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ImageWithFallback } from '../../components/ui/ImageWithFallback'

interface TripCardProps {
  trip: Trip
  stopCount: number
  activityCount: number
  total: number
  onDelete: () => void
  onShare: () => void
}

export function TripCard({ trip, stopCount, activityCount, total, onDelete, onShare }: TripCardProps) {
  return (
    <Card interactive padding="none" className="group overflow-hidden">
      <div className="relative aspect-[1.7/1] overflow-hidden bg-ink/5">
        <ImageWithFallback src={trip.coverImageUrl} alt={`${trip.name} cover image`} className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" fallbackClassName="size-full" />
        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3"><Badge tone={trip.status === 'upcoming' ? 'sage' : trip.status === 'completed' ? 'ink' : 'neutral'}>{formatStatusLabel(trip.status)}</Badge><IconButton label={`More actions for ${trip.name}`} size="sm" variant="secondary"><MoreHorizontal size={16} /></IconButton></div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4"><div className="min-w-0"><h3 className="truncate font-display text-2xl font-medium tracking-[-0.035em] text-ink">{trip.name}</h3><p className="mt-2 flex items-center gap-1.5 text-xs text-ink/55"><CalendarDays size={14} />{formatDateRange(trip.startDate, trip.endDate)}</p></div><p className="shrink-0 text-sm font-semibold text-ink">{formatCurrency(total > 0 ? total : (trip.budgetLimit || 45000))}</p></div>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-ink/60">{trip.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4"><span className="text-xs text-ink/50">{stopCount} cities · {activityCount} planned</span><div className="flex items-center gap-1"><IconButton label={`Edit ${trip.name}`} size="sm" asChild><Link to={`/trips/${trip.id}/builder`}><Pencil size={15} /></Link></IconButton><IconButton label={`Share ${trip.name}`} size="sm" onClick={onShare}><Share2 size={15} /></IconButton><IconButton label={`Delete ${trip.name}`} size="sm" onClick={onDelete}><Trash2 size={15} /></IconButton><Button size="sm" variant="ghost" icon={<ChevronRight size={15} />} asChild><Link to={`/trips/${trip.id}/itinerary`}>View</Link></Button></div></div>
      </div>
    </Card>
  )
}
