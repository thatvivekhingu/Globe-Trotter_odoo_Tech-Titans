import { Bookmark, Check, Globe2, LogOut, Mail, MapPin, Save, Settings2, Trash2, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTripWise } from '../../state/useTripWise'
import { useAuth } from '../../state/useAuth'
import { formatCostIndex } from '../../lib/formatters'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, SectionHeading } from '../../components/ui/Card'
import { ConfirmDialog, EmptyState } from '../../components/ui/Feedback'
import { Field, Select, TextInput } from '../../components/ui/Field'
import { ImageWithFallback } from '../../components/ui/ImageWithFallback'

export function ProfilePage() {
  const { currentUser, state, dispatch, notify } = useTripWise()
  const { logout } = useAuth()
  const [name, setName] = useState(currentUser?.name || '')
  const [email, setEmail] = useState(currentUser?.email || '')
  const [language, setLanguage] = useState<'en' | 'hi'>(currentUser?.language || 'en')
  const [saved, setSaved] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const savedDestinations = state.db.savedDestinations
    .filter((item) => item.userId === currentUser?.id)
    .map((item) => ({ saved: item, city: state.db.cities.find((city) => city.id === item.cityId) }))
    .filter((item): item is { saved: typeof item.saved; city: NonNullable<typeof item.city> } => Boolean(item.city))

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!currentUser || name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(email)) {
      notify('Please check your profile details.', 'error')
      return
    }
    dispatch({ type: 'UPDATE_PROFILE', userId: currentUser.id, changes: { name: name.trim(), email: email.trim(), language } })
    setSaved(true)
    notify('Profile updated.')
    window.setTimeout(() => setSaved(false), 2400)
  }

  function deleteAccount() {
    dispatch({ type: 'SIGN_OUT_DEMO' })
    setDeleteOpen(false)
    notify('Demo account reset.', 'info')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <SectionHeading
        eyebrow="Your details"
        title="Profile"
        description="Keep the basics current so every trip feels like it belongs to you."
        action={<Button variant="secondary" size="sm" icon={<LogOut size={15} />} onClick={() => { void logout().then(() => notify('You are signed out.', 'info')) }}>Log out</Button>}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Card className="bg-ink text-parchment">
          <div className="flex items-center gap-4">
            <ImageWithFallback src={currentUser?.avatarUrl} alt="Profile portrait of Aarav Mehta" className="size-20 rounded-full object-cover" fallbackClassName="size-20 rounded-full" />
            <div>
              <p className="eyebrow text-parchment/60">Traveller profile</p>
              <h2 className="mt-2 font-display text-3xl">{currentUser?.name}</h2>
              <p className="mt-1 text-sm text-parchment/60">Member since August 2026</p>
            </div>
          </div>
          <div className="mt-10 border-t border-parchment/15 pt-5 text-sm text-parchment/70">
            <p className="flex items-center gap-2"><MapPin size={15} className="text-sage" />India · dreaming outward</p>
            <p className="mt-3 flex items-center gap-2"><Bookmark size={15} className="text-sage" />{savedDestinations.length} saved destinations</p>
          </div>
        </Card>
        <Card>
          <form className="space-y-5" onSubmit={saveProfile}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" htmlFor="profile-name" required>
                <div className="relative"><UserRound size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" /><TextInput id="profile-name" value={name} onChange={(event) => setName(event.target.value)} className="pl-10" /></div>
              </Field>
              <Field label="Email address" htmlFor="profile-email" required>
                <div className="relative"><Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" /><TextInput id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="pl-10" /></div>
              </Field>
            </div>
            <Field label="Language" htmlFor="profile-language" hint="Used for dates and future recommendation copy.">
              <div className="relative"><Globe2 size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" /><Select id="profile-language" value={language} onChange={(event) => setLanguage(event.target.value as 'en' | 'hi')} options={[{ value: 'en', label: 'English' }, { value: 'hi', label: 'हिन्दी' }]} className="pl-10" /></div>
            </Field>
            <div className="flex justify-end border-t border-line pt-5"><Button type="submit" icon={saved ? <Check size={16} /> : <Save size={16} />}>{saved ? 'Changes saved' : 'Save profile'}</Button></div>
          </form>
        </Card>
      </div>

      <section className="space-y-5">
        <SectionHeading eyebrow="Keep an eye on" title="Saved destinations" description="The places you saved while exploring. Add them to a trip when the time is right." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {savedDestinations.map(({ saved: savedDestination, city }) => (
            <Card key={savedDestination.id} padding="none" className="overflow-hidden">
              <div className="aspect-[1.4/0.9] overflow-hidden"><ImageWithFallback src={city.imageUrl} alt={city.imageAlt} className="size-full object-cover" fallbackClassName="size-full" /></div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><h3 className="font-display text-2xl text-ink">{city.name}</h3><p className="mt-1 flex items-center gap-1 text-xs text-ink/50"><MapPin size={12} />{city.region}</p></div>
                  <Badge tone="sage">{formatCostIndex(city.costIndex)}</Badge>
                </div>
                <button type="button" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-clay hover:text-ink" onClick={() => { if (currentUser) dispatch({ type: 'TOGGLE_SAVED_DESTINATION', userId: currentUser.id, cityId: city.id }); notify(`${city.name} removed from saved destinations.`) }}>Remove save <Trash2 size={13} /></button>
              </div>
            </Card>
          ))}
        </div>
        {!savedDestinations.length ? <EmptyState icon={<Bookmark size={26} />} title="Nothing saved yet" description="Explore cities and tap the bookmark when a place feels like a maybe." action={<Button asChild><Link to="/discover/cities">Explore cities</Link></Button>} /> : null}
      </section>

      <Card className="border-clay/25 bg-clay/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2"><Settings2 size={18} className="text-clay" /><p className="eyebrow">Account settings</p></div>
            <h2 className="mt-2 font-display text-2xl text-ink">Ready for a clean slate?</h2>
            <p className="body-copy mt-1 max-w-xl text-sm">Resetting the demo account removes local profile state and signs you out. Your real account will never be touched here.</p>
          </div>
          <Button variant="danger" icon={<Trash2 size={15} />} onClick={() => setDeleteOpen(true)}>Delete account</Button>
        </div>
      </Card>
      <ConfirmDialog open={deleteOpen} title="Delete account?" description="Your local demo profile and trip workspace will be reset. This action cannot be undone." confirmLabel="Delete account" onClose={() => setDeleteOpen(false)} onConfirm={deleteAccount} />
    </div>
  )
}

