import { Filter, LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react'
import { Button, IconButton } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Select, TextInput } from '../../components/ui/Field'

interface DiscoveryToolbarProps {
  query: string
  onQueryChange: (value: string) => void
  queryPlaceholder: string
  filters: Array<{ label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }>
  onReset: () => void
  hasFilters: boolean
  view?: 'grid' | 'list'
  onViewChange?: (view: 'grid' | 'list') => void
}

export function DiscoveryToolbar({ query, onQueryChange, queryPlaceholder, filters, onReset, hasFilters, view = 'grid', onViewChange }: DiscoveryToolbarProps) {
  return (
    <Card padding="sm" className="space-y-3 bg-white/55">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center"><div className="relative min-w-0 flex-1"><Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" /><TextInput aria-label={queryPlaceholder} value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder={queryPlaceholder} className="pl-10" /></div><div className="flex items-center justify-between gap-2 lg:justify-end"><span className="flex items-center gap-2 text-xs font-semibold text-ink/55"><SlidersHorizontal size={15} />Refine</span>{onViewChange ? <div className="flex gap-1 rounded-control border border-line p-1"><IconButton label="Grid view" size="sm" variant={view === 'grid' ? 'secondary' : 'ghost'} onClick={() => onViewChange('grid')}><LayoutGrid size={15} /></IconButton><IconButton label="List view" size="sm" variant={view === 'list' ? 'secondary' : 'ghost'} onClick={() => onViewChange('list')}><List size={15} /></IconButton></div> : null}</div></div>
      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3"><span className="mr-1 inline-flex items-center gap-1 text-xs font-semibold text-ink/45"><Filter size={14} />Filters</span>{filters.map((filter) => <label key={filter.label} className="relative"><span className="sr-only">{filter.label}</span><Select aria-label={filter.label} value={filter.value} onChange={(event) => filter.onChange(event.target.value)} options={filter.options} className="min-h-9 min-w-32 py-2 pr-8 text-xs" /></label>)}{hasFilters ? <Button variant="ghost" size="sm" icon={<X size={14} />} onClick={onReset}>Clear filters</Button> : null}</div>
    </Card>
  )
}
