import { Bell, CheckSquare, Compass, LayoutDashboard, Map, Menu, Plus, Search, Settings, Sparkles, UserCircle, WalletCards } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTripWise } from '../../state/useTripWise'
import { Button, IconButton } from '../ui/Button'
import { ImageWithFallback } from '../ui/ImageWithFallback'
import { AiCopilotFloatingChat } from '../ai/AiCopilotFloatingChat'

const primaryNavigation = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My trips', to: '/trips', icon: Map },
  { label: 'AI Plan', to: '/recommendations', icon: Sparkles },
  { label: 'Discover', to: '/discover/cities', icon: Compass },
  { label: 'Budget', to: '/trips/trip-konkan/budget', icon: WalletCards },
  { label: 'Packing & SOS', to: '/packing', icon: CheckSquare },
]

function isDiscoverPath(pathname: string) {
  return pathname.startsWith('/discover')
}

function ShellNavLink({ label, to, icon: Icon, mobile = false }: { label: string; to: string; icon: typeof LayoutDashboard; mobile?: boolean }) {
  return (
    <NavLink
      to={to}
      end={to !== '/discover/cities'}
      className={({ isActive }) => {
        const active = isActive || (to === '/discover/cities' && isDiscoverPath(window.location.pathname))
        return [
          'group inline-flex outline-none',
          mobile ? 'min-w-0 flex-1 flex-col items-center gap-1 rounded-control px-2 py-2 text-[0.68rem]' : 'w-full flex-col items-center gap-1.5 rounded-control px-2 py-3 text-[0.65rem]',
          active ? 'bg-clay text-white' : 'text-ink/55 hover:bg-ink/5 hover:text-ink',
        ].join(' ')
      }}
    >
      <Icon size={mobile ? 19 : 20} strokeWidth={1.8} aria-hidden="true" />
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const navigate = useNavigate()
  const { currentUser } = useTripWise()
  const [query, setQuery] = useState('')

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate(`/discover/cities${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-parchment/92 backdrop-blur-md">
      <div className="flex min-h-[4.5rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <IconButton label="Open navigation" size="sm" className="lg:hidden" onClick={onMenu}><Menu size={18} /></IconButton>
        <NavLink to="/dashboard" className="shrink-0 font-display text-2xl font-semibold tracking-[-0.045em] text-ink sm:text-3xl">TripWise<span className="text-clay">.</span></NavLink>
        <form onSubmit={handleSearch} className="ml-auto hidden max-w-md flex-1 md:block">
          <label className="group flex h-11 items-center gap-2 rounded-control border border-line bg-white/55 px-3.5 text-sm text-ink/45 focus-within:border-ink">
            <Search size={17} aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink/40" placeholder="Search destinations or activities" aria-label="Search destinations or activities" />
            <kbd className="hidden rounded border border-line px-1.5 py-0.5 text-[0.65rem] text-ink/40 lg:inline">⌘ K</kbd>
          </label>
        </form>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <IconButton label="Notifications" size="sm" className="hidden sm:inline-flex"><Bell size={18} /></IconButton>
          <NavLink to="/profile" className="flex items-center gap-2 rounded-control p-1 outline-none hover:bg-ink/5">
            <ImageWithFallback src={currentUser?.avatarUrl} alt="Profile portrait of Aarav Mehta" className="size-9 rounded-full object-cover" fallbackClassName="size-9 rounded-full" />
            <span className="hidden text-xs font-semibold text-ink sm:inline">{currentUser?.name.split(' ')[0] || 'Account'}</span>
          </NavLink>
        </div>
      </div>
    </header>
  )
}

function IconRail() {
  return (
    <aside aria-label="Primary navigation" className="fixed inset-y-0 left-0 top-[4.5rem] z-20 hidden w-[5.5rem] flex-col items-center justify-between border-r border-line bg-parchment/95 px-2 py-4 backdrop-blur-md lg:flex">
      <div className="flex w-full flex-col items-center gap-2">
        {primaryNavigation.map((item) => <ShellNavLink key={item.label} {...item} />)}
      </div>
      <div className="mt-auto flex w-full flex-col items-center gap-2">
        <ShellNavLink label="Profile" to="/profile" icon={UserCircle} />
        <ShellNavLink label="Settings" to="/settings" icon={Settings} />
      </div>
    </aside>
  )
}

function MobileTabBar() {
  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 flex min-h-[4.5rem] items-center justify-around border-t border-line bg-parchment/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      {primaryNavigation.map((item) => <ShellNavLink key={item.label} {...item} mobile />)}
      <ShellNavLink label="Profile" to="/profile" icon={UserCircle} mobile />
    </nav>
  )
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 lg:hidden" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="absolute inset-y-0 left-0 w-[min(84vw,20rem)] border-r border-line bg-parchment p-5 shadow-[0_20px_60px_rgb(42_52_57_/_0.18)]">
        <div className="flex items-center justify-between">
          <span className="font-display text-2xl font-semibold tracking-[-0.04em]">TripWise<span className="text-clay">.</span></span>
          <IconButton label="Close navigation" size="sm" onClick={onClose}><Menu size={18} /></IconButton>
        </div>
        <nav className="mt-10 space-y-2" aria-label="Mobile menu">
          {primaryNavigation.map((item) => <NavLink key={item.label} to={item.to} onClick={onClose} className="flex items-center gap-3 rounded-control px-3 py-3 text-sm font-semibold text-ink/70 hover:bg-ink/5"><item.icon size={18} />{item.label}</NavLink>)}
          <NavLink to="/profile" onClick={onClose} className="flex items-center gap-3 rounded-control px-3 py-3 text-sm font-semibold text-ink/70 hover:bg-ink/5"><UserCircle size={18} />Profile</NavLink>
          <NavLink to="/settings" onClick={onClose} className="flex items-center gap-3 rounded-control px-3 py-3 text-sm font-semibold text-ink/70 hover:bg-ink/5"><Settings size={18} />Settings</NavLink>
        </nav>
        <Button className="mt-10 w-full" icon={<Plus size={16} />} onClick={() => { onClose(); window.location.href = '/trips/new' }}>Plan a trip</Button>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-parchment text-ink relative">
      <TopBar onMenu={() => setDrawerOpen(true)} />
      <IconRail />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main key={location.pathname} className="route-page min-w-0 pb-24 lg:ml-[5.5rem] lg:pb-10">
        <div className="mx-auto min-w-0 max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 xl:px-10">{children}</div>
      </main>
      <MobileTabBar />
      <AiCopilotFloatingChat />
    </div>
  )
}
