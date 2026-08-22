import { useState } from 'react'
import { ArrowRightLeft, Check, CheckCircle2, CreditCard, FileText, Luggage, Plane, ShieldCheck, Tag, Truck, Umbrella, X } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useTripWise } from '../../state/useTripWise'
import { formatCurrency } from '../../lib/formatters'
import { downloadInsuranceCertificate } from '../../lib/pdfCertificates'

interface CurrencyRate {
  code: string
  name: string
  flag: string
  buyRate: number
  sellRate: number
}

const FOREX_RATES: CurrencyRate[] = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', buyRate: 92.74, sellRate: 91.20 },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', buyRate: 108.30, sellRate: 106.50 },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', buyRate: 25.33, sellRate: 24.80 },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', buyRate: 73.07, sellRate: 71.90 },
  { code: 'THB', name: 'Thai Baht', flag: '🇹🇭', buyRate: 2.90, sellRate: 2.75 },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', buyRate: 124.50, sellRate: 122.80 },
  { code: 'JPY', name: 'Japanese Yen (100)', flag: '🇯🇵', buyRate: 62.40, sellRate: 60.80 },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', buyRate: 61.20, sellRate: 59.80 },
  { code: 'IDR', name: 'Indonesian Rupiah (10k)', flag: '🇮🇩', buyRate: 54.20, sellRate: 51.50 },
]

interface InsurancePlan {
  id: string
  title: string
  badge: string
  type: 'regular' | 'student' | 'annual' | 'senior'
  coverAmount: string
  grossPremium: number
  discountPct: number
  netPrice: number
  features: string[]
  partner: string
}

const MMT_INSURANCE_PLANS: InsurancePlan[] = [
  {
    id: 'thailand-asia',
    title: 'Thailand & Southeast Asia Smart Cover',
    badge: '40% Platform Co-Pay',
    type: 'regular',
    coverAmount: '$250,000 (~₹2.3 Crore)',
    grossPremium: 466,
    discountPct: 30,
    netPrice: 326,
    partner: 'Tata AIG General Insurance',
    features: [
      'Cashless Hospitalization in 5,000+ Global Hospitals',
      'Flight Delay Compensation (Flat payout for >1 hr delay)',
      'Passport Loss Replacement Cover (₹15,000)',
      'Checked-in Baggage Delay & Total Loss Reimbursement',
      'Adventure Sports & Scuba Diving Medical Protection',
      '100% Cashless Claims & 24x7 SOS Tele-Health Assistance',
    ],
  },
  {
    id: 'schengen-europe',
    title: 'Mandatory Schengen Visa Europe Plan',
    badge: '100% Embassy Approved',
    type: 'regular',
    coverAmount: '€30,000 (~₹32.5 Lakhs)',
    grossPremium: 980,
    discountPct: 25,
    netPrice: 735,
    partner: 'Tata AIG (UIN: TATTGOP25046V032425)',
    features: [
      '100% Visa Compliant for France, Germany, Italy, Switzerland',
      'Zero Deductible In-Patient Hospital Emergency Bills',
      'Emergency Medical Evacuation & Repatriation to India',
      'Loss of International Travel Documents & Passports',
      'Emergency Family Compassionate Visit Flight Covered',
      'Pre-existing Disease Life-Threatening Emergency Support',
    ],
  },
  {
    id: 'usa-global',
    title: 'USA & Global High-Limit Platinum Plan',
    badge: 'Maximum $500k Protection',
    type: 'regular',
    coverAmount: '$500,000 (~₹4.6 Crore)',
    grossPremium: 1850,
    discountPct: 35,
    netPrice: 1202,
    partner: 'Tata AIG Global Care',
    features: [
      'High-Limit US / Canada Hospitalization & ICU Cover',
      'Baggage & Personal Laptop/Electronics Protection',
      'Trip Cancellation & Curtailment Reimbursement',
      'Home Burglary Insurance while traveling abroad',
      'Personal Liability & Bail Bond Legal Support',
      'Immediate Cash Advance in case of robbery abroad',
    ],
  },
  {
    id: 'student-global',
    title: 'Global Student Overseas University Cover',
    badge: 'Valid for 2 Years',
    type: 'student',
    coverAmount: '$250,000 (~₹2.3 Crore)',
    grossPremium: 3200,
    discountPct: 30,
    netPrice: 2240,
    partner: 'Tata AIG EduShield',
    features: [
      'Meets US, UK, Canada & Australian University Waiver Criteria',
      'Study Interruption Fee Reimbursement (up to ₹5,00,000)',
      'Sponsor Protection in case of unforeseen demise',
      'Mental Health, Dental & Outpatient OPD Medical Care',
      'Emergency Medical Evacuation and repatriation',
    ],
  },
  {
    id: 'annual-multi',
    title: 'Annual Multi-Trip Corporate & Business Pass',
    badge: 'Frequent Flyers',
    type: 'annual',
    coverAmount: '$500,000 per trip',
    grossPremium: 5800,
    discountPct: 40,
    netPrice: 3480,
    partner: 'Tata AIG Corporate Care',
    features: [
      'Unlimited International Business & Leisure Trips for 365 Days',
      'Automatic Coverage every time you board an international flight',
      'Covers Missed Connections, Baggage Delay & Flight Cancellations',
      'Dedicated Corporate Concierge & Priority Claims Handler',
    ],
  },
]

