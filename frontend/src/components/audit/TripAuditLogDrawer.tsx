import { Clock, History, X } from 'lucide-react'
import { Button } from '../ui/Button'

interface AuditEvent {
  id: string
  action: string
  user: string
  timeAgo: string
  category: 'itinerary' | 'budget' | 'ai' | 'booking' | 'team'
}

const AUDIT_EVENTS: AuditEvent[] = [
  { id: '1', action: 'AI Route Auto-Optimizer re-sequenced Day 2 activities', user: 'Aarav Mehta', timeAgo: '3 mins ago', category: 'ai' },
  { id: '2', action: 'Scanned & logged restaurant bill (₹2,850)', user: 'Aarav Mehta', timeAgo: '12 mins ago', category: 'budget' },
  { id: '3', action: 'Confirmed Flight BOM ➡️ GOI (PNR: GT-7K9A2X)', user: 'Rohan Sharma', timeAgo: '1 hour ago', category: 'booking' },
  { id: '4', action: 'Added Pooja Iyer as Travel Companion', user: 'Aarav Mehta', timeAgo: '3 hours ago', category: 'team' },
  { id: '5', action: 'Created trip "Konkan Coast Slow Escape"', user: 'Aarav Mehta', timeAgo: 'Yesterday', category: 'itinerary' },
]

export function TripAuditLogDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-2xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
              <History size={18} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Trip Audit & Activity Stream</h3>
              <p className="text-[11px] text-slate-500">Chronological history of all trip changes</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        {/* Audit Stream List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {AUDIT_EVENTS.map((evt) => (
            <div key={evt.id} className="relative pl-6 border-l-2 border-slate-200 space-y-1">
              <span className="absolute -left-[9px] top-0 size-4 rounded-full bg-white border-2 border-[#4F46E5]" />
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-900">{evt.user}</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock size={11} /> {evt.timeAgo}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{evt.action}</p>
              <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md mt-1">
                {evt.category}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <Button variant="secondary" onClick={onClose} className="w-full text-xs rounded-full">
            Close Audit Log
          </Button>
        </div>
      </div>
    </div>
  )
}
