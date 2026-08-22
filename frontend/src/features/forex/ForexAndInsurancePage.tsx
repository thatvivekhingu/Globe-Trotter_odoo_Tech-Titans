import { useState } from 'react'
import { ArrowRightLeft, Check, CreditCard, DollarSign, ShieldCheck, Truck } from 'lucide-react'
import { Card, SectionHeading } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useTripWise } from '../../state/useTripWise'
import { formatCurrency } from '../../lib/formatters'

interface CurrencyRate {
  code: string
  name: string
  flag: string
  buyRate: number // 1 unit in INR
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

const INSURANCE_PLANS = [
  {
    id: 'schengen',
    title: 'Schengen & Europe Visa Plan',
    badge: 'Embassy Approved',
    coverAmount: '€30,000 (~₹32 Lakhs)',
    premium: 899,
    features: [
      '100% Mandatory Schengen Visa Compliant',
      'Medical Emergency & Hospitalization €30,000',
      'Emergency Medical Evacuation & Repatriation',
      'Loss of Checked-in Baggage (up to ₹65,000)',
      'Trip Cancellation & Delay Reimbursement',
      'Zero Deductible on In-Patient Hospital bills',
    ],
  },
  {
    id: 'asia',
    title: 'Southeast Asia & Dubai Explorer',
    badge: 'Popular for Bali/Thailand',
    coverAmount: '$50,000 (~₹46 Lakhs)',
    premium: 549,
    features: [
      'Cashless Hospitalization in 5,000+ Asian hospitals',
      'Flight Delay & Missed Connection Cover',
      'Scuba Diving & Adventure Sports Cover',
      'Emergency Passport & Document Replacement',
      'COVID-19 Medical & Quarantine Cover',
      '24/7 International Multilingual Helpline',
    ],
  },
  {
    id: 'usa',
    title: 'USA & Global Comprehensive Plan',
    badge: 'Maximum Protection',
    coverAmount: '$100,000 (~₹92 Lakhs)',
    premium: 1450,
    features: [
      'High-Limit US Medical Expense Cover ($100k)',
      'Pre-existing Disease Life-Threatening Cover',
      'Baggage & Personal Laptop/Device Loss',
      'Emergency Family Travel & Compassionate Visit',
      'Home Burglary Insurance while traveling abroad',
      'Bail Bond & Legal Defense Assistance',
    ],
  },
]

export function ForexAndInsurancePage() {
  const { notify } = useTripWise()
  const [activeTab, setActiveTab] = useState<'forex' | 'insurance'>('forex')
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD')
  const [forexAmount, setForexAmount] = useState<number>(1000)
  const [pincode, setPincode] = useState<string>('110001')

  const currentRate = FOREX_RATES.find((r) => r.code === selectedCurrency)?.buyRate || 92.74
  const calculatedInr = Math.round(forexAmount * currentRate)

  function handleOrderForex() {
    notify(`🎉 Multi-Currency Forex Card (${selectedCurrency} ${forexAmount}) ordered! Doorstep delivery to PIN ${pincode}.`)
  }

  function handleBuyInsurance(planTitle: string, price: number) {
    notify(`🛡️ Travel Insurance "${planTitle}" (₹${price}) policy issued! Instant certificate generated.`)
  }

  return (
    <div className="space-y-9">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <DollarSign size={13} className="text-blue-600" /> BookMyForex & RBI Authorized Travel Hub
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Forex Card, Currency & Insurance
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Live interbank foreign exchange rates, zero markup Multi-Currency Travel Cards, and embassy-approved travel insurance.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('forex')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'forex' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CreditCard size={14} className={activeTab === 'forex' ? 'text-[#4F46E5]' : ''} />
            Forex & Currency
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('insurance')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'insurance' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck size={14} className={activeTab === 'insurance' ? 'text-emerald-600' : ''} />
            Travel Insurance
          </button>
        </div>
      </div>

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

      {activeTab === 'insurance' && (
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Instant Travel Protection"
            title="Embassy-Approved Travel Insurance"
            description="Guaranteed visa-compliant health & baggage insurance with zero deductibles and cashless claims in 150+ countries."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {INSURANCE_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {plan.badge}
                    </span>
                    <h3 className="font-display text-lg font-bold text-slate-900 mt-2">{plan.title}</h3>
                    <p className="text-xs text-slate-500">Max Medical Cover: <strong>{plan.coverAmount}</strong></p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-bold text-[#4F46E5]">{formatCurrency(plan.premium)}</span>
                    <span className="text-xs text-slate-400 font-medium">/ 10 days trip</span>
                  </div>

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
                  size="sm"
                  onClick={() => handleBuyInsurance(plan.title, plan.premium)}
                  className="w-full rounded-full text-xs font-bold"
                >
                  Buy Policy Certificate (₹{plan.premium})
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
