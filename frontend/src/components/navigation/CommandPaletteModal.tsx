import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Sparkles, Map, Plus, WalletCards, Plane, Globe, ShieldCheck, Flame, Building2 } from 'lucide-react'
import { useTripWise } from '../../state/useTripWise'

interface CommandItem {
  id: string
  title: string
  subtitle: string
  category: 'Navigation' | 'Actions' | 'Destinations'
  icon: typeof Search
  action: () => void
}

export function CommandPaletteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { state } = useTripWise()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [open])

  // All searchable commands & actions
  const allCommands: CommandItem[] = [
    {
      id: 'cmd-ai-plan',
      title: 'AI Trip Architect',
      subtitle: 'Generate intelligent day-by-day itineraries with Groq LLaMA 3.3',
      category: 'Actions',
      icon: Sparkles,
      action: () => { navigate('/recommendations'); onClose() },
    },
    {
      id: 'cmd-new-trip',
      title: 'Create New Trip',
      subtitle: 'Start a blank custom trip itinerary',
      category: 'Actions',
      icon: Plus,
      action: () => { navigate('/trips/new'); onClose() },
    },
    {
      id: 'cmd-scan-receipt',
      title: 'Scan Receipt with Neural OCR',
      subtitle: 'Extract expense totals from receipt photo via Tesseract WASM',
      category: 'Actions',
      icon: WalletCards,
      action: () => { navigate('/trips/trip-konkan/budget'); onClose() },
    },
    {
      id: 'cmd-tours',
      title: 'Explore Curated Tour Packages',
      subtitle: 'Thrillophilia-style bestselling multi-day expeditions (40% Off)',
      category: 'Navigation',
      icon: Flame,
      action: () => { navigate('/packages'); onClose() },
    },
    {
      id: 'cmd-bookings',
      title: 'Live Flight & Hotel Bookings',
      subtitle: 'Search IndiGo, Air India, Taj hotels & Razorpay checkout',
      category: 'Navigation',
      icon: Plane,
      action: () => { navigate('/booking'); onClose() },
    },
    {
      id: 'cmd-visa',
      title: 'Global Visa Assistance (120+ Countries)',
      subtitle: 'Fast e-Visa, sticker visa checklists & official PDF pass',
      category: 'Navigation',
      icon: Globe,
      action: () => { navigate('/visa'); onClose() },
    },
    {
      id: 'cmd-forex',
      title: 'Forex Cards & Travel Insurance',
      subtitle: 'Zero markup currency calculator & Tata AIG embassy policy',
      category: 'Navigation',
      icon: ShieldCheck,
      action: () => { navigate('/forex'); onClose() },
    },
    {
      id: 'cmd-odoo',
      title: 'Odoo Enterprise ERP Sync',
      subtitle: 'XML-RPC corporate expense sync for hr.expense & account.move',
      category: 'Navigation',
      icon: Building2,
      action: () => { navigate('/odoo'); onClose() },
    },
    ...state.db.cities.slice(0, 10).map((city) => ({
      id: `city-${city.id}`,
      title: `${city.name}, ${city.region}`,
      subtitle: `Explore top sights, budget stays, and attractions in ${city.name}`,
      category: 'Destinations' as const,
      icon: Map,
      action: () => { navigate(`/discover/cities?q=${encodeURIComponent(city.name)}`); onClose() },
    })),
  ]

  const filtered = query.trim()
    ? allCommands.filter((c) =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!open) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, filtered, selectedIndex, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Search Header Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <Search size={20} className="text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Type a command, city, flight, or action... (e.g. 'Goa', 'Visa', 'OCR')"
            className="w-full text-sm font-semibold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
          />
          <kbd className="hidden sm:inline-block rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[22rem] overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                    isSelected
                      ? 'bg-[#4F46E5] text-white shadow-md'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {item.title}
                      </p>
                      <p className={`text-[11px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {item.category}
                  </span>
                </button>
              )
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching commands or destinations found for &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span><strong>↑↓</strong> to navigate</span>
            <span><strong>↵</strong> to select</span>
            <span><strong>ESC</strong> to dismiss</span>
          </div>
          <span className="font-bold text-[#4F46E5]">GlobeTrotter Spotlight</span>
        </div>
      </div>
    </div>
  )
}
