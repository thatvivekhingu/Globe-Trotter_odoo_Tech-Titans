import { useState } from 'react'
import { Clock, MapPin } from 'lucide-react'
import { formatCurrency } from '../../lib/formatters'
import type { Activity, TripActivity, TripStop } from '../../types/domain'

export type ActivityStage = 'planned' | 'booked' | 'in_progress' | 'completed'

interface KanbanItem {
  tripActivity: TripActivity
  activity?: Activity
  stop?: TripStop
  cityName: string
  stage: ActivityStage
}

const STAGES: { id: ActivityStage; title: string; color: string; bg: string; border: string }[] = [
  { id: 'planned', title: '💡 Planned / Ideas', color: 'text-amber-800', bg: 'bg-amber-50/70', border: 'border-amber-200' },
  { id: 'booked', title: '🎟️ Booked & Confirmed', color: 'text-indigo-800', bg: 'bg-indigo-50/70', border: 'border-indigo-200' },
  { id: 'in_progress', title: '🚀 In Progress / Today', color: 'text-emerald-800', bg: 'bg-emerald-50/70', border: 'border-emerald-200' },
  { id: 'completed', title: '✅ Visited & Done', color: 'text-slate-800', bg: 'bg-slate-100', border: 'border-slate-300' },
]

export function ItineraryKanbanView({
  activities,
  allActivities,
  stops,
  cities,
}: {
  activities: TripActivity[]
  allActivities: Activity[]
  stops: TripStop[]
  cities: { id: string; name: string }[]
}) {
  // Local state for interactive stage movements
  const [stagesMap, setStagesMap] = useState<Record<string, ActivityStage>>(() => {
    const initial: Record<string, ActivityStage> = {}
    activities.forEach((act, idx) => {
      if (idx === 0) initial[act.id] = 'in_progress'
      else if (idx === 1) initial[act.id] = 'booked'
      else if (idx % 3 === 0) initial[act.id] = 'completed'
      else initial[act.id] = 'planned'
    })
    return initial
  })

  function moveStage(actId: string, nextStage: ActivityStage) {
    setStagesMap((prev) => ({ ...prev, [actId]: nextStage }))
  }

  const items: KanbanItem[] = activities.map((ta) => {
    const act = allActivities.find((a) => a.id === ta.activityId)
    const stop = stops.find((s) => s.id === ta.stopId)
    const city = cities.find((c) => c.id === stop?.cityId)
    return {
      tripActivity: ta,
      activity: act,
      stop,
      cityName: city?.name || 'Destination',
      stage: stagesMap[ta.id] || 'planned',
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900">Odoo-Style Activity Kanban Board</h3>
          <p className="text-xs text-slate-500">Track and advance your itinerary items across stages.</p>
        </div>
        <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          {activities.length} Total Pipeline Items
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAGES.map((stg) => {
          const colItems = items.filter((it) => it.stage === stg.id)
          return (
            <div key={stg.id} className={`p-3.5 rounded-2xl border ${stg.border} ${stg.bg} flex flex-col gap-3 min-h-[380px]`}>
              <div className="flex items-center justify-between px-1">
                <span className={`text-xs font-bold ${stg.color}`}>{stg.title}</span>
                <span className="text-[11px] font-bold bg-white px-2 py-0.5 rounded-full shadow-2xs border border-slate-200">
                  {colItems.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colItems.map((item) => (
                  <div
                    key={item.tripActivity.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-xs font-bold text-slate-900 leading-snug">
                        {item.activity?.name || 'Custom Activity'}
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">
                        {item.activity?.category || 'General'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400" />
                        {item.cityName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-slate-400" />
                        {item.tripActivity.startTime || '10:00'} ({item.tripActivity.durationMinutes}m)
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                      <span className="font-bold text-slate-900">
                        {formatCurrency(item.tripActivity.estimatedCost || item.activity?.defaultCost || 0)}
                      </span>

                      {/* Move Stage Dropdown */}
                      <select
                        value={item.stage}
                        onChange={(e) => moveStage(item.tripActivity.id, e.target.value as ActivityStage)}
                        className="text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="planned">💡 Planned</option>
                        <option value="booked">🎟️ Booked</option>
                        <option value="in_progress">🚀 In Progress</option>
                        <option value="completed">✅ Done</option>
                      </select>
                    </div>
                  </div>
                ))}

                {colItems.length === 0 && (
                  <div className="h-28 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-center p-3 text-xs text-slate-400">
                    No activities in this stage.
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
