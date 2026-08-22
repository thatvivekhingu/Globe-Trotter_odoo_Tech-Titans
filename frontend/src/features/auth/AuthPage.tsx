import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Globe, Bike, Footprints, Bus, Sparkles } from 'lucide-react'
import { useAuth } from '../../state/useAuth'
import { useTripWise } from '../../state/useTripWise'

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { notify } = useTripWise()
  const { login, signup, continueDemo, error: authError, status } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('aarav@globetrotter.demo')
  const [password, setPassword] = useState('Demo@1234')
  const isSignup = mode === 'signup'
  const submitting = status === 'loading'

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
    <div className="min-h-screen bg-[#F4F7F9] text-[#0F172A] font-sans antialiased selection:bg-[#B4F056] selection:text-black">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="size-9 bg-[#0F172A] rounded-xl flex items-center justify-center text-[#B4F056] shadow-sm">
            <Globe size={19} strokeWidth={2.2} />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl tracking-tight leading-tight">GlobeTrotter</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4F46E5]">Smart Commute & Travel</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center bg-[#E2E8F0]/70 backdrop-blur-md p-1.5 rounded-full text-xs font-semibold text-slate-700 shadow-inner">
          <a href="#hero-form" className="px-4 py-1.5 rounded-full hover:bg-white/80 transition-all">Features</a>
          <a href="#benefits" className="px-4 py-1.5 rounded-full hover:bg-white/80 transition-all">Benefits</a>
          <a href="#signup-form" className="px-4 py-1.5 rounded-full bg-white shadow-sm text-[#0F172A]">Signup Form</a>
          <a href="#impact" className="px-4 py-1.5 rounded-full hover:bg-white/80 transition-all">Impact</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDemo}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-black bg-white/80 px-3.5 py-2 rounded-full border border-slate-200 shadow-sm transition-all"
          >
            <Sparkles size={14} className="text-[#4F46E5]" /> 1-Click Demo
          </button>
          <Link
            to={isSignup ? '/login' : '/signup'}
            className="text-xs font-bold text-slate-800 hover:text-[#4F46E5] px-4 py-2 rounded-full transition-colors"
          >
            {isSignup ? 'Sign in' : 'Register'}
          </Link>
        </div>
      </header>

      {/* Main Hero & Form Section (Matching Reference Screenshot 2) */}
      <section id="signup-form" className="max-w-7xl mx-auto px-6 pt-8 pb-20 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-[1.08]">
              Start Your Journey
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-500 font-medium">
              Create your account and begin intelligent travel planning today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {isSignup ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">First name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Aarav"
                    className="w-full px-4 py-3 rounded-full bg-white border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Mehta"
                    className="w-full px-4 py-3 rounded-full bg-white border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-all"
                  />
                </div>
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@globetrotter.demo"
                className="w-full px-4 py-3 rounded-full bg-white border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-full bg-white border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-all"
                required
              />
            </div>

            {authError ? (
              <p className="text-xs font-semibold text-red-600">{authError}</p>
            ) : null}

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-full font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? 'Please wait...' : isSignup ? 'Claim My Spot' : 'Start Journey'}
              </button>

              <button
                type="button"
                onClick={handleDemo}
                className="text-xs font-semibold text-slate-500 hover:text-black py-1 text-left"
              >
                Or explore directly with <span className="underline font-bold text-[#4F46E5]">Demo Account</span> &rarr;
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Interactive Vector Route Network Graphic (Matching Screenshot 2) */}
        <div className="lg:col-span-7 relative h-[420px] sm:h-[480px] bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200 p-6 flex flex-col justify-between overflow-hidden shadow-sm">
          {/* Top Right Transport Icons */}
          <div className="flex items-center justify-end gap-2 z-10">
            <div className="size-9 rounded-full bg-[#B4F056] text-[#0F172A] flex items-center justify-center shadow-sm">
              <Bike size={18} />
            </div>
            <div className="size-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shadow-sm">
              <Footprints size={18} />
            </div>
            <div className="size-9 rounded-full bg-[#38BDF8] text-white flex items-center justify-center shadow-sm">
              <Bus size={18} />
            </div>
          </div>

          {/* Stylized Vector Route SVG */}
          <svg className="absolute inset-0 size-full stroke-slate-300/80 fill-none" xmlns="http://www.w3.org/2000/svg">
            {/* Grid street lines */}
            <path d="M50,80 L200,120 L400,90 L600,140" strokeWidth="1.5" stroke="#CBD5E1" />
            <path d="M120,30 L160,200 L240,360 L380,420" strokeWidth="1.5" stroke="#CBD5E1" />
            <path d="M220,120 L320,220 L450,280 L580,340" strokeWidth="2" stroke="#B4F056" strokeDasharray="4 4" />
            <path d="M80,240 Q250,80 480,200 T620,380" strokeWidth="2" stroke="#38BDF8" strokeDasharray="6 6" />

            {/* Hub Station Dots */}
            <circle cx="220" cy="120" r="7" fill="#38BDF8" className="animate-pulse" />
            <circle cx="320" cy="220" r="7" fill="#B4F056" />
            <circle cx="480" cy="200" r="6" fill="#86EFAC" />
            <circle cx="380" cy="380" r="6" fill="#60A5FA" />
          </svg>

          {/* Floating Photo Preview Cards */}
          <div className="absolute bottom-6 right-6 z-10 w-48 rounded-2xl overflow-hidden shadow-xl border-2 border-white transform rotate-2 hover:rotate-0 transition-transform duration-300">
            <img
              src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&q=80"
              alt="Coastal Goan Sunset"
              className="w-full h-28 object-cover"
            />
            <div className="p-2 bg-white text-[10px] font-bold text-slate-800">
              Goa Beachside Stop
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Impact Section (Matching Screenshot 3) */}
      <section id="impact" className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
          <div className="inline-block">
            <div className="size-20 mx-auto rounded-3xl overflow-hidden shadow-md border-2 border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
                alt="Joris Thorne"
                className="size-full object-cover"
              />
            </div>
            <p className="mt-3 text-xs font-extrabold uppercase tracking-widest text-[#4F46E5]">Driven by Real Impact</p>
          </div>

          <blockquote className="font-display text-2xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#0F172A] leading-snug max-w-3xl mx-auto">
            &ldquo;I finally have an incentive to plan multi-city travel smartly, and the automated budget optimizer alone makes it worthwhile.&rdquo;
          </blockquote>

          <p className="text-sm font-bold text-slate-500">
            Aarav Mehta &bull; Solo & Heritage Explorer
          </p>
        </div>
      </section>

      {/* Dark Indigo Perks & App Mockup Section (Matching Screenshot 4) */}
      <section id="benefits" className="py-24 bg-[#0A192F] text-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B4F056]">Early Adopter Perks</span>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Intelligent Itineraries at Your Fingertips
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Experience deterministic budget calculation, interactive calendar matrices, and 1-click social sharing designed for modern globe-trotters.
            </p>

            <div className="flex items-center gap-4 pt-4">
              <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-white flex items-center gap-2">
                <span className="text-[#B4F056] text-base">2x</span> Faster Route Planning
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-white flex items-center gap-2">
                <Sparkles size={15} className="text-[#B4F056]" /> AI Constraint Aware
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            {/* Phone Mockup Frame */}
            <div className="w-72 sm:w-80 rounded-[2.5rem] p-3.5 bg-gradient-to-b from-slate-700 to-slate-900 shadow-2xl border-4 border-slate-600">
              <div className="rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#0A192F] p-6 text-center text-white space-y-6">
                <div className="size-12 mx-auto rounded-2xl bg-[#B4F056] text-[#0F172A] flex items-center justify-center font-extrabold text-xl shadow-lg">
                  <Globe size={24} />
                </div>
                <h3 className="font-display text-2xl font-bold">GlobeTrotter Mobile</h3>
                <div className="space-y-2 text-xs text-slate-300 text-left">
                  <div className="p-3 rounded-xl bg-white/10">✨ AI Itinerary Optimizer</div>
                  <div className="p-3 rounded-xl bg-white/10">💰 Real-Time Expense Splitter</div>
                  <div className="p-3 rounded-xl bg-white/10">📍 Multi-City Transit Sync</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* High-Contrast Train Sunlight Photography Section (Matching Screenshot 1 & 5) */}
      <section className="relative h-[480px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&q=80"
          alt="Happy travelers enjoying train window commute"
          className="size-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8 sm:p-16 max-w-7xl mx-auto text-white">
          <h2 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight">
            Why Travel with Us
          </h2>
          <p className="mt-3 text-slate-200 max-w-xl text-sm sm:text-base">
            From solo journeys across Himalayan peaks to sunlit coastal train routes, make every mile memorable.
          </p>
          <div className="mt-6">
            <button
              onClick={handleDemo}
              className="px-8 py-3.5 bg-[#B4F056] hover:bg-[#a3e343] text-[#0F172A] rounded-full font-extrabold text-sm shadow-xl transition-all"
            >
              Experience GlobeTrotter Now &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 border-t border-slate-200">
        <p>&copy; 2026 GlobeTrotter. Inspired by Nimbus Commute & Smart Travel Systems.</p>
        <div className="flex items-center gap-6 font-semibold text-slate-700">
          <Link to="/discover/cities" className="hover:text-black">Cities</Link>
          <Link to="/discover/activities" className="hover:text-black">Activities</Link>
          <Link to="/recommendations" className="hover:text-black">AI Plan</Link>
          <button onClick={handleDemo} className="hover:text-black">Demo Account</button>
        </div>
      </footer>
    </div>
  )
}