export function SettingsPage() {
  const { notify } = useTripWise()
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('GLOBETROTTER_GROQ_KEY') || import.meta.env.VITE_GROQ_API_KEY || '')
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('GLOBETROTTER_AI_MODEL') || 'openai/gpt-oss-120b')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  function saveAiSettings(e: FormEvent) {
    e.preventDefault()
    localStorage.setItem('GLOBETROTTER_GROQ_KEY', groqKey.trim())
    localStorage.setItem('GLOBETROTTER_AI_MODEL', selectedModel)
    notify('Groq LLaMA AI configuration saved!')
  }

  async function testLlmConnection() {
    setTesting(true)
    setTestResult(null)
    const keyToTest = groqKey.trim()
    
    if (!keyToTest) {
      setTestResult('No API Key provided. GlobeTrotter will use the high-performance local AI fallback engine.')
      setTesting(false)
      return
    }

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${keyToTest}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'user', content: 'Give a 1-sentence inspiring travel quote for GlobeTrotter.' }
          ]
        })
      })
      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content
      if (content) {
        setTestResult(`✅ Connected to ${selectedModel}! Response: "${content.trim()}"`)
        notify('Groq LLaMA Connection Successful!')
      } else if (data?.error?.message) {
        setTestResult(`⚠️ ${data.error.message}`)
        notify('API error', 'error')
      }
    } catch (err: any) {
      setTestResult(`⚠️ Connection failed (${err.message}).`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <SectionHeading eyebrow="Make it yours" title="Settings & AI Model" description="Configure your Groq LLaMA models, API keys, and platform preferences." />
      
      {/* AI & LLM Engine Settings Card */}
      <Card>
        <form onSubmit={saveAiSettings} className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#4F46E5]/15 text-[#4F46E5]">
              <Settings2 size={18} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-ink">LLM Model & AI Engine</h2>
                <Badge tone="clay">{selectedModel}</Badge>
              </div>
              <p className="body-copy mt-1 text-sm">Powered by high-speed Groq LPU inference for instant itineraries and AI Copilot responses.</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-ink/70 mb-1">Select Active LLM Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-white text-sm font-medium"
              >
                <option value="openai/gpt-oss-120b">Groq GPT-OSS 120B / LLaMA Architecture (Sub-second · Recommended)</option>
                <option value="qwen/qwen3.6-27b">Groq Qwen 3.6 27B (High-Precision Reasoning)</option>
                <option value="openai/gpt-oss-20b">Groq GPT-OSS 20B (Ultra-Lightweight & Fast)</option>
                <option value="local-engine">GlobeTrotter Neural Deterministic Engine (Offline / Local)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink/70 mb-1">Groq API Key</label>
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-white text-sm font-mono"
              />
              <p className="mt-1 text-[11px] text-ink/50">Groq API Key configured for ultra-fast LPU inference (500+ tokens/sec).</p>
            </div>

            {testResult && (
              <div className="p-3 rounded-xl bg-slate-50 border border-line text-xs font-medium text-slate-800">
                {testResult}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <Button type="button" variant="soft" size="sm" onClick={testLlmConnection} disabled={testing}>
              {testing ? 'Testing...' : 'Test LLM Connection'}
            </Button>
            <Button type="submit" size="sm" icon={<Save size={15} />}>Save AI Settings</Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="space-y-5">
          <div className="flex items-start gap-4"><div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sage/25"><Globe2 size={18} /></div><div className="flex-1"><h2 className="font-display text-2xl text-ink">Language & locale</h2><p className="body-copy mt-1 text-sm">Choose how dates, currency, and future recommendation notes are presented.</p></div><Badge tone="sage">English · INR (₹)</Badge></div>
        </div>
      </Card>
    </div>
  )
}
