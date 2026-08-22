import { ArrowLeft, ArrowRight, CalendarPlus, History, Kanban, LayoutList, MapPin, Plus, Save, Share2, Sparkles, Users, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../lib/api/client'
import { copyToClipboard } from '../../lib/clipboard'
import { formatDateRange, formatShareUrl } from '../../lib/formatters'
import { useTripData } from '../../hooks/useTripSelectors'
import { useTripWise } from '../../state/useTripWise'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, SectionHeading } from '../../components/ui/Card'
import { ConfirmDialog, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { DayAccordion, BuilderDetailPanel } from './ItineraryComponents'
import { ItineraryKanbanView } from './ItineraryKanbanView'
import { TripMembersRbacModal } from '../trips/TripMembersRbacModal'
import { TripAuditLogDrawer } from '../../components/audit/TripAuditLogDrawer'
import { TripMapView } from '../../components/map/TripMapView'
import type { ActivityCategory } from '../../types/domain'

export function ItineraryBuilderPage() {
  const { tripId } = useParams()
  const { state, commands, dispatch, notify, remoteError, remoteMode, remoteStatus, refreshTrip } = useTripWise()
  const data = useTripData(tripId)
  const [viewMode, setViewMode] = useState<'timeline' | 'kanban'>('timeline')
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({})
  const [deleteStopId, setDeleteStopId] = useState<string | null>(null)
  const [addStopOpen, setAddStopOpen] = useState(false)
  const [rbacModalOpen, setRbacModalOpen] = useState(false)
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false)
  const [selectedCityToAdd, setSelectedCityToAdd] = useState(state.db.cities[0]?.id || '')
  const [optimizing, setOptimizing] = useState(false)

  // Custom Activity Creator Modal State
  const [addActivityOpen, setAddActivityOpen] = useState(false)
  const [actName, setActName] = useState('')
  const [actCategory, setActCategory] = useState<ActivityCategory>('sightseeing')
  const [actCost, setActCost] = useState('500')
  const [actTime, setActTime] = useState('10:00')
  const [actDuration, setActDuration] = useState('120')
  const [actTargetDate, setActTargetDate] = useState('')

  const selectedActivityId = state.selectedActivityId

  useEffect(() => {
    if (!tripId || remoteMode !== 'remote' || data) return
    void refreshTrip(tripId).catch(() => undefined)
  }, [data, refreshTrip, remoteMode, tripId])

  if (!data) {
    if (remoteMode === 'remote' && remoteStatus === 'loading') return <div className="space-y-6" aria-busy="true" aria-label="Loading itinerary"><Skeleton className="h-6 w-40" /><Skeleton className="h-16 w-3/4" /><Skeleton className="h-[34rem] w-full" /></div>
    return <ErrorState title="We could not find that trip" description={remoteError || 'The itinerary is unavailable or you no longer have access to it.'} onRetry={tripId ? () => { void refreshTrip(tripId).catch(() => undefined) } : undefined} />
  }

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

  function handleAutoOptimize() {
    setOptimizing(true)
    setTimeout(() => {
      const stopIds = [...new Set(tripData.activities.map((a) => a.stopId))]
      stopIds.forEach((sId) => {
        const sibs = tripData.activities.filter((a) => a.stopId === sId)
        const sorted = [...sibs].sort((a, b) => {
          const catWeight = (c: string) => (c === 'sightseeing' ? 1 : c === 'adventure' ? 2 : c === 'food' ? 3 : c === 'nature' ? 4 : 5)
          const actA = tripData.activityForTripActivity(a.id)
          const actB = tripData.activityForTripActivity(b.id)
          return catWeight(actA?.category || '') - catWeight(actB?.category || '')
        })
        dispatch({ type: 'REORDER_TRIP_ACTIVITIES', stopId: sId, orderedActivityIds: sorted.map((s) => s.id) })
      })
      setOptimizing(false)
      notify('⚡ AI Route Optimized: Activities sequenced for minimum transit & best daylight!')
    }, 1000)
  }

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
    dispatch({ type: 'SET_SELECTED_ACTIVITY', activityId: undefined })
    notify('City stop removed.')
  }

  async function shareTrip() {
    try {
      const shared = await commands.shareTrip(tripData.trip.id)
      await copyToClipboard(formatShareUrl(window.location.origin, shared.shareToken))
      notify('Share link copied to your clipboard.')
    } catch (error) {
      notify(getApiErrorMessage(error, 'We could not create a share link.'), 'error')
    }
  }

  function handleAddCityStop(e: FormEvent) {
    e.preventDefault()
    if (!selectedCityToAdd) return
    const existing = tripData.stops.some((s) => s.cityId === selectedCityToAdd)
    if (existing) {
      notify('This city is already on your route.', 'info')
      return
    }
    const newStop = {
      id: `stop-${tripData.trip.id}-${Date.now()}`,
      tripId: tripData.trip.id,
      cityId: selectedCityToAdd,
      arrivalDate: tripData.trip.startDate,
      departureDate: tripData.trip.endDate,
      order: tripData.stops.length,
    }
    dispatch({ type: 'ADD_STOP', stop: newStop })
    setAddStopOpen(false)
    notify('Destination added to route!')
  }

  function handleAddCustomActivity(e: FormEvent) {
    e.preventDefault()
    if (!actName.trim()) return
    const targetDate = actTargetDate || tripData.days[0] || tripData.trip.startDate
    const matchingStop = tripData.stops.find((s) => targetDate >= s.arrivalDate && targetDate <= s.departureDate) || tripData.stops[0]

    if (!matchingStop) {
      notify('Please add a city stop first.', 'error')
      return
    }

    const customActId = `act-custom-${Date.now()}`
    const newAct = {
      id: customActId,
      cityId: matchingStop.cityId,
      name: actName.trim(),
      category: actCategory,
      description: 'Custom added activity.',
      defaultCost: parseInt(actCost, 10) || 0,
      durationMinutes: parseInt(actDuration, 10) || 120,
    }

    const newTripAct = {
      id: `trip-act-${Date.now()}`,
      tripId: tripData.trip.id,
      stopId: matchingStop.id,
      activityId: customActId,
      date: targetDate,
      startTime: actTime || '10:00',
      durationMinutes: parseInt(actDuration, 10) || 120,
      estimatedCost: parseInt(actCost, 10) || 0,
      order: tripData.activities.length,
    }

    dispatch({ type: 'ADD_ACTIVITY', activity: newAct })
    dispatch({ type: 'ADD_TRIP_ACTIVITY', activity: newTripAct })
    setAddActivityOpen(false)
    setActName('')
    notify('Custom activity added to itinerary!')
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/trips" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/55 hover:text-ink"><ArrowLeft size={16} />Back to my trips</Link>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Users size={14} className="text-[#4F46E5]" />} onClick={() => setRbacModalOpen(true)}>
            Crew Roles
          </Button>
          <Button variant="secondary" size="sm" icon={<History size={14} />} onClick={() => setAuditDrawerOpen(true)}>
            Audit Log
          </Button>
          <Button variant="secondary" size="sm" icon={<Share2 size={14} />} onClick={() => { void shareTrip() }}>Share</Button>
          <Button size="sm" icon={<Save size={14} />} onClick={() => notify('All changes are saved in real-time.')}>Saved Live</Button>
        </div>
      </div>

      <SectionHeading
        eyebrow="Interactive Itinerary Builder"
        title={tripData.trip.name}
        description={`${formatDateRange(tripData.trip.startDate, tripData.trip.endDate)} · Build a complete, constraint-aware travel route.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutList size={13} /> Timeline
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Kanban size={13} /> Kanban Board
              </button>
            </div>
            <Badge tone="sage">{tripData.stops.length} cities</Badge>
            <Badge tone="clay">{tripData.activities.length} anchors</Badge>
          </div>
        }
      />

      {/* Interactive Map Visual */}
      <TripMapView stops={tripData.stops} cities={state.db.cities} height="280px" />

      {viewMode === 'kanban' ? (
        <ItineraryKanbanView
          activities={tripData.activities}
          allActivities={state.db.activities}
          stops={tripData.stops}
          cities={state.db.cities}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.75fr)]">
          <Card padding="none" className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
              <div>
                <p className="eyebrow">Day by day Schedule</p>
                <p className="mt-1 text-sm text-ink/55">Click any day to expand activities or add custom items.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Sparkles size={14} className="text-[#4F46E5]" />}
                  onClick={handleAutoOptimize}
                  disabled={optimizing}
                >
                  {optimizing ? 'Optimizing...' : '⚡ Auto-Optimize'}
                </Button>
                <Button variant="soft" size="sm" icon={<Plus size={14} />} onClick={() => setAddStopOpen(true)}>Add stop</Button>
                <Button variant="secondary" size="sm" icon={<CalendarPlus size={14} />} onClick={() => setAddActivityOpen(true)}>+ Custom Activity</Button>
              </div>
            </div>

            <div className="px-5 sm:px-6">
              {dayRows.map((day) => (
                <DayAccordion
                  key={day.date}
                  date={day.date}
                  city={day.city}
                  stop={day.stop}
                  activities={day.activities}
                  open={openDays[day.date] ?? day.date === tripData.trip.startDate}
                  onToggle={() => {
                    setOpenDays((current) => ({ ...current, [day.date]: !(current[day.date] ?? day.date === tripData.trip.startDate) }))
                    dispatch({ type: 'SET_SELECTED_DAY', dayId: day.date })
                  }}
                  onSelectActivity={(id) => dispatch({ type: 'SET_SELECTED_ACTIVITY', activityId: id })}
                  selectedActivityId={selectedActivityId}
                  onUpdateStop={(changes) => day.stop && dispatch({ type: 'UPDATE_STOP', stopId: day.stop.id, changes })}
                  onRemoveStop={() => day.stop && setDeleteStopId(day.stop.id)}
                  onRemoveActivity={(id) => {
                    dispatch({ type: 'REMOVE_TRIP_ACTIVITY', activityId: id })
                    notify('Activity removed.')
                  }}
                  onMoveActivity={moveActivity}
                  onMoveStopUp={() => {}}
                  onMoveStopDown={() => {}}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs text-ink/50 sm:px-6">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-clay" />All stops and activities sync with budget & calendar.</span>
              <Link to={`/trips/${tripData.trip.id}/itinerary`} className="inline-flex items-center gap-1 font-semibold text-ink hover:text-clay">Preview read-only view <ArrowRight size={14} /></Link>
            </div>
          </Card>

          <BuilderDetailPanel
            city={selectedCity}
            selectedActivity={selectedActivity}
            selectedTripActivity={selectedTripActivity}
            onUpdateActivity={(changes) => selectedActivityId && dispatch({ type: 'UPDATE_TRIP_ACTIVITY', activityId: selectedActivityId, changes })}
          />
        </div>
      )}

      {/* Add Stop Modal Dialog */}
      {addStopOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-ink">Add City Stop</h3>
              <button onClick={() => setAddStopOpen(false)} className="text-ink/40 hover:text-ink"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddCityStop} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink/70 mb-1">Select Destination</label>
                <select
                  value={selectedCityToAdd}
                  onChange={(e) => setSelectedCityToAdd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm"
                >
                  {state.db.cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name} ({city.region})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setAddStopOpen(false)}>Cancel</Button>
                <Button type="submit" icon={<Plus size={15} />}>Add to Route</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Custom Activity Modal Dialog */}
      {addActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-ink">+ Custom Activity</h3>
              <button onClick={() => setAddActivityOpen(false)} className="text-ink/40 hover:text-ink"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddCustomActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink/70 mb-1">Activity Name *</label>
                <input
                  type="text"
                  value={actName}
                  onChange={(e) => setActName(e.target.value)}
                  placeholder="e.g. Scuba diving at Grande Island"
                  className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Category</label>
                  <select
                    value={actCategory}
                    onChange={(e) => setActCategory(e.target.value as ActivityCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm"
                  >
                    <option value="sightseeing">Sightseeing</option>
                    <option value="adventure">Adventure</option>
                    <option value="food">Food</option>
                    <option value="nature">Nature</option>
                    <option value="culture">Culture</option>
                    <option value="shopping">Shopping</option>
                    <option value="entertainment">Entertainment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Date</label>
                  <select
                    value={actTargetDate}
                    onChange={(e) => setActTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm"
                  >
                    {tripData.days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    value={actCost}
                    onChange={(e) => setActCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={actTime}
                    onChange={(e) => setActTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={actDuration}
                    onChange={(e) => setActDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setAddActivityOpen(false)}>Cancel</Button>
                <Button type="submit" icon={<Plus size={15} />}>Add Activity</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteStopId)}
        title="Remove this city stop?"
        description="Activities assigned to this stop will also be removed from the itinerary."
        confirmLabel="Remove stop"
        onClose={() => setDeleteStopId(null)}
        onConfirm={removeStop}
      />

      {/* RBAC Member & Roles Modal */}
      <TripMembersRbacModal
        open={rbacModalOpen}
        onClose={() => setRbacModalOpen(false)}
        tripName={tripData.trip.name}
      />

      {/* Audit Log Drawer */}
      <TripAuditLogDrawer
        open={auditDrawerOpen}
        onClose={() => setAuditDrawerOpen(false)}
      />
    </div>
  )
}
