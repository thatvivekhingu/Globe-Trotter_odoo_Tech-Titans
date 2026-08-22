import { useState } from 'react'
import { Clock, FileCheck, Globe, Search, X } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useTripWise } from '../../state/useTripWise'
import { formatCurrency } from '../../lib/formatters'

interface VisaCountry {
  country: string
  flag: string
  type: 'e-Visa' | 'Visa on Arrival' | 'Visa Free' | 'Sticker Visa'
  validity: string
  fees: number
  processingTime: string
  guaranteedDelivery: string
  requiredDocs: string[]
  category: 'popular' | 'asia' | 'europe' | 'americas' | 'middle-east'
}

const VISA_CATALOG: VisaCountry[] = [
  {
    country: 'Thailand',
    flag: '🇹🇭',
    type: 'e-Visa',
    validity: '90 days',
    fees: 0,
    processingTime: '2 hours',
    guaranteedDelivery: 'Within 24 Hours',
    requiredDocs: ['Passport (6 mo validity)', 'Confirmed Return Flight', 'Hotel Booking Voucher'],
    category: 'popular',
  },
  {
    country: 'United Arab Emirates (Dubai)',
    flag: '🇦🇪',
    type: 'e-Visa',
    validity: '60 days',
    fees: 8049,
    processingTime: '3-4 days',
    guaranteedDelivery: '27 Aug 2026',
    requiredDocs: ['Passport Front/Back', 'Passport Photo', 'Pan Card'],
    category: 'popular',
  },
  {
    country: 'Sri Lanka',
    flag: '🇱🇰',
    type: 'e-Visa',
    validity: '180 days',
    fees: 0,
    processingTime: '1 day',
    guaranteedDelivery: '25 Aug 2026',
    requiredDocs: ['Passport Bio Page', 'Return Ticket'],
    category: 'asia',
  },
  {
    country: 'Malaysia',
    flag: '🇲🇾',
    type: 'e-Visa',
    validity: '30 days',
    fees: 0,
    processingTime: 'Instant',
    guaranteedDelivery: 'Within 3 Hours',
    requiredDocs: ['Passport Bio Page', 'Boarding Pass'],
    category: 'popular',
  },
  {
    country: 'Vietnam',
    flag: '🇻🇳',
    type: 'e-Visa',
    validity: '90 days',
    fees: 3100,
    processingTime: '3-5 days',
    guaranteedDelivery: '3 Sep 2026',
    requiredDocs: ['Passport Photo', 'Passport Copy', 'Entry/Exit Port Details'],
    category: 'popular',
  },
  {
    country: 'Indonesia (Bali)',
    flag: '🇮🇩',
    type: 'e-Visa',
    validity: '90 days',
    fees: 3324,
    processingTime: 'Same Day',
    guaranteedDelivery: 'Within 6 Hours',
    requiredDocs: ['Passport Copy', 'Proof of Funds', 'Return Ticket'],
    category: 'popular',
  },
  {
    country: 'Japan',
    flag: '🇯🇵',
    type: 'e-Visa',
    validity: '90 days',
    fees: 3750,
    processingTime: '5-7 days',
    guaranteedDelivery: '15 Sep 2026',
    requiredDocs: ['ITR 3 Years', 'Bank Statement (6 Months)', 'Day-by-Day Itinerary'],
    category: 'asia',
  },
  {
    country: 'United States of America',
    flag: '🇺🇸',
    type: 'Sticker Visa',
    validity: '10 years',
    fees: 18200,
    processingTime: 'Appointment Based',
    guaranteedDelivery: '19 Oct 2026',
    requiredDocs: ['DS-160 Confirmation', 'Interview Appointment Letter', 'Financial Proofs'],
    category: 'americas',
  },
  {
    country: 'United Kingdom (UK)',
    flag: '🇬🇧',
    type: 'e-Visa',
    validity: '180 days',
    fees: 23168,
    processingTime: '15 working days',
    guaranteedDelivery: '1 Oct 2026',
    requiredDocs: ['Bank Statement', 'Employment Letter', 'Accommodation Proof'],
    category: 'europe',
  },
  {
    country: 'France / Schengen Area',
    flag: '🇫🇷',
    type: 'Sticker Visa',
    validity: '30-90 days',
    fees: 7410,
    processingTime: '10-15 days',
    guaranteedDelivery: '10 Sep 2026',
    requiredDocs: ['€30,000 Travel Insurance', 'Roundtrip Flight Itinerary', 'Cover Letter & ITR'],
    category: 'europe',
  },
  {
    country: 'Switzerland',
    flag: '🇨🇭',
    type: 'Sticker Visa',
    validity: '30 days',
    fees: 8090,
    processingTime: '12 days',
    guaranteedDelivery: '25 Sep 2026',
    requiredDocs: ['Travel Insurance', 'Hotel Confirmations', 'Bank Statements'],
    category: 'europe',
  },
  {
    country: 'Singapore',
    flag: '🇸🇬',
    type: 'e-Visa',
    validity: '30 days',
    fees: 2500,
    processingTime: '2-3 days',
    guaranteedDelivery: '28 Aug 2026',
    requiredDocs: ['Passport', 'Form 14A', 'Cover Letter', 'Confirmed Flights'],
    category: 'asia',
  },
  {
    country: 'Maldives',
    flag: '🇲🇻',
    type: 'Visa Free',
    validity: '30 days',
    fees: 0,
    processingTime: 'On Arrival',
    guaranteedDelivery: 'Instant at Airport',
    requiredDocs: ['IMUGA Declaration Form', 'Pre-paid Hotel Booking'],
    category: 'popular',
  },
  {
    country: 'Mauritius',
    flag: '🇲🇺',
    type: 'Visa Free',
    validity: '60 days',
    fees: 0,
    processingTime: 'On Arrival',
    guaranteedDelivery: 'Instant at Airport',
    requiredDocs: ['Passport', 'Return Ticket', 'Hotel Voucher'],
    category: 'popular',
  },
  {
    country: 'Nepal',
    flag: '🇳🇵',
    type: 'Visa Free',
    validity: 'Unlimited',
    fees: 0,
    processingTime: 'Freedom of Movement',
    guaranteedDelivery: 'Voter ID / Passport Entry',
    requiredDocs: ['Indian Passport or Voter ID Card'],
    category: 'asia',
  },
]

