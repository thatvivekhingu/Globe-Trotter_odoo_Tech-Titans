import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, PhoneCall, Plus, ShieldAlert, Trash2 } from 'lucide-react'
import { useTripWise } from '../../state/useTripWise'
import { Card, SectionHeading } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

interface PackingItem {
  id: string
  name: string
  category: 'clothing' | 'electronics' | 'documents' | 'toiletries' | 'gear'
  checked: boolean
  essential?: boolean
}

const defaultItems: PackingItem[] = [
  { id: 'p1', name: 'Government ID / Passport / Driving License', category: 'documents', checked: true, essential: true },
  { id: 'p2', name: 'Train / Flight e-Tickets & Hotel Confirmations', category: 'documents', checked: true, essential: true },
  { id: 'p3', name: 'Smartphone & Fast Charging Adapter', category: 'electronics', checked: true, essential: true },
  { id: 'p4', name: 'Power Bank (10,000+ mAh)', category: 'electronics', checked: false, essential: true },
  { id: 'p5', name: 'Prescription Medicines & First-Aid Bandages', category: 'toiletries', checked: false, essential: true },
  { id: 'p6', name: 'Sunscreen (SPF 50+) & Lip Balm', category: 'toiletries', checked: false },
  { id: 'p7', name: 'Comfortable Walking / Trail Shoes', category: 'clothing', checked: false, essential: true },
  { id: 'p8', name: 'Light Cotton / Quick-dry T-Shirts', category: 'clothing', checked: false },
  { id: 'p9', name: 'Thermal Layer / Light Jacket (Evenings)', category: 'clothing', checked: false },
  { id: 'p10', name: 'Reusable Water Bottle & Hydration Flask', category: 'gear', checked: false },
  { id: 'p11', name: 'Compact Rain Poncho / Umbrella', category: 'gear', checked: false },
  { id: 'p12', name: 'Universal Travel Adapter / Earbuds', category: 'electronics', checked: false },
]

export function SmartPackingPage() {
  const { notify } = useTripWise()
  const [items, setItems] = useState<PackingItem[]>(() => {
    const saved = localStorage.getItem('GLOBETROTTER_PACKING_ITEMS')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return defaultItems
      }
    }
    return defaultItems
  })

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [newItemName, setNewItemName] = useState('')
  const [newItemCategory, setNewItemCategory] = useState<PackingItem['category']>('clothing')

  useEffect(() => {
    localStorage.setItem('GLOBETROTTER_PACKING_ITEMS', JSON.stringify(items))
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
      checked: false,
    }
    setItems((prev) => [newItem, ...prev])
    setNewItemName('')
    notify('Item added to packing list!')
  }

  const checkedCount = items.filter((i) => i.checked).length
  const percentPacked = items.length ? Math.round((checkedCount / items.length) * 100) : 0

  const filteredItems = items.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  )

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <SectionHeading
        eyebrow="Trip Readiness"
        title="Smart Packing & Safety Kit"
        description="Smart destination-aware packing checklist and instant emergency SOS contacts."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Packing Checklist */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            {/* Progress Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <span className="eyebrow">Packing Progress</span>
                <h3 className="font-display text-2xl font-bold text-ink">
                  {checkedCount} of {items.length} Items Packed ({percentPacked}%)
                </h3>
              </div>
              <Badge tone={percentPacked === 100 ? 'sage' : 'clay'}>
                {percentPacked === 100 ? 'Ready to Travel!' : `${items.length - checkedCount} Remaining`}
              </Badge>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={addItem} className="mt-4 flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="+ Add personal item (e.g. Swim Goggles, Drone)"
                className="flex-1 px-4 py-2 rounded-full border border-line text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as any)}
                className="px-3 py-2 rounded-full border border-line text-xs bg-white"
              >
                <option value="clothing">Clothing</option>
                <option value="electronics">Electronics</option>
                <option value="documents">Documents</option>
                <option value="toiletries">Toiletries</option>
                <option value="gear">Gear</option>
              </select>
              <Button type="submit" size="sm" icon={<Plus size={15} />}>Add</Button>
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
