import { ArrowLeft, ArrowRight, CalendarPlus, MapPin, Plus, Save, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTripData } from '../../hooks/useTripSelectors'
import { useTripWise } from '../../state/useTripWise'
import { formatDateRange } from '../../lib/formatters'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, SectionHeading } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/Feedback'
import { DayAccordion, BuilderDetailPanel } from './ItineraryComponents'

export function ItineraryBuilderPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { state, dispatch, notify } = useTripWise()
  const data = useTripData(tripId)
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({})
  const [deleteStopId, setDeleteStopId] = useState<string | null>(null)
  const selectedActivityId = state.selectedActivityId

  if (!data) return <Card><p className="text-sm text-ink/60">We could not find that trip.</p></Card>
  const tripData = data
  const dayRows = tripData.days.map((date) => {
    const stop = tripData.stops.find((item) => date >= item.arrivalDate && date <= item.departureDate)
    const city = stop ? tripData.cityForStop(stop.id) : undefined
    const activities = tripData.activities
      .filter((item) => item.date === date)
      .map((tripActivity) => ({ tripActivity, activity: tripData.activityForTripActivity(tripActivity.id) }))
      .filter((item): item is { tripActivity: typeof item.tripActivity; activity: NonNullable<typeof item.activity> } => Boolean(item.activity))
    return { date, stop, city, activities }
  })
  const selectedTripActivity = tripData.activities.find((item) => item.id === selectedActivityId)
  const selectedActivity = selectedTripActivity ? tripData.activityForTripActivity(selectedTripActivity.id) : undefined
  const selectedCity = selectedTripActivity ? tripData.cityForStop(selectedTripActivity.stopId) : dayRows.find((day) => day.date === state.selectedDayId)?.city

  function moveActivity(id: string, direction: 'up' | 'down') {
    const activity = tripData.activities.find((item) => item.id === id)
    if (!activity) return
    const siblings = tripData.activities.filter((item) => item.stopId === activity.stopId).sort((a, b) => a.order - b.order)
    const index = siblings.findIndex((item) => item.id === id)
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= siblings.length) return
    const reordered = [...siblings]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)
    dispatch({ type: 'REORDER_TRIP_ACTIVITIES', stopId: activity.stopId, orderedActivityIds: reordered.map((item) => item.id) })
  }

  function removeStop() {
    if (!deleteStopId) return
    dispatch({ type: 'REMOVE_STOP', stopId: deleteStopId })
    setDeleteStopId(null)
    notify('City stop removed.')
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/trips" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/55 hover:text-ink"><ArrowLeft size={16} />Back to my trips</Link>
        <div className="flex items-center gap-2"><Button variant="secondary" size="sm" icon={<Share2 size={15} />} onClick={() => notify('Share link ready to copy.')}>Share</Button><Button size="sm" icon={<Save size={15} />} onClick={() => notify('Changes saved to this demo trip.')}>Save changes</Button></div>
      </div>
      <SectionHeading eyebrow="Shape the days" title={tripData.trip.name} description={`${formatDateRange(tripData.trip.startDate, tripData.trip.endDate)} · Build a route that feels like yours.`} action={<div className="flex items-center gap-2"><Badge tone="sage">{tripData.stops.length} cities</Badge><Badge>{tripData.activities.length} anchors</Badge></div>} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.75fr)]">
        <Card padding="none" className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6"><div><p className="eyebrow">Day by day</p><p className="mt-1 text-sm text-ink/55">Click a day to make edits and keep the rhythm visible.</p></div><div className="flex gap-2"><Button variant="soft" size="sm" icon={<Plus size={14} />} onClick={() => navigate('/discover/cities')}>Add stop</Button><Button variant="secondary" size="sm" icon={<CalendarPlus size={14} />} onClick={() => navigate('/discover/activities')}>Add activity</Button></div></div>
          <div className="px-5 sm:px-6">
            {dayRows.map((day) => <DayAccordion key={day.date} date={day.date} city={day.city} stop={day.stop} activities={day.activities} open={openDays[day.date] ?? day.date === tripData.trip.startDate} onToggle={() => { setOpenDays((current) => ({ ...current, [day.date]: !(current[day.date] ?? day.date === tripData.trip.startDate) })); dispatch({ type: 'SET_SELECTED_DAY', dayId: day.date }) }} onSelectActivity={(id) => dispatch({ type: 'SET_SELECTED_ACTIVITY', activityId: id })} selectedActivityId={selectedActivityId} onUpdateStop={(changes) => day.stop && dispatch({ type: 'UPDATE_STOP', stopId: day.stop.id, changes })} onRemoveStop={() => day.stop && setDeleteStopId(day.stop.id)} onRemoveActivity={(id) => { dispatch({ type: 'REMOVE_TRIP_ACTIVITY', activityId: id }); notify('Activity removed.') }} onMoveActivity={moveActivity} />)}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs text-ink/50 sm:px-6"><span className="flex items-center gap-1.5"><MapPin size={14} className="text-clay" />Drag-and-drop can come after the route feels right.</span><Link to={`/trips/${tripData.trip.id}/itinerary`} className="inline-flex items-center gap-1 font-semibold text-ink hover:text-clay">Preview itinerary <ArrowRight size={14} /></Link></div>
        </Card>
        <BuilderDetailPanel city={selectedCity} selectedActivity={selectedActivity} selectedTripActivity={selectedTripActivity} onUpdateActivity={(changes) => selectedActivityId && dispatch({ type: 'UPDATE_TRIP_ACTIVITY', activityId: selectedActivityId, changes })} />
      </div>
      <ConfirmDialog open={Boolean(deleteStopId)} title="Remove this city stop?" description="Activities assigned to this stop will also be removed from the demo itinerary." confirmLabel="Remove stop" onClose={() => setDeleteStopId(null)} onConfirm={removeStop} />
    </div>
  )
}
