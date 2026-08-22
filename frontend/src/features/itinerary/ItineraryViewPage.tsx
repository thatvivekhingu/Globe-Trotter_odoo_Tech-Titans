import { ArrowLeft, CalendarDays, Clock3, Download, FileText, MapPin, Share2, WalletCards } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useTripData } from '../../hooks/useTripSelectors'
import { useTripWise } from '../../state/useTripWise'
import { formatCategoryLabel, formatCurrency, formatDateRange, formatDuration, formatLongDate, formatTime } from '../../lib/formatters'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, SectionHeading } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/Feedback'
import { downloadIcsFile, downloadPdfItinerary } from '../../lib/exportUtils'
import { LiveWeatherWidget } from '../../components/weather/LiveWeatherWidget'

export function ItineraryViewPage() {
  const { tripId } = useParams()
  const { state, notify } = useTripWise()
  const data = useTripData(tripId)
  if (!data) return <EmptyState title="Itinerary not found" description="This trip may have moved or been removed." action={<Button asChild><Link to="/trips">Back to my trips</Link></Button>} />

  const firstCity = data.stops[0] ? data.cityForStop(data.stops[0].id) : undefined

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to={`/trips/${data.trip.id}/builder`} className="inline-flex items-center gap-2 text-sm font-semibold text-ink/55 hover:text-ink">
          <ArrowLeft size={16} />Edit in Builder
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="soft"
            size="sm"
            icon={<Download size={15} />}
            onClick={() => {
              downloadIcsFile(data.trip, data.activities, state.db.activities, state.db.cities, data.stops)
              notify('Sync file (.ics) downloaded for Calendar!')
            }}
          >
            Google / Apple Calendar (.ics)
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<FileText size={15} />}
            onClick={() => {
              downloadPdfItinerary(data.trip, data.stops, data.activities, state.db.activities, state.db.cities, data.budget.total)
              notify('Official PDF Itinerary downloaded!')
            }}
          >
            Download PDF
          </Button>

          <Button
            size="sm"
            icon={<Share2 size={15} />}
            onClick={() => {
              navigator.clipboard?.writeText(`${window.location.origin}/shared/konkan-express`)
              notify('Share link copied to clipboard!')
            }}
          >
            Share
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-card border border-line bg-ink px-6 py-10 text-parchment sm:px-10 sm:py-14">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 80% 16%, #85b09a 0 80px, transparent 81px), radial-gradient(circle at 10% 100%, #a45a52 0 120px, transparent 121px)' }} />
        <div className="relative max-w-2xl">
          <p className="eyebrow text-parchment/60">Your route, in full</p>
          <h1 className="mt-4 font-display text-5xl font-medium leading-[0.95] tracking-[-0.055em] sm:text-7xl">{data.trip.name}</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-parchment/70">{data.trip.description}</p>
          <div className="mt-7 flex flex-wrap gap-3 text-xs text-parchment/72">
            <span className="flex items-center gap-1.5"><CalendarDays size={14} />{formatDateRange(data.trip.startDate, data.trip.endDate)}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} />{data.stops.map((stop) => data.cityForStop(stop.id)?.name).filter(Boolean).join(' · ')}</span>
          </div>
        </div>
      </div>

      {/* Live Destination Forecast Widget */}
      {firstCity && (
        <LiveWeatherWidget city={firstCity} />
      )}

      <SectionHeading
        eyebrow="The itinerary"
        title="A Day-by-Day Story"
        description="A clear view of the route, with just enough detail to leave room for the unexpected."
      />

      <div className="space-y-4">
        {data.days.map((date, index) => {
          const stop = data.stops.find((item) => date >= item.arrivalDate && date <= item.departureDate)
          const city = stop ? data.cityForStop(stop.id) : undefined
          const activities = data.activities.filter((activity) => activity.date === date)
          return (
            <Card key={date} className="bg-white/55">
              <div className="flex flex-col gap-5 sm:flex-row">
                <div className="flex shrink-0 gap-4 sm:w-44 sm:flex-col sm:gap-2">
                  <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-control bg-sage/25">
                    <span className="text-[0.6rem] uppercase tracking-[0.1em] text-ink/55">Day</span>
                    <span className="font-display text-xl leading-none">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-display text-2xl text-ink">{city?.name || 'Open day'}</p>
                    <p className="mt-1 text-xs text-ink/50">{formatLongDate(date)}</p>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  {activities.length ? (
                    <div className="divide-y divide-line border-y border-line">
                      {activities.map((tripActivity, actIdx) => {
                        const activity = data.activityForTripActivity(tripActivity.id)
                        return activity ? (
                          <div key={tripActivity.id}>
                            {actIdx > 0 && (
                              <div className="py-1.5 px-3 bg-slate-50 border-l-2 border-indigo-400 my-1 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">🚗 ~25 mins drive via local route</span>
                                <span className="text-slate-400">Est. Cab: ₹350 - ₹450</span>
                              </div>
                            )}
                            <div className="flex items-start gap-3 py-3.5">
                              <div className="mt-1 size-2 shrink-0 rounded-full bg-clay" />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-semibold text-sm text-ink">{activity.name}</h3>
                                  <Badge>{formatCategoryLabel(activity.category)}</Badge>
                                </div>
                                <p className="body-copy mt-1 text-xs">{activity.description}</p>
                                <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink/50">
                                  <span className="flex items-center gap-1"><Clock3 size={12} />{formatTime(tripActivity.startTime)}</span>
                                  <span>{formatDuration(tripActivity.durationMinutes)}</span>
                                </p>
                              </div>
                              <p className="shrink-0 text-xs font-semibold text-ink/60">
                                {tripActivity.estimatedCost ? formatCurrency(tripActivity.estimatedCost) : 'Free'}
                              </p>
                            </div>
                          </div>
                        ) : null
                      })}
                    </div>
                  ) : (
                    <p className="rounded-control border border-dashed border-line px-4 py-5 text-sm text-ink/50">
                      A little space is waiting here. Add an anchor if you need one.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-ink text-parchment">
          <WalletCards size={19} className="text-sage" />
          <p className="eyebrow mt-5 text-parchment/60">Estimated budget</p>
          <p className="mt-2 font-display text-3xl">{formatCurrency(data.budget.total)}</p>
          <Link to={`/trips/${data.trip.id}/budget`} className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-parchment/70 hover:text-white">
            Review breakdown →
          </Link>
        </Card>
        <Card>
          <p className="eyebrow">Cities</p>
          <p className="mt-2 font-display text-3xl text-ink">{data.stops.length}</p>
          <p className="mt-1 text-xs text-ink/50">stops on the route</p>
        </Card>
        <Card>
          <p className="eyebrow">Anchors</p>
          <p className="mt-2 font-display text-3xl text-ink">{data.activities.length}</p>
          <p className="mt-1 text-xs text-ink/50">planned moments</p>
        </Card>
      </div>
    </div>
  )
}
