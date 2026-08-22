import { ArrowLeft, Image, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../lib/api/client'
import { useTripWise } from '../../state/useTripWise'
import { Button } from '../../components/ui/Button'
import { Card, SectionHeading } from '../../components/ui/Card'
import { DateInput, Field, Select, TextInput, Textarea } from '../../components/ui/Field'
import { imageAssets } from '../../mock/data'

function isValidDate(value: string) {
  return Boolean(value) && !Number.isNaN(new Date(`${value}T12:00:00`).getTime())
}

export function CreateTripPage() {
  const navigate = useNavigate()
  const { commands, currentUser, notify } = useTripWise()
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('2026-12-12')
  const [endDate, setEndDate] = useState('2026-12-18')
  const [description, setDescription] = useState('')
  const [budgetLimit, setBudgetLimit] = useState('50000')
  const [coverImageUrl, setCoverImageUrl] = useState(imageAssets.amalfi)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (name.trim().length < 3) nextErrors.name = 'Give your trip a name with at least 3 characters.'
    if (!startDate) nextErrors.startDate = 'Choose a start date.'
    else if (!isValidDate(startDate)) nextErrors.startDate = 'Choose a valid start date.'
    if (!endDate) nextErrors.endDate = 'Choose an end date.'
    else if (!isValidDate(endDate)) nextErrors.endDate = 'Choose a valid end date.'
    if (isValidDate(startDate) && isValidDate(endDate) && endDate < startDate) nextErrors.endDate = 'End date cannot be before the start date.'
    if (budgetLimit && (!Number.isFinite(Number(budgetLimit)) || Number(budgetLimit) < 0)) nextErrors.budgetLimit = 'Budget must be zero or more.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    setFormError(null)
    try {
      const trip = await commands.createTrip({
        name,
        description,
        startDate,
        endDate,
        budgetLimit: budgetLimit ? Number(budgetLimit) : undefined,
        coverImageUrl,
      })
      notify('Trip created. Let’s shape the first day.')
      navigate(`/trips/${trip.id}/builder`)
    } catch (error) {
      const message = getApiErrorMessage(error, 'We could not create this trip. Please try again.')
      setFormError(message)
      notify(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/55 hover:text-ink"><ArrowLeft size={16} />Back to dashboard</Link>
      <SectionHeading eyebrow="Start somewhere beautiful" title="Create a new trip" description="Set the outline first. You can add cities, activities, and the details that make it yours next." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <Card className="bg-white/60">
          <form className="space-y-6" onSubmit={submit} noValidate>
            <Field label="Trip name" htmlFor="trip-name" required error={errors.name}><TextInput id="trip-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Konkan Coast Slow Escape" error={errors.name} /></Field>
            <div className="grid gap-5 sm:grid-cols-2"><Field label="Start date" htmlFor="start-date" required error={errors.startDate}><DateInput id="start-date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></Field><Field label="End date" htmlFor="end-date" required error={errors.endDate}><DateInput id="end-date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></Field></div>
            <Field label="Description" htmlFor="trip-description" hint="A short note helps future-you remember the feeling of the trip."><Textarea id="trip-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A few words about what you want this trip to feel like..." /></Field>
            <div className="grid gap-5 sm:grid-cols-2"><Field label="Working budget" htmlFor="budget-limit" hint="Optional · used for budget warnings" error={errors.budgetLimit}><TextInput id="budget-limit" type="number" min="0" value={budgetLimit} onChange={(event) => setBudgetLimit(event.target.value)} placeholder="50000" error={errors.budgetLimit} /></Field><Field label="Currency" htmlFor="currency"><Select id="currency" options={[{ value: 'INR', label: '₹ Indian Rupee (INR)' }]} /></Field></div>
            <Field label="Cover image URL" htmlFor="cover-image" hint="Optional · use a public image URL for the trip cover"><div className="relative"><Image size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" aria-hidden="true" /><TextInput id="cover-image" value={coverImageUrl} onChange={(event) => setCoverImageUrl(event.target.value)} className="pl-10" /></div></Field>
            {formError ? <p role="alert" className="rounded-control border border-clay/30 bg-clay/5 px-3 py-2 text-sm font-medium text-clay">{formError}</p> : null}
            <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end"><Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={submitting}>Cancel</Button><Button type="submit" loading={submitting} icon={<Sparkles size={16} />}>Create trip</Button></div>
          </form>
        </Card>
        <Card padding="none" className="overflow-hidden bg-ink text-parchment">
          <div className="relative aspect-[1.2/1] overflow-hidden"><img src={coverImageUrl || imageAssets.amalfi} alt="Trip cover preview" className="size-full object-cover opacity-75" loading="lazy" decoding="async" /><div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" /><div className="absolute bottom-5 left-5 right-5"><p className="eyebrow text-parchment/60">Your next escape</p><p className="mt-2 font-display text-3xl leading-none">{name || 'A trip worth remembering'}</p><p className="mt-3 text-xs text-parchment/65">{startDate} → {endDate}</p></div></div>
          <div className="p-5"><p className="text-sm leading-6 text-parchment/70">You can always change the dates, add stops, and shape the itinerary as you go.</p></div>
        </Card>
      </div>
      <span className="sr-only">Signed in as {currentUser?.name || 'traveller'}.</span>
    </div>
  )
}
