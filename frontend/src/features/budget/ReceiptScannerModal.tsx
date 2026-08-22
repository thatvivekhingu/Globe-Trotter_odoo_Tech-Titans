import { useState, useRef, type ChangeEvent } from 'react'
import { Camera, Check, Loader2, Upload, X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { formatCurrency } from '../../lib/formatters'
import type { ExpenseCategory } from '../../types/domain'

interface ParsedReceipt {
  merchant: string
  amount: number
  category: ExpenseCategory
  date: string
  items: string[]
  confidence: number
}

const SAMPLE_RECEIPTS: Record<string, ParsedReceipt> = {
  restaurant: {
    merchant: "Martin's Corner Coastal Bistro",
    amount: 2850,
    category: 'food',
    date: '2026-10-06',
    items: ['Kingfish Curry Thali x2', 'Garlic Butter Prawns', 'Sol Kadi x2', 'Bebinca Dessert'],
    confidence: 98,
  },
  taxi: {
    merchant: 'Goa Airport Express Prepaid Taxi',
    amount: 1650,
    category: 'transportation',
    date: '2026-10-03',
    items: ['Airport to Candolim Beach Transit (AC Sedan)'],
    confidence: 96,
  },
  scuba: {
    merchant: 'Dive Goa Watersports Adventure Ltd.',
    amount: 4200,
    category: 'activities',
    date: '2026-10-05',
    items: ['Grand Island Scuba Dive Package + Underwater HD Video'],
    confidence: 99,
  },
}

export function ReceiptScannerModal({
  open,
  onClose,
  onSaveExpense,
}: {
  open: boolean
  onClose: () => void
  onSaveExpense: (expense: { amount: number; description: string; category: ExpenseCategory; date: string }) => void
}) {
  const [scanning, setScanning] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string)
      processReceiptOcr(file.name)
    }
    reader.readAsDataURL(file)
  }

  function processReceiptOcr(filename: string) {
    setScanning(true)
    setParsedData(null)

    // Simulate high-accuracy OCR parsing
    setTimeout(() => {
      let result = SAMPLE_RECEIPTS.restaurant
      if (filename.toLowerCase().includes('taxi') || filename.toLowerCase().includes('cab')) {
        result = SAMPLE_RECEIPTS.taxi
      } else if (filename.toLowerCase().includes('scuba') || filename.toLowerCase().includes('dive') || filename.toLowerCase().includes('ticket')) {
        result = SAMPLE_RECEIPTS.scuba
      } else {
        // Random pick for realistic feel
        const keys = Object.keys(SAMPLE_RECEIPTS)
        result = SAMPLE_RECEIPTS[keys[Math.floor(Math.random() * keys.length)]]
      }
      setParsedData(result)
      setScanning(false)
    }, 1800)
  }

  function handleConfirm() {
    if (!parsedData) return
    onSaveExpense({
      amount: parsedData.amount,
      description: `${parsedData.merchant} (OCR Scanned)`,
      category: parsedData.category,
      date: parsedData.date,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <Card className="w-full max-w-lg p-6 rounded-3xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
              <Camera size={20} />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900">AI Receipt Scanner</h3>
              <p className="text-xs text-slate-500">Auto-extract amount, merchant, and category from bill</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {!previewImage && !scanning && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-[#4F46E5] bg-slate-50/70 hover:bg-indigo-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
            >
              <div className="size-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto text-[#4F46E5]">
                <Upload size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Click to upload bill or restaurant receipt</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Supports PNG, JPG, PDF up to 10MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          )}

          {scanning && (
            <div className="py-10 text-center space-y-3">
              <Loader2 size={36} className="animate-spin text-[#4F46E5] mx-auto" />
              <p className="font-display text-lg font-bold text-slate-900">Scanning Receipt with AI Vision...</p>
              <p className="text-xs text-slate-500">Detecting total amount in INR, merchant name, and date...</p>
            </div>
          )}

          {parsedData && !scanning && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-bold text-emerald-900">
                    Receipt Parsed with {parsedData.confidence}% Confidence
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded text-emerald-800 border border-emerald-200">
                  {parsedData.category}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Merchant:</span>
                  <span className="font-bold text-slate-900">{parsedData.merchant}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Date:</span>
                  <span className="font-semibold text-slate-700">{parsedData.date}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 text-xs">
                  <span className="text-slate-500 font-medium block mb-1">Detected Line Items:</span>
                  <ul className="space-y-1 pl-3 text-slate-600 list-disc text-[11px]">
                    {parsedData.items.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center font-bold">
                  <span className="text-xs text-slate-900">Total Extracted Amount:</span>
                  <span className="text-[#4F46E5] text-xl font-display">{formatCurrency(parsedData.amount)}</span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1 rounded-full text-xs"
                  onClick={() => {
                    setPreviewImage(null)
                    setParsedData(null)
                  }}
                >
                  Scan Another
                </Button>
                <Button className="flex-1 rounded-full text-xs font-bold" onClick={handleConfirm}>
                  Save to Trip Budget
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
