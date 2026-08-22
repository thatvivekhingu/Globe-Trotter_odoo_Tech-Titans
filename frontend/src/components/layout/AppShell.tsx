import { BarChart3, Bell, Building2, CheckSquare, Compass, CreditCard, DollarSign, Flame, Globe, LayoutDashboard, Map, Menu, Plane, Plus, Search, Settings, Shield, Sparkles, UserCircle, WalletCards } from 'lucide-react'
import { useState, useEffect, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTripWise } from '../../state/useTripWise'
import { AiCopilotFloatingChat } from '../ai/AiCopilotFloatingChat'
import { CommandPaletteModal } from '../navigation/CommandPaletteModal'
import { GlobeTrotterLogo } from '../ui/GlobeTrotterLogo'
import { Button, IconButton } from '../ui/Button'
import { ImageWithFallback } from '../ui/ImageWithFallback'
import { LivePresenceBar } from '../collaboration/LivePresenceBar'

const primaryNavigation = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Trips', to: '/trips', icon: Map },
  { label: 'Curated Tours', to: '/packages', icon: Flame, badge: 'Hot' },
  { label: 'AI Planner', to: '/recommendations', icon: Sparkles, badge: 'LLaMA' },
  { label: 'Bookings', to: '/booking', icon: Plane, badge: 'Live' },
  { label: 'Visa Services', to: '/visa', icon: Globe, badge: '120+' },
  { label: 'Forex & Insurance', to: '/forex', icon: DollarSign, badge: 'RBI' },
  { label: 'Odoo ERP Sync', to: '/odoo', icon: Building2, badge: 'Odoo' },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Discover', to: '/discover/cities', icon: Compass },
  { label: 'Budget & Split', to: '/trips/trip-goa-mmt/budget', icon: WalletCards },
  { label: 'Safety & Lingo', to: '/safety', icon: Shield },
  { label: 'Pricing & Plans', to: '/pricing', icon: CreditCard },
  { label: 'Packing & SOS', to: '/packing', icon: CheckSquare },
]

function isDiscoverPath(pathname: string) {
  return pathname.startsWith('/discover')
}

