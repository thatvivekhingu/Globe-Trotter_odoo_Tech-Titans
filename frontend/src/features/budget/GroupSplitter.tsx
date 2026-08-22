import { useState } from 'react'
import { ArrowRight, Plus, Trash2, Users, Wallet } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { formatCurrency } from '../../lib/formatters'

interface MemberExpense {
  id: string
  payer: string
  description: string
  amount: number
}

export function GroupSplitter() {
  const [members, setMembers] = useState<string[]>(['Aarav', 'Rohan', 'Priya', 'Vivek'])
  const [newMemberName, setNewMemberName] = useState('')
  const [expenses, setExpenses] = useState<MemberExpense[]>([
    { id: 'ge-1', payer: 'Aarav', description: 'Tempo Traveller Rental', amount: 8000 },
    { id: 'ge-2', payer: 'Rohan', description: 'Heritage Resort Stay Advance', amount: 12000 },
    { id: 'ge-3', payer: 'Priya', description: 'Dinner at Beachside Shack', amount: 3200 },
    { id: 'ge-4', payer: 'Vivek', description: 'Water Sports & Kayaking passes', amount: 4800 },
  ])

  const [payer, setPayer] = useState('Aarav')
  const [desc, setDesc] = useState('')
  const [amt, setAmt] = useState('')

  const addMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberName.trim() || members.includes(newMemberName.trim())) return
    setMembers((prev) => [...prev, newMemberName.trim()])
    setNewMemberName('')
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
  }

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
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

  // Simple settlement pairings
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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <span className="eyebrow">Group Expenses & Splitwise</span>
          <h3 className="font-display text-2xl font-bold text-ink">
            Group Trip Bill Splitter
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] text-xs font-bold">
            Total Spend: {formatCurrency(totalGroupSpend)}
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-bold">
            {formatCurrency(perPersonShare)} / person
          </div>
        </div>
      </div>

      {/* Members Pills */}
      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-2">Trip Companions</label>
        <div className="flex flex-wrap items-center gap-2">
          {members.map((m) => (
            <span
              key={m}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold"
            >
              <Users size={12} className="text-[#4F46E5]" /> {m}
              {members.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeMember(m)}
                  className="hover:text-red-600 ml-1 text-slate-400"
                >
                  &times;
                </button>
              )}
            </span>
          ))}

          <form onSubmit={addMember} className="inline-flex items-center gap-1">
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="+ Add Friend"
              className="px-3 py-1 rounded-full border border-line text-xs w-28 focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            />
          </form>
        </div>
      </div>

      {/* Add Shared Expense Form */}
      <form onSubmit={addExpense} className="grid sm:grid-cols-12 gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-line">
        <div className="sm:col-span-3">
          <label className="block text-[11px] font-semibold text-ink/70 mb-1">Paid By</label>
          <select
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
          >
            {members.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-5">
          <label className="block text-[11px] font-semibold text-ink/70 mb-1">Expense Description</label>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="e.g. Scuba diving boat tickets"
            className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-ink/70 mb-1">Amount (₹)</label>
          <input
            type="number"
            value={amt}
            onChange={(e) => setAmt(e.target.value)}
            placeholder="3500"
            className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
            required
          />
        </div>

        <div className="sm:col-span-2 flex items-end">
          <Button type="submit" size="sm" className="w-full" icon={<Plus size={14} />}>Add</Button>
        </div>
      </form>

      {/* Split & Settlements Grid */}
      <div className="grid md:grid-cols-2 gap-6 pt-2">
        {/* Expenses List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Shared Expenses ({expenses.length})
          </h4>
          <div className="divide-y divide-line max-h-56 overflow-y-auto pr-1">
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

        {/* Smart Settlement Calculations */}
        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-line">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Wallet size={14} className="text-[#10B981]" /> Settlement Plan (Who Owes Whom)
          </h4>

          {settlements.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">All expenses are equally balanced! 🎉</p>
          ) : (
            <div className="space-y-2.5">
              {settlements.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <strong className="text-red-600">{s.from}</strong>
                    <ArrowRight size={12} className="text-slate-400" />
                    <strong className="text-emerald-700">{s.to}</strong>
                  </div>
                  <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md">
                    {formatCurrency(s.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
