import { Clock3, MapPin, Plus, Check } from 'lucide-react'
import type { Activity, City } from '../../types/domain'
import { formatCategoryLabel, formatCurrency, formatDuration } from '../../lib/formatters'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ImageWithFallback } from '../../components/ui/ImageWithFallback'

interface ActivityResultCardProps {
  activity: Activity
  city?: City
  added: boolean
  onAdd: () => void
}

export function ActivityResultCard({ activity, city, added, onAdd }: ActivityResultCardProps) {
  return (
    <Card interactive padding="none" className="group break-inside-avoid overflow-hidden">
      <div className="relative aspect-[1.35/1] overflow-hidden bg-ink/5"><ImageWithFallback src={activity.imageUrl} alt={activity.imageAlt || activity.name} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" fallbackClassName="size-full" /><div className="absolute left-3 top-3"><Badge tone={activity.category === 'adventure' ? 'clay' : 'sage'}>{formatCategoryLabel(activity.category)}</Badge></div></div>
      <div className="p-4 sm:p-5"><h3 className="font-display text-2xl font-medium tracking-[-0.035em] text-ink">{activity.name}</h3><p className="mt-2 flex items-center gap-1 text-xs text-ink/50"><MapPin size={12} />{city?.name || 'TripWise discovery'}</p><p className="mt-3 line-clamp-2 text-sm leading-6 text-ink/60">{activity.description}</p><div className="mt-4 flex items-center justify-between gap-3 text-xs text-ink/55"><span className="flex items-center gap-1"><Clock3 size={13} />{formatDuration(activity.durationMinutes)}</span><span className="font-semibold text-ink">{activity.defaultCost ? formatCurrency(activity.defaultCost) : 'Free'}</span></div><Button className="mt-5 w-full" variant={added ? 'soft' : 'primary'} size="sm" icon={added ? <Check size={14} /> : <Plus size={14} />} onClick={onAdd}>{added ? 'Added to itinerary' : 'Add activity'}</Button></div>
    </Card>
  )
}
