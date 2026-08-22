import { BedDouble, Camera, ChevronDown, ChevronUp, CirclePlus, Clock3, MapPin, MoreHorizontal, Trash2, Utensils, Waves } from 'lucide-react'
import { useState } from 'react'
import type { Activity, City, TripActivity, TripStop } from '../../types/domain'
import { formatCategoryLabel, formatCurrency, formatDuration, formatLongDate, formatTime } from '../../lib/formatters'
import { Badge } from '../../components/ui/Badge'
import { IconButton } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DateInput, Field, TextInput } from '../../components/ui/Field'
import { ActivityVoteButton } from './ActivityVoteButton'

interface ActivityRowProps {
  tripActivity: TripActivity
  activity: Activity
  selected: boolean
  onSelect: () => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

const categoryIcons = {
  sightseeing: Camera,
  food: Utensils,
  adventure: Waves,
  nature: Waves,
  shopping: MoreHorizontal,
  culture: Camera,
  entertainment: MoreHorizontal,
}

export function ActivityRow({ tripActivity, activity, selected, onSelect, onRemove, onMoveUp, onMoveDown }: ActivityRowProps) {
  const Icon = categoryIcons[activity.category]
  return (
    <div className={['group flex items-start gap-3 border-b border-line py-3 last:border-b-0', selected ? 'rounded-control bg-clay/5 px-3 -mx-3' : ''].join(' ')}>
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-start gap-3 text-left outline-none"><span className={['mt-1 flex size-7 shrink-0 items-center justify-center rounded-full', selected ? 'bg-clay text-white' : 'bg-sage/30 text-ink/60'].join(' ')}><Icon size={14} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="font-semibold text-sm text-ink">{activity.name}</span><Badge>{formatCategoryLabel(activity.category)}</Badge></span><span className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink/50"><span className="flex items-center gap-1"><Clock3 size={12} />{formatTime(tripActivity.startTime)}</span><span>{formatDuration(tripActivity.durationMinutes)}</span></span></span></button>
      <ActivityVoteButton activityId={activity.id} />
      <span className="shrink-0 pt-1 text-xs font-semibold text-ink/60">{tripActivity.estimatedCost ? formatCurrency(tripActivity.estimatedCost) : 'Free'}</span>
      <div className="hidden items-center gap-0.5 sm:flex"><IconButton label={`Move ${activity.name} up`} size="sm" onClick={onMoveUp}><ChevronUp size={14} /></IconButton><IconButton label={`Move ${activity.name} down`} size="sm" onClick={onMoveDown}><ChevronDown size={14} /></IconButton><IconButton label={`Remove ${activity.name}`} size="sm" onClick={onRemove}><Trash2 size={14} /></IconButton></div>
    </div>
  )
}

interface DayAccordionProps {
  date: string
  city?: City
  stop?: TripStop
  activities: Array<{ tripActivity: TripActivity; activity: Activity }>
  open: boolean
  onToggle: () => void
  onSelectActivity: (id: string) => void
  selectedActivityId?: string
  onUpdateStop: (changes: Partial<TripStop>) => void
  onRemoveStop: () => void
  onMoveStopUp: () => void
  onMoveStopDown: () => void
  onRemoveActivity: (id: string) => void
  onMoveActivity: (id: string, direction: 'up' | 'down') => void
}

export function DayAccordion({ date, city, stop, activities, open, onToggle, onSelectActivity, selectedActivityId, onUpdateStop, onRemoveStop, onMoveStopUp, onMoveStopDown, onRemoveActivity, onMoveActivity }: DayAccordionProps) {
  const panelId = `day-panel-${date}`
  return (
    <section className="border-b border-line last:border-b-0">
      <div className="flex items-center gap-1 py-5">
        <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={panelId} className="flex min-w-0 flex-1 items-center gap-4 text-left outline-none"><span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-control bg-ink text-parchment"><span className="text-[0.6rem] uppercase tracking-[0.1em] text-parchment/60">Day</span><span className="font-display text-lg leading-none">{date.slice(-2)}</span></span><span className="min-w-0 flex-1"><span className="block font-display text-2xl font-medium tracking-[-0.03em] text-ink">{city?.name || 'Open day'}</span><span className="mt-1 block text-xs text-ink/50">{formatLongDate(date)} · {activities.length} {activities.length === 1 ? 'anchor' : 'anchors'}</span></span><span className="flex items-center gap-2"><Badge tone={city ? 'sage' : 'neutral'}>{city ? 'Planned' : 'Unassigned'}</Badge>{open ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}</span></button>
        <div className="flex shrink-0 items-center gap-0.5"><IconButton label={`Move ${city?.name || 'city stop'} up`} size="sm" onClick={onMoveStopUp}><ChevronUp size={14} /></IconButton><IconButton label={`Move ${city?.name || 'city stop'} down`} size="sm" onClick={onMoveStopDown}><ChevronDown size={14} /></IconButton></div>
      </div>
      {open ? <div id={panelId} className="pb-5 pl-14"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs leading-5 text-ink/55">Keep the day open enough for the best unplanned moments.</p>{stop ? <button type="button" onClick={onRemoveStop} className="text-xs font-semibold text-clay hover:text-ink">Remove stop</button> : null}</div>{stop ? <div className="mb-4 grid gap-3 rounded-control border border-line bg-white/35 p-3 sm:grid-cols-2"><Field label="Arrival" htmlFor={`${stop.id}-arrival`}><DateInput id={`${stop.id}-arrival`} value={stop.arrivalDate} onChange={(event) => onUpdateStop({ arrivalDate: event.target.value })} className="min-h-9 py-2 text-xs" /></Field><Field label="Departure" htmlFor={`${stop.id}-departure`}><DateInput id={`${stop.id}-departure`} value={stop.departureDate} onChange={(event) => onUpdateStop({ departureDate: event.target.value })} className="min-h-9 py-2 text-xs" /></Field></div> : null}{activities.length ? <div className="relative pl-5 before:absolute before:bottom-4 before:left-[0.32rem] before:top-4 before:w-px before:bg-line">{activities.map(({ tripActivity, activity }) => <ActivityRow key={tripActivity.id} tripActivity={tripActivity} activity={activity} selected={tripActivity.id === selectedActivityId} onSelect={() => onSelectActivity(tripActivity.id)} onRemove={() => onRemoveActivity(tripActivity.id)} onMoveUp={() => onMoveActivity(tripActivity.id, 'up')} onMoveDown={() => onMoveActivity(tripActivity.id, 'down')} />)}</div> : <div className="rounded-control border border-dashed border-line px-4 py-5 text-center text-sm text-ink/50"><CirclePlus size={17} className="mx-auto mb-2 text-clay" />No activities planned yet.</div>}</div> : null}
    </section>
  )
}

interface BuilderDetailPanelProps {
  city?: City
  selectedActivity?: Activity
  selectedTripActivity?: TripActivity
  onUpdateActivity: (changes: Partial<TripActivity>) => void
}

export function BuilderDetailPanel({ city, selectedActivity, selectedTripActivity, onUpdateActivity }: BuilderDetailPanelProps) {
  const [draft, setDraft] = useState(() => ({
    date: selectedTripActivity?.date || '',
    startTime: selectedTripActivity?.startTime || '',
    estimatedCost: selectedTripActivity?.estimatedCost || 0,
  }))

  return (
    <Card padding="none" className="sticky top-24 overflow-hidden bg-white/58">
      <div className="relative h-52 overflow-hidden bg-[#dfe6dc]"><div className="absolute inset-0 opacity-80" style={{ backgroundImage: 'radial-gradient(circle at 24% 24%, #a45a52 0 4px, transparent 5px), radial-gradient(circle at 68% 43%, #a45a52 0 4px, transparent 5px), radial-gradient(circle at 52% 76%, #2a3439 0 4px, transparent 5px), linear-gradient(135deg, transparent 48%, rgb(42 52 57 / 0.12) 49% 50%, transparent 51%), linear-gradient(35deg, transparent 44%, rgb(42 52 57 / 0.1) 45% 46%, transparent 47%)' }} /><div className="absolute left-4 top-4 rounded-full bg-parchment/90 px-3 py-1.5 text-xs font-semibold text-ink"><MapPin size={13} className="mr-1 inline text-clay" />Route preview</div><div className="absolute bottom-4 left-4 text-xs font-semibold text-ink/60">{city?.name || 'Select a day to explore'}</div></div>
      <div className="p-5 sm:p-6">{selectedActivity && selectedTripActivity ? <><p className="eyebrow">Selected anchor</p><h2 className="mt-2 font-display text-3xl font-medium leading-none tracking-[-0.04em] text-ink">{selectedActivity.name}</h2><p className="body-copy mt-3 text-sm">{selectedActivity.description}</p><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><Field label="Date" htmlFor="selected-date"><TextInput id="selected-date" type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} onBlur={() => onUpdateActivity({ date: draft.date })} /></Field><Field label="Start time" htmlFor="selected-time"><TextInput id="selected-time" type="time" value={draft.startTime} onChange={(event) => setDraft((current) => ({ ...current, startTime: event.target.value }))} onBlur={() => onUpdateActivity({ startTime: draft.startTime })} /></Field><Field label="Estimated cost" htmlFor="selected-cost"><TextInput id="selected-cost" type="number" min="0" value={draft.estimatedCost} onChange={(event) => setDraft((current) => ({ ...current, estimatedCost: Number(event.target.value) || 0 }))} onBlur={() => onUpdateActivity({ estimatedCost: draft.estimatedCost })} /></Field></div></> : <div className="py-6 text-center"><BedDouble size={24} className="mx-auto text-clay" /><h2 className="mt-3 font-display text-2xl font-medium text-ink">Choose a day or activity</h2><p className="body-copy mt-2 text-sm">Your selected details will appear here for a quick edit.</p></div>}</div>
    </Card>
  )
}
