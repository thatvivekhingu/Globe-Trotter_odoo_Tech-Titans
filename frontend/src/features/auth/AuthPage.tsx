import { Compass, Mail, LockKeyhole, ArrowRight, WifiOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../state/useAuth'
import { useTripWise } from '../../state/useTripWise'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, TextInput } from '../../components/ui/Field'
import { imageAssets } from '../../mock/data'
import { ImageWithFallback } from '../../components/ui/ImageWithFallback'

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { notify } = useTripWise()
  const { login, signup, continueDemo, error: authError, status } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('aarav@tripwise.demo')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const isSignup = mode === 'signup'
  const submitting = status === 'loading'

  function validate() {
    const nextErrors: Record<string, string> = {}
    if (isSignup && name.trim().length < 2) nextErrors.name = 'Please enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (password.length < 8) nextErrors.password = 'Use at least 8 characters.'
    if (isSignup && confirmPassword !== password) nextErrors.confirmPassword = 'Passwords do not match.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return
    const success = isSignup ? await signup({ email, password, full_name: name.trim() }) : await login({ email, password })
    if (!success) return
    notify(isSignup ? 'Account created. Welcome to TripWise.' : 'Welcome back to TripWise.')
    const from = (location.state as { from?: string } | null)?.from
    navigate(from || '/dashboard', { replace: true })
  }

  function handleDemo() {
    continueDemo()
    notify('You are exploring the local TripWise demo.')
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="grid min-h-screen bg-parchment lg:grid-cols-[minmax(0,1.1fr)_minmax(26rem,0.9fr)]">
      <div className="relative hidden min-h-screen overflow-hidden bg-ink lg:block"><ImageWithFallback src={imageAssets.amalfi} alt="Warm coastal village at sunset, Enzo Cetrangolo on Unsplash" className="absolute inset-0 size-full object-cover opacity-70" fallbackClassName="absolute inset-0 size-full" /><div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-ink/10" /><div className="absolute left-10 top-10 flex items-center gap-2 text-parchment"><Compass size={22} /><span className="font-display text-2xl font-semibold">TripWise<span className="text-clay">.</span></span></div><div className="absolute bottom-12 left-10 max-w-xl text-parchment xl:left-16"><p className="eyebrow text-parchment/65">Plan smart. Travel better.</p><h1 className="mt-4 font-display text-6xl font-medium leading-[0.95] tracking-[-0.05em]">The best trips leave room for a little wonder.</h1><p className="mt-5 max-w-md text-sm leading-7 text-parchment/70">Bring every stop, reservation, and daydream into one calm, considered plan.</p></div></div>
      <div className="flex items-center justify-center px-5 py-10 sm:px-8"><Card className="w-full max-w-md border-transparent bg-transparent p-0 shadow-none" padding="none"><div className="mb-10 flex items-center gap-2 text-ink lg:hidden"><Compass size={21} /><span className="font-display text-2xl font-semibold">TripWise<span className="text-clay">.</span></span></div><p className="eyebrow">{isSignup ? 'Begin your story' : 'Welcome back'}</p><h1 className="mt-3 font-display text-5xl font-medium tracking-[-0.05em] text-ink">{isSignup ? 'Make space for more places.' : 'Pick up where you left off.'}</h1><p className="body-copy mt-4 text-sm">{isSignup ? 'Create a free account and keep every route, reservation, and idea close at hand.' : 'Your next great escape is already taking shape.'}</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>{isSignup ? <Field label="Full name" htmlFor="name" required error={errors.name}><TextInput id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Aarav Mehta" autoComplete="name" error={errors.name} /></Field> : null}<Field label="Email address" htmlFor="email" required error={errors.email}><div className="relative"><Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" aria-hidden="true" /><TextInput id="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" error={errors.email} className="pl-10" /></div></Field><Field label="Password" htmlFor="password" required hint={isSignup ? 'At least 8 characters.' : undefined} error={errors.password}><div className="relative"><LockKeyhole size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" aria-hidden="true" /><TextInput id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete={isSignup ? 'new-password' : 'current-password'} error={errors.password} className="pl-10" /></div></Field>{isSignup ? <Field label="Confirm password" htmlFor="confirm-password" required error={errors.confirmPassword}><TextInput id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="••••••••" autoComplete="new-password" error={errors.confirmPassword} /></Field> : null}<Button type="submit" size="lg" className="w-full" loading={submitting} icon={<ArrowRight size={16} />}>{isSignup ? 'Create account' : 'Continue to TripWise'}</Button></form>
        {authError ? <div role="alert" className="mt-5 flex items-start gap-3 rounded-control border border-clay/30 bg-clay/5 p-3 text-sm text-ink/70"><WifiOff size={17} className="mt-0.5 shrink-0 text-clay" /><p>{authError}</p></div> : null}
        <Button type="button" variant="secondary" size="lg" className="mt-3 w-full" onClick={handleDemo} icon={<Compass size={16} />}>Continue in local demo mode</Button>
        <p className="mt-7 text-center text-sm text-ink/55">{isSignup ? 'Already have an account?' : 'Need an account?'} <Link to={isSignup ? '/login' : '/signup'} className="font-semibold text-clay underline-offset-4 hover:underline">{isSignup ? 'Log in' : 'Create one'}</Link></p><p className="mt-10 border-t border-line pt-5 text-center text-xs leading-5 text-ink/45">Live authentication is used when the API is available. Demo mode keeps the product explorable offline.</p></Card></div>
    </div>
  )
}
