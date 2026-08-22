import { CalendarDays, Clock3, List, MapPin, Route, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { useTripData } from '../../hooks/useTripSelectors'
import { useTripWise } from '../../state/useTripWise'
import { formatCategoryLabel, formatCurrency, formatDateRange, formatLongDate, formatTime } from '../../lib/formatters'
import type { CalendarEvent, CalendarViewMode } from '../../types/domain'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, SectionHeading } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/Feedback'
import { SegmentedControl } from '../../components/ui/SegmentedControl'

const emptyEvents: CalendarEvent[] = []

const viewOptions = [
  { value: 'calendar' as const, label: 'Calendar', icon: <CalendarDays size={14} /> },
  { value: 'list' as const, label: 'List', icon: <List size={14} /> },
  { value: 'timeline' as const, label: 'Timeline', icon: <Route size={14} /> },
]

export function CalendarPage() {
  const { tripId } = useParams()
  const { state, setCalendarView } = useTripWise()
  const data = useTripData(tripId)
  const events = data ? data.calendarEvents : emptyEvents
  const activeView = state.activeCalendarView
  const eventsByDate = [...events].sort((a, b) => a.start.localeCompare(b.start))
  if (!data) return <EmptyState title="Calendar not found" description="We could not find a trip for this calendar view." action={<Button asChild><Link to="/trips">Back to my trips</Link></Button>} />

  return (
    <div className="space-y-8"><SectionHeading eyebrow="See the rhythm" title="Calendar & timeline" description={`${data.trip.name} · ${formatDateRange(data.trip.startDate, data.trip.endDate)}`} action={<SegmentedControl<CalendarViewMode> value={activeView} options={viewOptions} onChange={setCalendarView} label="Calendar display mode" />} />{activeView === 'calendar' ? <Card className="bg-white/60"><div className="tripwise-calendar"><FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" initialDate={data.trip.startDate} headerToolbar={{ left: 'title', center: '', right: 'prev,next today' }} events={events.map((event) => ({ id: event.id, title: event.title, start: event.start, backgroundColor: event.category === 'adventure' ? '#A45A52' : '#85B09A', borderColor: 'transparent', textColor: '#2A3439' }))} height="auto" dayMaxEvents={3} /></div></Card> : null}{activeView === 'list' ? <ListView data={eventsByDate} /> : null}{activeView === 'timeline' ? <TimelineView data={eventsByDate} /> : null}{!events.length ? <EmptyState icon={<Sparkles size={26} />} title="No events planned" description="Add a few activities to give this trip a shape. The blank spaces are yours to keep." action={<Button asChild><Link to="/discover/activities">Find activities</Link></Button>} /> : null}</div>
  )
}

function ListView({ data }: { data: CalendarEvent[] }) {
  return <Card padding="none" className="overflow-hidden">{data.map((event) => <div key={event.id} className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-4 last:border-b-0 sm:px-6"><div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sage/25 text-ink"><Clock3 size={17} /></div><div className="min-w-0 flex-1"><h3 className="truncate font-semibold text-sm text-ink">{event.title}</h3><p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink/50"><span>{formatLongDate(event.start.slice(0, 10))}</span><span className="flex items-center gap-1"><Clock3 size={12} />{formatTime(event.start.slice(11, 16))}</span><span className="flex items-center gap-1"><MapPin size={12} />{event.cityName}</span></p></div><div className="flex items-center gap-3"><Badge>{formatCategoryLabel(event.category)}</Badge><span className="text-xs font-semibold text-ink/60">{event.cost ? formatCurrency(event.cost) : 'Free'}</span></div></div>)}</Card>
}

function TimelineView({ data }: { data: CalendarEvent[] }) {
  return <Card><div className="relative ml-2 border-l border-line pl-7">{data.map((event) => <div key={event.id} className="relative border-b border-line pb-6 pt-1 last:border-b-0 last:pb-1"><span className="absolute -left-[2.05rem] top-1.5 size-3 rounded-full border-4 border-parchment bg-clay" /><p className="eyebrow">{formatLongDate(event.start.slice(0, 10))} · {formatTime(event.start.slice(11, 16))}</p><h3 className="mt-2 font-display text-2xl text-ink">{event.title}</h3><p className="mt-1 flex items-center gap-1 text-xs text-ink/50"><MapPin size={12} />{event.cityName} · {formatCategoryLabel(event.category)} · {event.cost ? formatCurrency(event.cost) : 'Free'}</p></div>)}</div></Card>
}