export function VisaAssistancePage() {
  const { notify } = useTripWise()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [selectedCountry, setSelectedCountry] = useState<VisaCountry | null>(null)
  const [appliedSuccess, setAppliedSuccess] = useState(false)

  const filteredVisas = VISA_CATALOG.filter((v) => {
    const matchesSearch = v.country.toLowerCase().includes(searchTerm.toLowerCase())
    if (selectedFilter === 'all') return matchesSearch
    if (selectedFilter === 'e-visa') return matchesSearch && v.type === 'e-Visa'
    if (selectedFilter === 'free') return matchesSearch && (v.type === 'Visa Free' || v.type === 'Visa on Arrival')
    if (selectedFilter === 'sticker') return matchesSearch && v.type === 'Sticker Visa'
    return matchesSearch
  })

  function handleApplyVisa(country: VisaCountry) {
    setSelectedCountry(country)
    setAppliedSuccess(false)
  }

  function submitApplication() {
    setAppliedSuccess(true)
    notify(`✅ Visa application for ${selectedCountry?.country} initiated! Documents verified.`)
  }

  return (
    <div className="space-y-9">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Globe size={13} className="text-emerald-600" /> Global Visa Intelligence & e-Visa Gateway
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Online Visa to 120+ Countries
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Guaranteed on-time visa processing powered by verified embassy checklists, document scanners, and live tracking.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search country (e.g. Thailand, Japan)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-[#4F46E5] outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All 120+ Countries' },
          { id: 'e-visa', label: '⚡ Fast e-Visa (Online)' },
          { id: 'free', label: '🏖️ Visa Free & On Arrival' },
          { id: 'sticker', label: '📑 Embassy Sticker Visa' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedFilter === tab.id
                ? 'bg-[#4F46E5] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visa Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVisas.map((v) => (
          <Card
            key={v.country}
            className="p-5 rounded-3xl border border-slate-200/80 bg-white shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{v.flag}</span>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-[#4F46E5] transition-colors">
                      {v.country}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Valid: {v.validity}
                    </span>
                  </div>
                </div>

                <Badge
                  tone={
                    v.type === 'Visa Free'
                      ? 'sage'
                      : v.type === 'e-Visa'
                      ? 'clay'
                      : 'neutral'
                  }
                >
                  {v.type}
                </Badge>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Clock size={12} /> Expected Delivery:
                  </span>
                  <span className="font-bold text-emerald-700">{v.guaranteedDelivery}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Processing Time:</span>
                  <span className="font-semibold text-slate-700">{v.processingTime}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200/60 pt-1.5">
                  <span className="text-slate-900 font-bold">Government Fee:</span>
                  <span className="text-sm font-display font-bold text-[#4F46E5]">
                    {v.fees === 0 ? 'Free / ₹0' : formatCurrency(v.fees)}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-700">Documents Checklist:</p>
                <ul className="text-[11px] text-slate-500 space-y-0.5 pl-3 list-disc">
                  {v.requiredDocs.map((doc, idx) => (
                    <li key={idx} className="truncate">{doc}</li>
                  ))}
                </ul>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => handleApplyVisa(v)}
              className="w-full rounded-full text-xs font-bold"
            >
              Apply for {v.country} Visa
            </Button>
          </Card>
        ))}
      </div>

      {/* Visa Application Modal */}
      {selectedCountry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedCountry.flag}</span>
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    Apply for {selectedCountry.country} Visa
                  </h3>
                  <p className="text-xs text-slate-500">{selectedCountry.type} • {selectedCountry.validity} stay</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCountry(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {!appliedSuccess ? (
              <div className="mt-5 space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">Guaranteed On-Time Delivery:</span>
                    <span className="font-bold text-indigo-900">{selectedCountry.guaranteedDelivery}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">Embassy Visa Fee:</span>
                    <span className="font-bold text-indigo-900 font-display text-base">
                      {selectedCountry.fees === 0 ? 'Free (₹0)' : formatCurrency(selectedCountry.fees)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">1. Upload Indian Passport Copy (PDF / Image)</label>
                  <input
                    type="file"
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-[#4F46E5] hover:file:bg-indigo-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">2. Applicant Details</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      defaultValue="Aarav Mehta"
                      placeholder="Full Name as in Passport"
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs w-full"
                    />
                    <input
                      type="text"
                      defaultValue="Z4892714"
                      placeholder="Passport Number"
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button variant="secondary" className="flex-1 rounded-full text-xs" onClick={() => setSelectedCountry(null)}>
                    Cancel
                  </Button>
                  <Button className="flex-1 rounded-full text-xs font-bold" onClick={submitApplication}>
                    Submit Application
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center space-y-4">
                <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <FileCheck size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-slate-900">Application Submitted!</h3>
                  <p className="text-xs text-slate-500 mt-1">Application Ref: <strong>GT-VISA-94821</strong></p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-1.5 text-xs">
                  <p className="text-emerald-950 font-bold">Embassy Tracking Status:</p>
                  <p className="text-emerald-800 font-medium">Document Verification in Progress. Expected approved e-Visa on or before <strong>{selectedCountry.guaranteedDelivery}</strong>.</p>
                </div>
                <Button className="w-full rounded-full" onClick={() => setSelectedCountry(null)}>
                  Done & Track Status
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
