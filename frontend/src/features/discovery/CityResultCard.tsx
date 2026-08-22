import { Bookmark, MapPin, Plus, Sparkles } from 'lucide-react'
import type { City } from '../../types/domain'
import { formatCostIndex } from '../../lib/formatters'
import { useTripWise } from '../../state/useTripWise'
import { Badge } from '../../components/ui/Badge'
import { Button, IconButton } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ImageWithFallback } from '../../components/ui/ImageWithFallback'

interface CityResultCardProps {
  city: City
  added: boolean
  saved: boolean
  onAdd: () => void
  onToggleSaved: () => void
  compact?: boolean
}

export function CityResultCard({ city, added, saved, onAdd, onToggleSaved, compact = false }: CityResultCardProps) {
  const { currentUser } = useTripWise()
  return (
    <Card interactive padding="none" className={['group break-inside-avoid overflow-hidden', compact ? 'flex items-center gap-3' : ''].join(' ')}>
      <div className={compact ? 'size-24 shrink-0 overflow-hidden' : 'relative aspect-[1.15/1] overflow-hidden'}><ImageWithFallback src={city.imageUrl} alt={city.imageAlt} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" fallbackClassName="size-full" />{!compact ? <div className="absolute inset-x-3 top-3 flex justify-between"><Badge tone="sage">{formatCostIndex(city.costIndex)}</Badge><IconButton label={saved ? `Remove ${city.name} from saved destinations` : `Save ${city.name}`} size="sm" variant="secondary" onClick={onToggleSaved}><Bookmark size={15} fill={saved ? 'currentColor' : 'none'} /></IconButton></div> : null}</div>
      <div className={compact ? 'min-w-0 flex-1 py-3 pr-3' : 'p-4 sm:p-5'}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-display text-2xl font-medium tracking-[-0.035em] text-ink">{city.name}</h3><p className="mt-1 flex items-center gap-1 text-xs text-ink/50"><MapPin size={12} />{city.region}, {city.country}</p></div>{compact ? <IconButton label={saved ? `Remove ${city.name} from saved destinations` : `Save ${city.name}`} size="sm" onClick={onToggleSaved}><Bookmark size={15} fill={saved ? 'currentColor' : 'none'} /></IconButton> : null}</div>{!compact ? <><div className="mt-4 flex items-center gap-2 text-xs text-ink/55"><Sparkles size={14} className="text-clay" />{city.popularity}% traveller interest</div><Button className="mt-5 w-full" variant={added ? 'soft' : 'primary'} size="sm" icon={added ? <Sparkles size={14} /> : <Plus size={14} />} onClick={onAdd}>{added ? 'Added to trip' : `Add ${currentUser?.name.split(' ')[0] ? 'to trip' : 'to a trip'}`}</Button></> : null}</div>
    </Card>
  )
}
