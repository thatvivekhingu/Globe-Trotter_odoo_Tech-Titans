import { useState } from 'react'
import { Check, Crown, Sparkles } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useTripWise } from '../../state/useTripWise'

const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Solo Explorer',
    badge: 'Starter',
    price: '₹0',
    period: 'forever free',
    description: 'Essential travel planning tools for solo backpackers and casual weekenders.',
    features: [
      'Up to 3 Active Trip Itineraries',
      'Access to all 30 Indian Destination Guides',
      'Basic AI Route Planner (Gemini & Rule Engine)',
      'Offline PDF Itinerary & .ICS Calendar Export',
      'Splitwise Debt Minimization Engine',
      'Basic Packing Checklist & 24/7 SOS Numbers',
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    id: 'pro',
    name: 'GlobeTrotter Pro',
    badge: 'Most Popular',
    price: '₹499',
    period: 'per month / billed annually',
    description: 'For active travelers who want sub-second AI inference, voice assistant, and OCR.',
    features: [
      'Unlimited Active Trips & Stops',
      'Sub-Second Groq LLaMA 3.3 & GPT-OSS 120B AI',
      '🎙️ Voice Speech-to-Text & Audio Playback',
      '📸 Neural Tesseract.js Receipt OCR Scanner',
      '⚡ Intelligent Traveling Salesperson Route Optimizer',
      '✈️ Live Flight & Boutique Hotel Razorpay Booking',
      '👥 Invisible Cross-Tab Live Multiplayer Sync',
      'Priority 24/7 Concierge Support',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Odoo Enterprise ERP',
    badge: 'For Companies & Teams',
    price: '₹2,499',
    period: 'per organization / month',
    description: 'Corporate travel management, GST compliance, and seamless Odoo ERP integration.',
    features: [
      'Everything in Pro for up to 50 employees',
      '🔐 Multi-User RBAC (Admin, Manager, Traveler, Guest)',
      '🏢 Direct Odoo hr.expense Reimbursement Sync',
      '📄 Odoo account.move GST Tax Invoicing',
      '📊 Executive Analytics, KPI Dashboards & CSV Export',
      '📜 Chronological Multi-User Audit Trail Log',
      'Custom Corporate Travel Policy & Per-Diem Rules',
      'Dedicated Account Manager & SLA Guarantee',
    ],
    cta: 'Connect Odoo ERP',
    popular: false,
  },
]

export function PricingPage() {
  const { notify } = useTripWise()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual')

  function handleSelectPlan(planName: string) {
    notify(`🎉 Plan "${planName}" selected! Account tier upgraded successfully.`)
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-bold uppercase tracking-wider">
          <Sparkles size={13} className="text-[#4F46E5]" /> Transparent SaaS Monetization
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Plans for Every Traveler & Organization
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto">
          From solo adventurers to corporate travel managers using Odoo ERP — choose the tier that powers your journey.
        </p>

        {/* Annual / Monthly Toggle */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
            Monthly Billing
          </span>
          <button
            type="button"
            onClick={() => setBillingCycle(billingCycle === 'annual' ? 'monthly' : 'annual')}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              billingCycle === 'annual' ? 'bg-[#4F46E5]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                billingCycle === 'annual' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-500'}`}>
            Annual Billing
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {PRICING_TIERS.map((tier) => (
          <Card
            key={tier.id}
            className={`p-7 rounded-3xl flex flex-col justify-between transition-all ${
              tier.popular
                ? 'border-2 border-[#4F46E5] bg-white shadow-xl ring-4 ring-indigo-50 relative'
                : 'border border-slate-200 bg-white/90 shadow-xs hover:shadow-md'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#4F46E5] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Crown size={12} /> {tier.badge}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{tier.name}</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-slate-900">{tier.price}</span>
                  <span className="text-xs text-slate-500 font-medium">{tier.period}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{tier.description}</p>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2.5">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Features Included:</p>
                <ul className="space-y-2 text-xs text-slate-600">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="size-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <Button
                onClick={() => handleSelectPlan(tier.name)}
                variant={tier.popular ? 'primary' : 'secondary'}
                className={`w-full rounded-full text-xs font-bold ${tier.popular ? 'shadow-md shadow-indigo-500/20' : ''}`}
              >
                {tier.cta}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Enterprise / Corporate Callout */}
      <Card className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-display text-lg font-bold text-white">Need Custom Odoo ERP Connectors or On-Premise Deployment?</h4>
          <p className="text-xs text-slate-400">We support custom XML-RPC bridges, custom authentication SSO (OAuth2 / SAML), and private cloud hosting.</p>
        </div>
        <Button variant="secondary" className="shrink-0 rounded-full text-xs" onClick={() => notify('Corporate Sales Inquiry recorded!')}>
          Contact Enterprise Sales
        </Button>
      </Card>
    </div>
  )
}
