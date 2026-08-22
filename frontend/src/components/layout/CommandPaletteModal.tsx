import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  MapPin, 
  Plane, 
  Sparkles, 
  DollarSign, 
  CheckSquare, 
  Globe, 
  Building2, 
  Calendar,
  X,
  ArrowRight
} from 'lucide-react'
import { useTripWise } from '../../state/useTripWise'
import { formatCurrency } from '../../lib/formatters'

interface CommandItem {
  id: string
  category: 'Destinations' | 'Services' | 'AI & Tools' | 'My Trips'
  title: string
  description: string
  path: string
  icon: typeof Search
  badge?: string
}

export function CommandPaletteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { state } = useTripWise()
  const [query, setQuery] = useState('')

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const defaultCommands: CommandItem[] = [
    {
      id: 'c-dashboard',
      category: 'Services',
      title: 'Travel Dashboard & Live Radar',
      description: 'View active flights, destination weather, and next trips',
      path: '/dashboard',
      icon: Calendar,
      badge: 'Live',
    },
    {
      id: 'c-booking',
      category: 'Services',
      title: 'Live Flight & Hotel Bookings',
      description: 'Book IndiGo, Air India, Taj Hotels & generate Boarding Passes',
      path: '/booking',
      icon: Plane,
      badge: 'Instant Checkout',
    },
    {
      id: 'c-packages',
      category: 'Services',
      title: 'MakeMyTrip Curated Packages',
      description: 'Goa, Kashmir, Dubai, Andaman, Rajasthan & Bali holiday packages',
      path: '/packages',
      icon: Sparkles,
      badge: 'Hot Offers',
    },
    {
      id: 'c-ai-planner',
      category: 'AI & Tools',
      title: 'AI Smart Itinerary Generator',
      description: 'Create multi-city routes with automatic budget breakdowns',
      path: '/recommendations',
      icon: Sparkles,
      badge: 'AI',
    },
    {
      id: 'c-forex',
      category: 'AI & Tools',
      title: 'Live Forex Rates & Travel Insurance',
      description: 'RBI-benchmarked currency rates and Tata AIG Schengen certificates',
      path: '/forex',
      icon: DollarSign,
      badge: 'RBI Rate',
    },
    {
      id: 'c-packing',
      category: 'AI & Tools',
      title: 'Smart Packing & SOS Kit',
      description: 'Weather-adaptive luggage checklist and emergency contacts',
      path: '/packing',
      icon: CheckSquare,
    },
    {
      id: 'c-visa',
      category: 'Services',
      title: 'Visa Eligibility & Embassy Pass',
      description: 'Check 120+ visa-free and eVisa rules for Indian passport holders',
      path: '/visa',
      icon: Globe,
      badge: '120+ Countries',
    },
    {
      id: 'c-odoo',
      category: 'Services',
      title: 'Odoo ERP Corporate Sync',
      description: 'Manage corporate travel expenses, invoices, and accounting',
      path: '/odoo',
      icon: Building2,
      badge: 'Enterprise',
    },
  ]

  const cityCommands: CommandItem[] = state.db.cities.map((city) => ({
    id: `city-${city.id}`,
    category: 'Destinations',
    title: `${city.name}, ${city.country}`,
    description: `${city.tagline || 'Explore top landmarks, food & stay'} · Daily ~${formatCurrency(city.dailyCostEstimate)}`,
    path: `/discover/cities?q=${encodeURIComponent(city.name)}`,
    icon: MapPin,
    badge: `${city.recommendedDays} Days`,
  }))

  const allItems = [...defaultCommands, ...cityCommands]

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : allItems

  function handleSelect(path: string) {
    onClose()
    setQuery('')
    navigate(path)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-4 sm:pt-20" onClick={onClose}>
      <div 
        className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <Search size={20} className="text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, destination (e.g. Goa, Flight, Forex, Visa)..."
            className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400"
          />
          {query && (
            <button 
              type="button" 
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="hidden sm:inline-block text-[11px] font-bold text-slate-400 border border-slate-200 px-2 py-0.5 rounded-md bg-white shadow-2xs"
          >
            ESC
          </button>
        </div>

        <div className="overflow-y-auto p-3 space-y-1 divide-y divide-slate-100/60 max-h-[60vh]">
          {filtered.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700">No matching commands found</p>
              <p className="text-xs text-slate-400">Try searching for "Goa", "Flight", "Hotel", "Forex", or "Visa".</p>
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="size-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-[#B4F056] transition-colors">
                      <Icon size={17} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.2 rounded-md border border-indigo-100">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{item.description}</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-700 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </button>
              )
            })
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium px-5">
          <div className="flex items-center gap-3">
            <span>Shortcut: <kbd className="font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">⌘K</kbd> / <kbd className="font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">Ctrl+K</kbd></span>
          </div>
          <span className="text-[#4F46E5] font-bold">GlobeTrotter Spotlight</span>
        </div>
      </div>
    </div>
  )
}
