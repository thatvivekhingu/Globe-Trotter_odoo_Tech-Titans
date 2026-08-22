import { useState } from 'react'
import { ArrowRight, Check, Download, FileText, Plus, QrCode, Trash2, Users, Wallet, X } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { formatCurrency } from '../../lib/formatters'
import { useTripWise } from '../../state/useTripWise'

interface MemberExpense {
  id: string
  payer: string
  description: string
  amount: number
}

export function GroupSplitter() {
  const { notify } = useTripWise()
  const [members, setMembers] = useState<string[]>(['Priyanka', 'Aarav', 'Rohan', 'Sneha'])
  const [newMemberName, setNewMemberName] = useState('')
  const [expenses, setExpenses] = useState<MemberExpense[]>([
    { id: 'ge-1', payer: 'Priyanka', description: 'Taj Ocean View Suite Stay', amount: 18500 },
    { id: 'ge-2', payer: 'Aarav', description: 'Tempo Traveller & Fuel Rental', amount: 8000 },
    { id: 'ge-3', payer: 'Rohan', description: 'Grand Island PADI Scuba Dive Passes', amount: 9600 },
    { id: 'ge-4', payer: 'Sneha', description: 'Beachfront Sunset Seafood Dinner', amount: 4800 },
  ])

  const [payer, setPayer] = useState('Priyanka')
  const [desc, setDesc] = useState('')
  const [amt, setAmt] = useState('')

  // UPI Settle Modal State
  const [settleModal, setSettleModal] = useState<{ from: string; to: string; amount: number } | null>(null)

  const addMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberName.trim() || members.includes(newMemberName.trim())) return
    setMembers((prev) => [...prev, newMemberName.trim()])
    setNewMemberName('')
    notify(`Added ${newMemberName.trim()} to group!`)
  }

  const removeMember = (name: string) => {
    if (members.length <= 2) return
    setMembers((prev) => prev.filter((m) => m !== name))
    setExpenses((prev) => prev.filter((e) => e.payer !== name))
  }

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault()
    const numAmt = parseFloat(amt)
    if (!desc.trim() || !numAmt || numAmt <= 0) return

    setExpenses((prev) => [
      ...prev,
      { id: `ge-${Date.now()}`, payer, description: desc.trim(), amount: numAmt },
    ])
    setDesc('')
    setAmt('')
    notify(`Expense added: ${desc.trim()} (${formatCurrency(numAmt)})`)
  }

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    notify('Expense removed.')
  }

  const totalGroupSpend = expenses.reduce((sum, e) => sum + e.amount, 0)
  const perPersonShare = members.length ? totalGroupSpend / members.length : 0

  // Calculate balances
  const paidMap: Record<string, number> = {}
  members.forEach((m) => (paidMap[m] = 0))
  expenses.forEach((e) => {
    if (paidMap[e.payer] !== undefined) {
      paidMap[e.payer] += e.amount
    }
  })

  const balanceMap: Record<string, number> = {}
  members.forEach((m) => {
    balanceMap[m] = (paidMap[m] || 0) - perPersonShare
  })

  // Settlement pairings
  const debtors = members.filter((m) => balanceMap[m] < -1).sort((a, b) => balanceMap[a] - balanceMap[b])
  const creditors = members.filter((m) => balanceMap[m] > 1).sort((a, b) => balanceMap[b] - balanceMap[a])

  const settlements: Array<{ from: string; to: string; amount: number }> = []

  let dIdx = 0
  let cIdx = 0
  const tempBal = { ...balanceMap }

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx]
    const creditor = creditors[cIdx]
    const debt = Math.abs(tempBal[debtor])
    const credit = tempBal[creditor]

    const settleAmt = Math.min(debt, credit)
    if (settleAmt > 1) {
      settlements.push({ from: debtor, to: creditor, amount: Math.round(settleAmt) })
    }

    tempBal[debtor] += settleAmt
    tempBal[creditor] -= settleAmt

    if (Math.abs(tempBal[debtor]) < 1) dIdx++
    if (Math.abs(tempBal[creditor]) < 1) cIdx++
  }

  return (
    <Card className="space-y-6">
      {/* Header with Group Metrics & Export Statement */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[#4F46E5]" />
            <h3 className="font-display text-xl font-bold text-slate-900">Group Expense Splitter</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-minimized transaction algorithm (Splitwise Pro standard).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Group Pool</span>
            <p className="font-display text-lg font-bold text-slate-900">{formatCurrency(totalGroupSpend)}</p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={<FileText size={14} />}
            onClick={() => {
              window.print()
              notify('Official Audit Statement generated for printing!')
            }}
            className="rounded-full text-xs font-bold"
          >
            Export Statement
          </Button>
        </div>
      </div>

      {/* Group Members Pill Bar */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">Trip Members ({members.length})</label>
        <div className="flex flex-wrap items-center gap-2">
          {members.map((m) => {
            const bal = Math.round(balanceMap[m] || 0)
            return (
              <div
                key={m}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold"
              >
                <span>{m}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                    bal > 0 ? 'bg-emerald-100 text-emerald-800' : bal < 0 ? 'bg-red-100 text-red-800' : 'text-slate-400'
                  }`}
                >
                  {bal > 0 ? `+${formatCurrency(bal)}` : bal < 0 ? `-${formatCurrency(Math.abs(bal))}` : 'Settled'}
                </span>
                {members.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeMember(m)}
                    className="text-slate-400 hover:text-red-600 ml-0.5 text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}

          <form onSubmit={addMember} className="flex gap-1">
            <input
              type="text"
              placeholder="+ Add Name"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="px-3 py-1 rounded-full border border-slate-200 text-xs bg-white w-28 focus:outline-none focus:ring-1 focus:ring-slate-800"
            />
          </form>
        </div>
      </div>

      {/* Add New Shared Bill Form */}
      <form onSubmit={addExpense} className="grid sm:grid-cols-12 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="sm:col-span-3">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Paid By</label>
          <select
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
          >
            {members.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-5">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Expense Description</label>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="e.g. Scuba diving boat, Resort dinner"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Amount (₹)</label>
          <input
            type="number"
            value={amt}
            onChange={(e) => setAmt(e.target.value)}
            placeholder="3500"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold"
            required
          />
        </div>

        <div className="sm:col-span-2 flex items-end">
          <Button type="submit" size="sm" className="w-full rounded-xl font-bold" icon={<Plus size={14} />}>Add Bill</Button>
        </div>
      </form>

      {/* Split & Settlements Grid */}
      <div className="grid md:grid-cols-2 gap-6 pt-2">
        {/* Expenses List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Shared Bills History ({expenses.length})
          </h4>
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
            {expenses.map((e) => (
              <div key={e.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{e.description}</p>
                  <p className="text-slate-500 text-[11px]">Paid by <strong className="text-[#4F46E5]">{e.payer}</strong></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{formatCurrency(e.amount)}</span>
                  <button
                    type="button"
                    onClick={() => deleteExpense(e.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Settlement Calculations with Instant UPI Settle */}
        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Wallet size={14} className="text-[#10B981]" /> Optimal Settlement Plan
          </h4>

          {settlements.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">All expenses are equally balanced! 🎉</p>
          ) : (
            <div className="space-y-2.5">
              {settlements.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <strong className="text-red-600">{s.from}</strong>
                    <ArrowRight size={12} className="text-slate-400" />
                    <strong className="text-emerald-700">{s.to}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md">
                      {formatCurrency(s.amount)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => setSettleModal(s)}
                      className="rounded-lg text-[10px] font-bold py-1 px-2.5 bg-[#4F46E5] text-white flex items-center gap-1"
                    >
                      <QrCode size={11} /> Settle
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settle Up UPI QR Code Modal */}
      {settleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-sm p-6 rounded-3xl bg-white shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700">Instant UPI Settlement</span>
              <button
                type="button"
                onClick={() => setSettleModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-500">Scan to pay <strong className="text-slate-900">{settleModal.to}</strong></p>
              <p className="font-display text-3xl font-bold text-[#4F46E5]">{formatCurrency(settleModal.amount)}</p>
            </div>

            {/* Generated UPI QR Box */}
            <div className="size-48 mx-auto bg-slate-50 border-2 border-dashed border-indigo-200 rounded-2xl flex flex-col items-center justify-center p-3 space-y-2">
              <QrCode size={80} className="text-slate-800" />
              <p className="text-[10px] font-mono text-slate-500">UPI: {settleModal.to.toLowerCase()}@okhdfcbank</p>
            </div>

            <p className="text-[11px] text-slate-400">
              Compatible with Google Pay, PhonePe, Paytm & BHIM UPI.
            </p>

            <Button
              className="w-full rounded-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                notify(`Payment of ${formatCurrency(settleModal.amount)} marked as paid!`)
                setSettleModal(null)
              }}
            >
              ✓ Mark Settle Completed
            </Button>
          </Card>
        </div>
      )}
    </Card>
  )
}