function SidebarLink({ label, to, icon: Icon, badge }: { label: string; to: string; icon: typeof LayoutDashboard; badge?: string }) {
  return (
    <NavLink
      to={to}
      end={to !== '/discover/cities'}
      className={({ isActive }) => {
        const active = isActive || (to === '/discover/cities' && isDiscoverPath(window.location.pathname))
        return [
          'group flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 outline-none',
          active
            ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-950/60 font-bold'
            : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100',
        ].join(' ')
      }}
    >
      {({ isActive }) => {
        const active = isActive || (to === '/discover/cities' && isDiscoverPath(window.location.pathname))
        return (
          <>
            <Icon size={18} className={active ? 'text-[#B4F056]' : 'text-slate-400 group-hover:text-slate-200 transition-colors'} />
            <span className="truncate flex-1">{label}</span>
            {badge && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                active ? 'bg-[#B4F056] text-[#0F172A]' : 'bg-slate-800 text-indigo-300 border border-indigo-500/30'
              }`}>
                {badge}
              </span>
            )}
          </>
        )
      }}
    </NavLink>
  )
}

function TopBar({ onMenu, onOpenCommandPalette }: { onMenu: () => void; onOpenCommandPalette: () => void }) {
  const { currentUser } = useTripWise()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-[#0B0F19]/95 text-white backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <IconButton label="Open navigation" size="sm" className="lg:hidden text-slate-300 hover:text-white hover:bg-slate-800" onClick={onMenu}>
            <Menu size={18} />
          </IconButton>
          <NavLink to="/dashboard" className="group">
            <GlobeTrotterLogo size={38} dark={true} />
          </NavLink>
        </div>

        {/* Global Spotlight Search Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden max-w-md flex-1 md:flex items-center justify-between h-10 rounded-full border border-slate-700/80 bg-slate-900/90 px-4 text-xs text-slate-400 hover:border-indigo-500 hover:bg-slate-800 transition-all text-left cursor-pointer shadow-inner group"
        >
          <div className="flex items-center gap-2.5">
            <Search size={15} className="text-slate-400 group-hover:text-[#B4F056] transition-colors" />
            <span className="text-slate-400 font-medium">Search 30+ destinations, flights, visa, OCR...</span>
          </div>
          <kbd className="hidden rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300 lg:inline shadow-2xs">
            ⌘ K
          </kbd>
        </button>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-3">
          <LivePresenceBar />

          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Groq LLaMA 3.3 Active
          </div>

          <Button asChild size="sm" icon={<Plus size={14} />} className="hidden sm:inline-flex rounded-full bg-[#B4F056] text-slate-950 hover:bg-[#a5e63f] font-bold">
            <NavLink to="/trips/new">New Trip</NavLink>
          </Button>

          <IconButton label="Notifications" size="sm" className="relative text-slate-300 hover:text-white hover:bg-slate-800">
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#B4F056]" />
          </IconButton>

          <NavLink to="/profile" className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-slate-700 transition-all">
            <ImageWithFallback
              src={currentUser?.avatarUrl}
              alt="Profile portrait"
              className="size-8 rounded-full object-cover border border-slate-700"
              fallbackClassName="size-8 rounded-full"
            />
            <span className="hidden text-xs font-semibold text-slate-200 pr-1.5 sm:inline">
              {currentUser?.name.split(' ')[0] || 'Account'}
            </span>
          </NavLink>
        </div>
      </div>
    </header>
  )
}

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 top-16 z-20 hidden w-60 h-[calc(100vh-4rem)] flex-col justify-between border-r border-slate-800/90 bg-[#0B0F19]/98 px-3 py-4 backdrop-blur-xl lg:flex overflow-y-auto scrollbar-thin">
      <div className="space-y-4 pb-6">
        {/* Core Planning */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Core Planning</p>
          <SidebarLink label="Dashboard" to="/dashboard" icon={LayoutDashboard} />
          <SidebarLink label="My Trips" to="/trips" icon={Map} />
          <SidebarLink label="Curated Tours" to="/packages" icon={Flame} badge="Hot" />
          <SidebarLink label="AI Planner" to="/recommendations" icon={Sparkles} badge="AI" />
        </div>

        {/* Bookings & Services */}
        <div className="space-y-1 pt-2 border-t border-slate-800/80">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Services & Bookings</p>
          <SidebarLink label="Live Bookings" to="/booking" icon={Plane} badge="Live" />
          <SidebarLink label="Visa Services" to="/visa" icon={Globe} badge="120+" />
          <SidebarLink label="Forex & Insurance" to="/forex" icon={DollarSign} badge="RBI" />
        </div>

        {/* Enterprise & Finance */}
        <div className="space-y-1 pt-2 border-t border-slate-800/80">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Enterprise & Finance</p>
          <SidebarLink label="Odoo ERP Sync" to="/odoo" icon={Building2} badge="Odoo" />
          <SidebarLink label="Analytics & KPIs" to="/analytics" icon={BarChart3} />
          <SidebarLink label="Budget & Split" to="/trips/trip-goa-mmt/budget" icon={WalletCards} />
          <SidebarLink label="Pricing & Plans" to="/pricing" icon={CreditCard} />
        </div>

        {/* Utilities */}
        <div className="space-y-1 pt-2 border-t border-slate-800/80">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Travel Utilities</p>
          <SidebarLink label="Discover Cities" to="/discover/cities" icon={Compass} />
          <SidebarLink label="Safety & Lingo" to="/safety" icon={Shield} />
          <SidebarLink label="Packing & SOS" to="/packing" icon={CheckSquare} />
        </div>

        {/* Preferences */}
        <div className="space-y-1 pt-2 border-t border-slate-800/80">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Account</p>
          <SidebarLink label="Profile" to="/profile" icon={UserCircle} />
          <SidebarLink label="Settings & AI" to="/settings" icon={Settings} />
        </div>
      </div>
    </aside>
  )
}

function MobileTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-slate-800 bg-[#0B0F19]/95 text-slate-300 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      {primaryNavigation.slice(0, 4).map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2.5 rounded-lg ${
              isActive ? 'text-[#B4F056]' : 'text-slate-400'
            }`
          }
        >
          <item.icon size={18} />
          <span>{item.label}</span>
        </NavLink>
      ))}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2.5 rounded-lg ${
            isActive ? 'text-[#B4F056]' : 'text-slate-400'
          }`
        }
      >
        <UserCircle size={18} />
        <span>Profile</span>
      </NavLink>
    </nav>
  )
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 lg:hidden" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="absolute inset-y-0 left-0 w-[min(84vw,20rem)] border-r border-slate-800 bg-[#0B0F19] p-5 shadow-2xl text-white">
        <div className="flex items-center justify-between">
          <GlobeTrotterLogo size={32} dark={true} />
          <IconButton label="Close navigation" size="sm" className="text-slate-400 hover:text-white" onClick={onClose}><Menu size={18} /></IconButton>
        </div>
        <nav className="mt-8 space-y-1.5" aria-label="Mobile menu">
          {primaryNavigation.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <item.icon size={18} className="text-slate-400" />
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/profile" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white">
            <UserCircle size={18} className="text-slate-400" />Profile
          </NavLink>
          <NavLink to="/settings" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white">
            <Settings size={18} className="text-slate-400" />Settings & AI
          </NavLink>
        </nav>
        <Button className="mt-8 w-full rounded-full bg-[#B4F056] text-slate-950 font-bold" icon={<Plus size={16} />} onClick={() => { onClose(); window.location.href = '/trips/new' }}>
          Plan a Trip
        </Button>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 relative antialiased selection:bg-[#B4F056] selection:text-[#0F172A]">
      <TopBar onMenu={() => setDrawerOpen(true)} onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
      <Sidebar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main key={location.pathname} className="min-w-0 pb-24 lg:ml-60 lg:pb-12">
        <div className="mx-auto min-w-0 max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
          {children}
        </div>
      </main>
      <MobileTabBar />
      <AiCopilotFloatingChat />
      <CommandPaletteModal open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  )
}
