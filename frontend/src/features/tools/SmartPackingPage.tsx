import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Luggage, PhoneCall, Plus, RotateCcw, ShieldAlert, Sparkles, Trash2 } from 'lucide-react'
import { useTripWise } from '../../state/useTripWise'
import { Card, SectionHeading } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

interface PackingItem {
  id: string
  name: string
  category: 'clothing' | 'electronics' | 'documents' | 'toiletries' | 'gear'
  weightKg: number
  checked: boolean
  essential?: boolean
}

const PRESET_PACKS: Record<string, { label: string; icon: string; items: PackingItem[] }> = {
  goa: {
    label: 'Goa Beach & Cruise',
    icon: '🏖️',
    items: [
      { id: 'g1', name: 'Government ID / Driving License', category: 'documents', weightKg: 0.1, checked: true, essential: true },
      { id: 'g2', name: 'Goa Flight & Taj Fort Aguada Voucher', category: 'documents', weightKg: 0.1, checked: true, essential: true },
      { id: 'g3', name: 'Swimwear, Boardshorts & Beach Towel', category: 'clothing', weightKg: 0.8, checked: false, essential: true },
      { id: 'g4', name: 'Sunscreen (SPF 50+ PA++++) & Aftersun Gel', category: 'toiletries', weightKg: 0.4, checked: false, essential: true },
      { id: 'g5', name: 'Waterproof Phone Pouch for Scuba / Watersports', category: 'electronics', weightKg: 0.1, checked: false },
      { id: 'g6', name: 'Polarized UV Sunglasses & Fedora Hat', category: 'clothing', weightKg: 0.3, checked: false },
      { id: 'g7', name: 'Breathable Linen Shirts & Shorts (4 sets)', category: 'clothing', weightKg: 1.4, checked: false },
      { id: 'g8', name: 'Flip-Flops & Casual Deck Shoes', category: 'clothing', weightKg: 0.9, checked: false },
      { id: 'g9', name: 'Mosquito Repellent Spray & Ointment', category: 'toiletries', weightKg: 0.2, checked: false },
      { id: 'g10', name: 'Power Bank 20,000mAh & Fast Charger', category: 'electronics', weightKg: 0.5, checked: false, essential: true },
    ]
  },
  kashmir: {
    label: 'Kashmir & Gulmarg Snow',
    icon: '❄️',
    items: [
      { id: 'k1', name: 'Aadhaar / Voter ID & Gondola Tickets', category: 'documents', weightKg: 0.1, checked: true, essential: true },
      { id: 'k2', name: 'Down Feather Parka Jacket (-10°C rated)', category: 'clothing', weightKg: 1.8, checked: false, essential: true },
      { id: 'k3', name: 'Merino Wool Thermal Inners (Top & Bottom)', category: 'clothing', weightKg: 0.7, checked: false, essential: true },
      { id: 'k4', name: 'Waterproof Snow Boots with Grip Sole', category: 'clothing', weightKg: 1.6, checked: false, essential: true },
      { id: 'k5', name: 'Fleece-lined Beanie, Neck Gaiter & Snow Gloves', category: 'clothing', weightKg: 0.4, checked: false, essential: true },
      { id: 'k6', name: 'High-Altitude Moisturizer & Lip Butter', category: 'toiletries', weightKg: 0.3, checked: false },
      { id: 'k7', name: 'Hand Warmer Heat Packs (Reusable)', category: 'gear', weightKg: 0.4, checked: false },
      { id: 'k8', name: 'Action Camera / GoPro with extra cold-weather batteries', category: 'electronics', weightKg: 0.6, checked: false },
    ]
  },
  dubai: {
    label: 'Dubai & Desert Safari',
    icon: '🏙️',
    items: [
      { id: 'd1', name: 'Passport (6+ Months Validity) & UAE Tourist eVisa', category: 'documents', weightKg: 0.1, checked: true, essential: true },
      { id: 'd2', name: 'Emirates Flight & Atlantis Resort Booking', category: 'documents', weightKg: 0.1, checked: true, essential: true },
      { id: 'd3', name: 'Multi-Currency Forex Card (AED Loaded)', category: 'documents', weightKg: 0.1, checked: true, essential: true },
      { id: 'd4', name: 'Smart Casual Outfits (Fine Dining & Lounges)', category: 'clothing', weightKg: 1.8, checked: false },
      { id: 'd5', name: 'Universal UK 3-Pin Travel Plug Adapter', category: 'electronics', weightKg: 0.2, checked: false, essential: true },
      { id: 'd6', name: 'Sand-Resistant Sunglasses & Scarf for Desert Safari', category: 'gear', weightKg: 0.3, checked: false },
      { id: 'd7', name: 'Cooling Mist Spray & Hydration Electrolytes', category: 'toiletries', weightKg: 0.4, checked: false },
    ]
  }
}