export function ForexAndInsurancePage() {
  const { notify } = useTripWise()
  const [activeTab, setActiveTab] = useState<'insurance' | 'forex'>('insurance')
  
  // Forex State with Live Rates
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD')
  const [forexAmount, setForexAmount] = useState<number>(1000)
  const [pincode, setPincode] = useState<string>('110001')
  const [liveRates, setLiveRates] = useState<Record<string, number>>({})

  // Fetch real live currency rates
  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((res) => res.json())
      .then((data) => {
        if (data?.rates?.INR) {
          const usdInr = data.rates.INR
          const eurInr = usdInr / (data.rates.EUR || 0.92)
          const gbpInr = usdInr / (data.rates.GBP || 0.78)
          const aedInr = usdInr / (data.rates.AED || 3.67)
          const thbInr = usdInr / (data.rates.THB || 35.5)
          const sgdInr = usdInr / (data.rates.SGD || 1.34)
          setLiveRates({
            USD: Number(usdInr.toFixed(2)),
            EUR: Number(eurInr.toFixed(2)),
            GBP: Number(gbpInr.toFixed(2)),
            AED: Number(aedInr.toFixed(2)),
            THB: Number(thbInr.toFixed(2)),
            SGD: Number(sgdInr.toFixed(2)),
          })
        }
      })
      .catch(() => undefined)
  }, [])

  // Insurance Form State
  const [destCountry, setDestCountry] = useState('Thailand')
  const [startDate, setStartDate] = useState('2026-08-26')
  const [endDate, setEndDate] = useState('2026-08-31')
  const [numTravellers, setNumTravellers] = useState(1)
  const [planTypeFilter, setPlanTypeFilter] = useState<'all' | 'regular' | 'student' | 'annual'>('all')
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({
    flightDelay: true,
    passportLoss: true,
    baggageLoss: true,
  })

  // Selected Policy Modal
  const [activePolicy, setActivePolicy] = useState<InsurancePlan | null>(null)
  const [policyConfirmed, setPolicyConfirmed] = useState(false)

  const currentRate = liveRates[selectedCurrency] || FOREX_RATES.find((r) => r.code === selectedCurrency)?.buyRate || 92.74
  const calculatedInr = Math.round(forexAmount * currentRate)

  const filteredPlans = MMT_INSURANCE_PLANS.filter((p) => {
    if (planTypeFilter === 'all') return true
    return p.type === planTypeFilter
  })

  function toggleAddon(key: string) {
    setSelectedAddons((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleOrderForex() {
    notify(`🎉 Multi-Currency Forex Card (${selectedCurrency} ${forexAmount}) ordered! Doorstep delivery to PIN ${pincode}.`)
  }

  function handleInitiateInsurance(plan: InsurancePlan) {
    setActivePolicy(plan)
    setPolicyConfirmed(false)
  }

  function handleConfirmPolicy() {
    setPolicyConfirmed(true)
    notify(`🛡️ Instant Travel Insurance Policy issued for ${destCountry}! Certificate emailed.`)
  }

  return (
    <div className="space-y-9">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={13} className="text-blue-600" /> Tata AIG & MakeMyTrip Travel Protection Hub
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            International Travel Insurance & Forex
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            100% Cashless Claims in 150+ countries, mandatory Visa-compliant certificates, and zero-markup Multi-Currency Forex cards.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('insurance')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'insurance' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Umbrella size={14} className={activeTab === 'insurance' ? 'text-emerald-600' : ''} />
            Travel Insurance (40% Off)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('forex')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'forex' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CreditCard size={14} className={activeTab === 'forex' ? 'text-[#4F46E5]' : ''} />
            Forex & Currency
          </button>
        </div>
      </div>

      {activeTab === 'insurance' && (
        <div className="space-y-8">
          {/* Trust Banner Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-linear-to-r from-emerald-900 via-slate-900 to-indigo-950 p-5 rounded-3xl text-white shadow-xl border border-slate-800">
            <div className="text-center sm:text-left sm:border-r border-slate-700/60 sm:pr-4">
              <p className="font-display text-2xl font-bold text-emerald-400">99.2%</p>
              <p className="text-[11px] text-slate-300">Claim Settlement Ratio</p>
            </div>
            <div className="text-center sm:text-left sm:border-r border-slate-700/60 sm:pr-4">
              <p className="font-display text-2xl font-bold text-white">100% Cashless</p>
              <p className="text-[11px] text-slate-300">5,000+ Global Hospitals</p>
            </div>
            <div className="text-center sm:text-left sm:border-r border-slate-700/60 sm:pr-4">
              <p className="font-display text-2xl font-bold text-indigo-400">24x7 SOS</p>
              <p className="text-[11px] text-slate-300">Customer Care by Tata AIG</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="font-display text-2xl font-bold text-amber-400">12 Lakh+</p>
              <p className="text-[11px] text-slate-300">Happy Travelers Insured</p>
            </div>
          </div>

          {/* Interactive Plan Search & Filter Controls */}
          <Card className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">Configure Trip Protection</h3>
                <p className="text-xs text-slate-500">We cover up to 40% of insurance premium exclusively for your trip!</p>
              </div>
              <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full flex items-center gap-1">
                <Tag size={12} /> Instant Visa Certificate (No KYC Needed)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Travelling To</label>
                <select
                  value={destCountry}
                  onChange={(e) => setDestCountry(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value="Thailand">🇹🇭 Thailand (Asia)</option>
                  <option value="Dubai / UAE">🇦🇪 Dubai / UAE</option>
                  <option value="France / Schengen">🇫🇷 France / Schengen Area</option>
                  <option value="Indonesia (Bali)">🇮🇩 Indonesia (Bali)</option>
                  <option value="United States">🇺🇸 United States of America</option>
                  <option value="United Kingdom">🇬🇧 United Kingdom</option>
                  <option value="Singapore">🇸🇬 Singapore</option>
                  <option value="Japan">🇯🇵 Japan</option>
                  <option value="Vietnam">🇻🇳 Vietnam</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Departure Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Return Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Travellers</label>
                <select
                  value={numTravellers}
                  onChange={(e) => setNumTravellers(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value={1}>1 Adult (Age 6m - 70y)</option>
                  <option value={2}>2 Adults (Couple / Friends)</option>
                  <option value={3}>Family (2 Adults + 1 Child)</option>
                  <option value={4}>Family Group (4 Travellers)</option>
                </select>
              </div>
            </div>

            {/* Micro Protection Addons Checklist */}
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-bold text-slate-700 mb-2">Byte-Sized Micro Travel Protection (1-Click Add):</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  onClick={() => toggleAddon('flightDelay')}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedAddons.flightDelay ? 'border-[#4F46E5] bg-indigo-50/50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Plane size={16} className="text-[#4F46E5]" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Flight Delay Cover</p>
                      <p className="text-[10px] text-slate-500">Flat payout for 1hr delay</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={selectedAddons.flightDelay} readOnly className="accent-[#4F46E5]" />
                </label>

                <label
                  onClick={() => toggleAddon('passportLoss')}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedAddons.passportLoss ? 'border-[#4F46E5] bg-indigo-50/50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText size={16} className="text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Passport Loss Cover</p>
                      <p className="text-[10px] text-slate-500">Safeguard @ just ₹19</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={selectedAddons.passportLoss} readOnly className="accent-emerald-600" />
                </label>

                <label
                  onClick={() => toggleAddon('baggageLoss')}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedAddons.baggageLoss ? 'border-[#4F46E5] bg-indigo-50/50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Luggage size={16} className="text-amber-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Baggage Delay Protection</p>
                      <p className="text-[10px] text-slate-500">Instant claims on delay</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={selectedAddons.baggageLoss} readOnly className="accent-amber-600" />
                </label>
              </div>
            </div>
          </Card>

          {/* Plan Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Recommended Plans' },
              { id: 'regular', label: '🏖️ Single & Family Trip' },
              { id: 'student', label: '🎓 Global Student (2 Years)' },
              { id: 'annual', label: '💼 Annual Multi-Trip (Frequent Flyers)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPlanTypeFilter(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  planTypeFilter === tab.id
                    ? 'bg-[#4F46E5] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Insurance Plans List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filteredPlans.map((plan) => (
              <Card
                key={plan.id}
                className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-5 group relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                      {plan.badge}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {plan.partner.split(' ')[0]}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-[#4F46E5] transition-colors">
                      {plan.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Medical Cover: <strong className="text-slate-800">{plan.coverAmount}</strong>
                    </p>
                  </div>

                  {/* Pricing Breakdown with 30-40% Discount */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Standard Premium:</span>
                      <span className="line-through">{formatCurrency(plan.grossPremium * numTravellers)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-emerald-700 font-semibold">
                      <span>MakeMyTrip Subsidy ({plan.discountPct}%):</span>
                      <span>- {formatCurrency(Math.round(plan.grossPremium * (plan.discountPct / 100) * numTravellers))}</span>
                    </div>
                    <div className="border-t border-indigo-200/60 pt-1.5 flex justify-between items-baseline">
                      <span className="text-xs font-bold text-slate-900">You Pay:</span>
                      <span className="font-display text-2xl font-bold text-[#4F46E5]">
                        {formatCurrency(plan.netPrice * numTravellers)}
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => handleInitiateInsurance(plan)}
                  className="w-full rounded-full text-xs font-bold shadow-md shadow-indigo-500/20"
                >
                  Buy Instant Policy ({formatCurrency(plan.netPrice * numTravellers)})
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'forex' && (
        <div className="space-y-8">
          {/* Live Rates Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {FOREX_RATES.slice(0, 5).map((r) => (
              <Card key={r.code} className="p-3.5 rounded-2xl border border-slate-200/80 bg-white text-center space-y-1">
                <span className="text-xl">{r.flag}</span>
                <p className="text-xs font-bold text-slate-900">{r.code}</p>
                <p className="font-display text-sm font-bold text-[#4F46E5]">₹{r.buyRate.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400">Zero Markup</p>
              </Card>
            ))}
          </div>

          {/* Forex Calculator & Card Order Widget */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <Card className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft size={18} className="text-[#4F46E5]" /> Live Currency Converter & Buy
                </h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  Lowest Rate Guarantee
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Select Foreign Currency</label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  >
                    {FOREX_RATES.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.flag} {r.name} ({r.code}) @ ₹{r.buyRate}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Enter Foreign Amount ({selectedCurrency})</label>
                  <input
                    type="number"
                    value={forexAmount}
                    onChange={(e) => setForexAmount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] text-slate-600 font-medium">Total Payable in Indian Rupees (INR):</p>
                  <p className="font-display text-2xl font-bold text-[#4F46E5] mt-0.5">
                    {formatCurrency(calculatedInr)}
                  </p>
                </div>
                <div className="text-right text-xs text-indigo-900 font-semibold">
                  <span>1 {selectedCurrency} = ₹{currentRate.toFixed(2)}</span>
                  <p className="text-[10px] text-emerald-700 font-bold">You save ~₹{(calculatedInr * 0.05).toFixed(0)} over bank credit cards!</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Delivery PIN Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter 6-digit Pincode"
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs w-48 font-mono"
                  />
                  <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <Truck size={14} /> Same-day Doorstep Delivery Available
                  </div>
                </div>
              </div>

              <Button
                onClick={handleOrderForex}
                className="w-full rounded-full text-xs font-bold py-3 shadow-md shadow-indigo-500/20"
              >
                Order Multi-Currency Forex Card (Zero Markup)
              </Button>
            </Card>

            {/* Prepaid Forex Card Benefits */}
            <Card className="lg:col-span-5 p-6 rounded-3xl bg-linear-to-br from-slate-900 to-indigo-950 text-white border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <div className="size-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center font-bold">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="font-display text-lg font-bold text-white">Co-branded YesBank Forex Card</h4>
                  <p className="text-[11px] text-indigo-200/70">Powered by BookMyForex • RBI Authorized</p>
                </div>
              </div>

              <div className="border-t border-indigo-900/60 pt-3 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero Forex Markup:</strong> Get exact interbank rates without the 3.5%-5% bank charge.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>40+ Currencies on 1 Card:</strong> Swipe in Paris, Tokyo, Dubai, or Bali seamlessly.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Chip & PIN + Fraud Insurance:</strong> 100% theft protection and emergency cash replacement.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-900/40 border border-indigo-800/50 text-[11px] text-indigo-100">
                📄 <strong>Required for delivery:</strong> Valid Passport, Indian PAN Card, and Air Tickets within 60 days.
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Insurance Purchase Confirmation Modal */}
      {activePolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    Instant Policy Checkout
                  </h3>
                  <p className="text-xs text-slate-500">{activePolicy.partner}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {!policyConfirmed ? (
              <div className="mt-5 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Destination:</span>
                    <span className="font-bold text-slate-900">{destCountry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Coverage Duration:</span>
                    <span className="font-semibold text-slate-700">{startDate} to {endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Insured Travelers:</span>
                    <span className="font-semibold text-slate-700">{numTravellers} Adult(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max Medical Sum Insured:</span>
                    <span className="font-bold text-emerald-700">{activePolicy.coverAmount}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">Total Premium Payable:</span>
                    <span className="font-display text-2xl font-bold text-[#4F46E5]">
                      {formatCurrency(activePolicy.netPrice * numTravellers)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">Primary Insured Traveler</label>
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
                  <Button variant="secondary" className="flex-1 rounded-full text-xs" onClick={() => setActivePolicy(null)}>
                    Cancel
                  </Button>
                  <Button className="flex-1 rounded-full text-xs font-bold" onClick={handleConfirmPolicy}>
                    Pay & Issue Policy
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center space-y-4">
                <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-slate-900">Policy Issued Successfully!</h3>
                  <p className="text-xs text-slate-500 mt-1">Policy No: <strong>TAT-TRV-2026-89412</strong></p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-1 text-xs">
                  <p className="text-emerald-950 font-bold">Embassy Visa Compliance Certificate Ready:</p>
                  <p className="text-emerald-800">Valid for {destCountry} visa application. Cashless claims helpline: <strong>1800-266-7780 (Toll Free)</strong>.</p>
                </div>
                <Button
                  className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  onClick={() => {
                    if (activePolicy) {
                      downloadInsuranceCertificate({
                        policyNumber: 'TAT-TRV-2026-89412',
                        travelerName: 'Aarav Mehta',
                        passportNumber: 'Z4892714',
                        destination: destCountry,
                        startDate,
                        endDate,
                        planTitle: activePolicy.title,
                        coverageAmount: activePolicy.coverAmount,
                        premiumPaid: activePolicy.netPrice * numTravellers,
                        partner: activePolicy.partner,
                      })
                      notify('📥 Official Embassy Insurance PDF Certificate downloaded!')
                    }
                    setActivePolicy(null)
                  }}
                >
                  Done & Download Official PDF Certificate
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
