import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Compass, Globe, MapPin, Sparkles, WalletCards } from 'lucide-react'
import { checkApiHealth, getApiStatusLabel } from '../../lib/api/client'
import { useAuth } from '../../state/useAuth'
import { useTripWise } from '../../state/useTripWise'

const featureCards = [
  {
    icon: Compass,
    title: 'Discover cities',
    description: 'Find destinations, compare regions, and lock in your route with confidence.',
  },
  {
    icon: WalletCards,
    title: 'Keep budgets clear',
    description: 'Track daily spend, set limits, and know where your trip is stretching.',
  },
  {
    icon: MapPin,
    title: 'Stay on plan',
    description: 'Shape each stop, add activities, and keep the full itinerary in one place.',
  },
]

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { notify } = useTripWise()
  const { login, signup, continueDemo, error: authError, status } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('aarav@globetrotter.demo')
  const [password, setPassword] = useState('Demo@1234')
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)
  const isSignup = mode === 'signup'
  const submitting = status === 'loading'

  useEffect(() => {
    void checkApiHealth().then(setApiOnline)
  }, [])

  function validate() {
    if (isSignup && firstName.trim().length < 2) {
      notify('Please enter your first name.', 'error')
      return false
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      notify('Please enter a valid email address.', 'error')
      return false
    }
    if (password.length < 6) {
      notify('Password must be at least 6 characters.', 'error')
      return false
    }
    return true
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return
    const fullName = isSignup ? `${firstName.trim()} ${lastName.trim()}`.trim() : 'Aarav Mehta'
    const success = isSignup ? await signup({ email, password, full_name: fullName }) : await login({ email, password })
    if (!success) return
    notify(isSignup ? 'Account created. Welcome to GlobeTrotter!' : 'Welcome back to GlobeTrotter!')
    const from = (location.state as { from?: string } | null)?.from
    navigate(from || '/dashboard', { replace: true })
  }

  function handleDemo() {
    continueDemo()
    notify('Exploring in demo traveler mode.')
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-lime-300 shadow-sm">
            <Globe size={18} />
          </div>
          <div>
            <p className="font-display text-xl font-extrabold tracking-[-0.05em] text-slate-900">GlobeTrotter</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-600">Travel smarter</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-2 py-1.5 text-sm font-medium text-slate-600 shadow-sm md:flex">
          <a href="#features" className="rounded-full px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-slate-900">Features</a>
          <a href="#experience" className="rounded-full px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-slate-900">Experience</a>
          <a href="#signup" className="rounded-full bg-slate-900 px-3 py-1.5 text-white">{isSignup ? 'Create account' : 'Sign in'}</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`hidden rounded-full border px-3 py-1.5 text-[11px] font-semibold sm:inline-flex ${apiOnline === false ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {apiOnline === null ? 'Checking API...' : getApiStatusLabel(Boolean(apiOnline))}
          </span>
          <Link to={isSignup ? '/login' : '/signup'} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900">
            {isSignup ? 'Sign in' : 'Register'}
          </Link>
        </div>
      </header>

      <main>
        <section id="signup" className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.05fr_1.15fr] lg:px-8 lg:pb-20 lg:pt-10">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
              <Sparkles size={12} /> Smart travel planning
            </div>
            <h1 className="max-w-xl font-display text-4xl font-extrabold tracking-[-0.07em] text-slate-900 sm:text-5xl lg:text-6xl">
              Plan a better trip,
              <span className="block text-slate-500">without the chaos.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
              Built for city hopping, route planning, smart budgets, and the moments that make a trip feel alive.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-20px_rgba(15,23,42,0.18)] sm:p-6">
              {isSignup ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    <span className="mb-2 block">First name</span>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Aarav"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                      required
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    <span className="mb-2 block">Last name</span>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Mehta"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    />
                  </label>
                </div>
              ) : null}

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  required
                />
              </label>

              {authError ? <p className="text-sm font-medium text-red-600">{authError}</p> : null}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Please wait...' : isSignup ? 'Create account' : 'Continue to dashboard'}
                  <ArrowRight size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleDemo}
                className="w-full text-left text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Or continue in <span className="font-semibold text-violet-600">preview mode</span>
              </button>
            </form>
          </div>

          <div id="experience" className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-950 to-violet-950 p-5 shadow-[0_25px_80px_-30px_rgba(15,23,42,0.85)] sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(196,181,253,0.18),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(163,230,53,0.12),_transparent_30%)]" />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Route overview</p>
                  <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.05em] text-white">Goa to Jaipur</h2>
                </div>
                <div className="rounded-full border border-white/15 bg-white/6 px-3 py-1.5 text-xs font-semibold text-emerald-300">Live plan</div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Stops</p>
                  <p className="mt-2 font-display text-2xl font-bold text-white">3</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Budget</p>
                  <p className="mt-2 font-display text-2xl font-bold text-white">₹48k</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Days</p>
                  <p className="mt-2 font-display text-2xl font-bold text-white">7</p>
                </div>
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-4 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Day 2</p>
                    <p className="mt-2 font-display text-2xl font-bold text-white">Baga → Old Goa</p>
                  </div>
                  <span className="rounded-full bg-lime-300 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-900">Low cost</span>
                </div>

                <div className="mt-5 space-y-3">
                  {['Sunrise walk', 'Beach brunch', 'Heritage museum', 'Sunset drive'].map((item, index) => (
                    <div key={item} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/4 px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-full bg-violet-500/20 text-xs font-semibold text-violet-200">{index + 1}</span>
                        <span className="text-sm text-slate-100">{item}</span>
                      </div>
                      <span className="text-xs text-slate-300">₹{(900 + index * 450).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">Budget-aware</span>
                <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200">Auto suggestions</span>
                <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-200">Shared itinerary</span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Everything in one place</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.05em] text-slate-900 sm:text-4xl">Make every trip feel calmer and more intentional.</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                  <Icon size={18} />
                </div>
                <h3 className="font-display text-2xl font-bold tracking-[-0.04em] text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Travelers love it</p>
            <blockquote className="mt-5 font-display text-3xl font-bold tracking-[-0.05em] text-slate-900 sm:text-5xl">
              “It feels like having a thoughtful co-planner in my pocket.”
            </blockquote>
            <p className="mt-5 text-sm font-medium text-slate-500">Aarav Mehta · Weekend explorer</p>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <p>© 2026 GlobeTrotter</p>
        <div className="flex items-center gap-5">
          <Link to="/discover/cities" className="transition hover:text-slate-900">Cities</Link>
          <Link to="/discover/activities" className="transition hover:text-slate-900">Activities</Link>
          <Link to="/recommendations" className="transition hover:text-slate-900">AI plan</Link>
          <button type="button" onClick={handleDemo} className="transition hover:text-slate-900">Demo</button>
        </div>
      </footer>
    </div>
  )
}