export function SmartPackingPage() {
  const { notify } = useTripWise()
  const [items, setItems] = useState<PackingItem[]>(() => {
    const saved = localStorage.getItem('GLOBETROTTER_PACKING_ITEMS_V2')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return PRESET_PACKS.goa.items
      }
    }
    return PRESET_PACKS.goa.items
  })

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [newItemName, setNewItemName] = useState('')
  const [newItemCategory, setNewItemCategory] = useState<PackingItem['category']>('clothing')
  const [newItemWeight, setNewItemWeight] = useState('0.5')

  useEffect(() => {
    localStorage.setItem('GLOBETROTTER_PACKING_ITEMS_V2', JSON.stringify(items))
  }, [items])

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    )
  }

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    notify('Item removed from checklist.')
  }

  const addItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim()) return
    const newItem: PackingItem = {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      weightKg: parseFloat(newItemWeight) || 0.5,
      checked: false,
    }
    setItems((prev) => [newItem, ...prev])
    setNewItemName('')
    notify('Item added to packing list!')
  }

  const handleApplyPreset = (presetKey: string) => {
    const preset = PRESET_PACKS[presetKey]
    if (!preset) return
    setItems(preset.items)
    notify(`✨ Applied ${preset.label} packing template!`)
  }

  const handlePackAll = () => {
    setItems((prev) => prev.map((i) => ({ ...i, checked: true })))
    notify('All items marked as packed!')
  }

  const handleResetAll = () => {
    setItems((prev) => prev.map((i) => ({ ...i, checked: false })))
    notify('Checklist reset.')
  }

  const checkedCount = items.filter((i) => i.checked).length
  const percentPacked = items.length ? Math.round((checkedCount / items.length) * 100) : 0
  const totalWeightKg = items.reduce((sum, item) => sum + (item.weightKg || 0.4), 0).toFixed(1)
  const packedWeightKg = items.filter((i) => i.checked).reduce((sum, item) => sum + (item.weightKg || 0.4), 0).toFixed(1)

  const filteredItems = items.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  )

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Luggage & Safety Radar"
          title="Smart Packing & Weight Estimator"
          description="Weather-adaptive packing checklist, baggage allowance meter, and 24/7 SOS helpline."
        />
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" icon={<RotateCcw size={14} />} onClick={handleResetAll}>
            Reset
          </Button>
          <Button size="sm" icon={<CheckCircle2 size={14} />} onClick={handlePackAll}>
            Pack All
          </Button>
        </div>
      </div>

      {/* Preset Destination Quick Selector */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Sparkles size={16} className="text-[#4F46E5]" />
          <span>Quick Destination Templates:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRESET_PACKS).map(([key, pack]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-900 hover:text-white transition-all cursor-pointer"
            >
              <span>{pack.icon}</span>
              <span>{pack.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Packing Checklist */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            {/* Progress Header with Baggage Weight Gauge */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Packing & Weight Status</span>
                <h3 className="font-display text-2xl font-bold text-slate-900">
                  {checkedCount} of {items.length} Packed ({percentPacked}%)
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Luggage Weight</p>
                  <p className="font-display text-lg font-bold text-slate-900 flex items-center justify-end gap-1">
                    <Luggage size={16} className="text-indigo-600" /> {packedWeightKg} / {totalWeightKg} kg
                  </p>
                </div>
                <Badge tone={percentPacked === 100 ? 'sage' : 'clay'}>
                  {percentPacked === 100 ? '✓ Ready to Fly' : `${items.length - checkedCount} Remaining`}
                </Badge>
              </div>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={addItem} className="mt-4 flex flex-wrap gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="+ Add personal item (e.g. Scuba Mask, Drone, Jacket)"
                className="flex-1 min-w-[200px] px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5] bg-slate-50 font-medium"
              />
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as any)}
                className="px-3 py-2 rounded-2xl border border-slate-200 text-xs bg-white font-semibold"
              >
                <option value="clothing">Clothing</option>
                <option value="electronics">Electronics</option>
                <option value="documents">Documents</option>
                <option value="toiletries">Toiletries</option>
                <option value="gear">Gear</option>
              </select>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="30"
                value={newItemWeight}
                onChange={(e) => setNewItemWeight(e.target.value)}
                placeholder="0.5 kg"
                className="w-20 px-3 py-2 rounded-2xl border border-slate-200 text-xs bg-white font-semibold text-center"
                title="Estimated weight in kg"
              />
              <Button type="submit" size="sm" icon={<Plus size={15} />} className="rounded-2xl">Add Item</Button>
            </form>

            {/* Category Filter Tabs */}
            <div className="mt-4 flex flex-wrap gap-1.5 border-b border-line pb-3">
              {['all', 'clothing', 'electronics', 'documents', 'toiletries', 'gear'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                    activeCategory === cat
                      ? 'bg-[#0F172A] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Item List */}
            <div className="mt-4 divide-y divide-line">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="py-3 flex items-center justify-between gap-3 cursor-pointer group hover:bg-slate-50/60 rounded-xl px-2 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {item.checked ? (
                      <CheckCircle2 size={20} className="text-[#10B981] shrink-0" />
                    ) : (
                      <Circle size={20} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        item.checked
                          ? 'line-through text-slate-400 font-normal'
                          : 'text-slate-800 font-medium'
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.essential && (
                      <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        Essential
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteItem(item.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 transition-opacity"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: SOS Emergency Assistance Module */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-[#0A192F] text-white">
            <div className="flex items-center gap-2 text-[#B4F056]">
              <ShieldAlert size={22} />
              <h3 className="font-display text-xl font-bold">24/7 Emergency SOS</h3>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Official Indian National & State Tourist Emergency Helpline Numbers. Tap to call directly.
            </p>

            <div className="mt-5 space-y-3">
              <a
                href="tel:1363"
                className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs border border-white/10"
              >
                <div>
                  <p className="font-bold text-white">National Tourist Helpline</p>
                  <p className="text-[11px] text-slate-300">Multi-lingual 24x7 Guide</p>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-[#B4F056]">
                  <PhoneCall size={14} /> 1363
                </div>
              </a>

              <a
                href="tel:112"
                className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs border border-white/10"
              >
                <div>
                  <p className="font-bold text-white">National Emergency (All-in-One)</p>
                  <p className="text-[11px] text-slate-300">Police, Fire, Ambulance</p>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-[#B4F056]">
                  <PhoneCall size={14} /> 112
                </div>
              </a>

              <a
                href="tel:1091"
                className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs border border-white/10"
              >
                <div>
                  <p className="font-bold text-white">Women Safety Helpline</p>
                  <p className="text-[11px] text-slate-300">Instant Police Dispatch</p>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-[#B4F056]">
                  <PhoneCall size={14} /> 1091
                </div>
              </a>

              <a
                href="tel:108"
                className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs border border-white/10"
              >
                <div>
                  <p className="font-bold text-white">Medical Emergency & Ambulance</p>
                  <p className="text-[11px] text-slate-300">Fast Medical Care</p>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-[#B4F056]">
                  <PhoneCall size={14} /> 108
                </div>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
