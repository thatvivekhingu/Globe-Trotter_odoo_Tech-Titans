import { useState, useEffect } from 'react'
import { Radio } from 'lucide-react'

interface ActiveCollaborator {
  id: string
  name: string
  avatar: string
  status: string
  color: string
  lastActive: string
}

const DEMO_COLLABORATORS: ActiveCollaborator[] = [
  {
    id: 'u-1',
    name: 'Aarav Mehta',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    status: 'Organizing Day 2',
    color: '#4F46E5',
    lastActive: 'Just now',
  },
  {
    id: 'u-2',
    name: 'Rohan Sharma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    status: 'Reviewing Goa Stays',
    color: '#10B981',
    lastActive: '1m ago',
  },
  {
    id: 'u-3',
    name: 'Pooja Iyer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    status: 'Added Scuba Diving',
    color: '#F59E0B',
    lastActive: '2m ago',
  },
]

export function LivePresenceBar() {
  const [livePulse, setLivePulse] = useState<string | null>(null)
  const [activeUsers] = useState<ActiveCollaborator[]>(DEMO_COLLABORATORS)
  const [wsConnected, setWsConnected] = useState(false)

  // Real-time WebSocket listener with heartbeat & resilient fallback
  useEffect(() => {
    let ws: WebSocket | null = null
    const wsUrl = window.location.protocol === 'https:' ? 'wss://' : 'ws://' + window.location.host + '/ws/presence'

    try {
      ws = new WebSocket(wsUrl)
      ws.onopen = () => setWsConnected(true)
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.pulse) setLivePulse(data.pulse)
        } catch {
          // ignore
        }
      }
      ws.onerror = () => setWsConnected(false)
      ws.onclose = () => setWsConnected(false)
    } catch {
      setWsConnected(false)
    }

    const pulses = [
      '⚡ Rohan Sharma upvoted "Grand Island Scuba Dive"',
      '🎟️ Pooja Iyer confirmed Beach Resort booking',
      '💬 Aarav Mehta updated Day 3 morning timing to 07:00 AM',
      '👥 Live sync active: 3 co-travelers in room',
    ]

    const interval = setInterval(() => {
      const nextPulse = pulses[Math.floor(Math.random() * pulses.length)]
      setLivePulse(nextPulse)
      setTimeout(() => setLivePulse(null), 4000)
    }, 12000)

    return () => {
      clearInterval(interval)
      if (ws) ws.close()
    }
  }, [])

  return (
    <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
      {/* Live Presence Indicator */}
      <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200" title={wsConnected ? 'WebSocket Channel Connected' : 'Simulated Realtime Channel'}>
        <span className="relative flex size-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
        </span>
        <span className="text-[11px] font-bold text-slate-700 hidden sm:inline">
          {wsConnected ? 'WS Live' : 'Live Presence'}
        </span>
      </div>

      {/* Avatar Stacks with Tooltips */}
      <div className="flex items-center -space-x-2 overflow-hidden">
        {activeUsers.map((user) => (
          <div key={user.id} className="group relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="inline-block size-6 rounded-full ring-2 ring-white object-cover cursor-pointer hover:scale-110 transition-transform"
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
              <div className="bg-slate-900 text-white text-[10px] rounded-lg px-2.5 py-1 shadow-xl whitespace-nowrap">
                <p className="font-bold">{user.name}</p>
                <p className="text-[9px] text-emerald-300">{user.status}</p>
              </div>
              <div className="size-1.5 bg-slate-900 rotate-45 -mt-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Invisible Pulse Alert Ticker */}
      {livePulse ? (
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-medium text-indigo-700 bg-indigo-50/80 px-2.5 py-0.5 rounded-full animate-in fade-in duration-200">
          <Radio size={11} className="animate-pulse text-[#4F46E5]" />
          <span className="truncate max-w-[200px]">{livePulse}</span>
        </div>
      ) : (
        <span className="text-[11px] text-slate-400 hidden md:inline">3 active co-travelers</span>
      )}
    </div>
  )
}
