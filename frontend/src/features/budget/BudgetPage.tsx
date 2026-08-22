import { AlertTriangle, ArrowLeft, BarChart3, Camera, PieChart as PieChartIcon, Plus, Trash2, WalletCards, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useTripData } from '../../hooks/useTripSelectors'
import { useTripWise } from '../../state/useTripWise'
import { formatCategoryLabel, formatCurrency, formatDateRange } from '../../lib/formatters'
import { AiBudgetInsights } from '../../components/ai/AiBudgetInsights'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, MetricCard, SectionHeading } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/Feedback'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { ProportionBar } from '../../components/ui/ProportionBar'
import { GroupSplitter } from './GroupSplitter'
import { ReceiptScannerModal } from './ReceiptScannerModal'
import type { ExpenseCategory } from '../../types/domain'

const chartColors: Record<ExpenseCategory, string> = {
  transportation: '#2A3439',
  accommodation: '#A45A52',
  activities: '#85B09A',
  food: '#D8A88F',
  other: '#9EA6A5',
}

export function BudgetPage() {
  const { tripId } = useParams()
  const { state, dispatch, notify } = useTripWise()
  const data = useTripData(tripId)

  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [expDescription, setExpDescription] = useState('')
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('food')
  const [expAmount, setExpAmount] = useState('1200')
  const [expDate, setExpDate] = useState('')

  if (!data) return <EmptyState title="Budget not found" description="We could not find a trip for this budget view." action={<Button asChild><Link to="/trips">Back to my trips</Link></Button>} />

  const tripExpenses = state.db.expenses.filter((e) => e.tripId === data.trip.id)
  const categoryData = (Object.entries(data.budget.categories) as [ExpenseCategory, number][]).map(([category, amount]) => ({ name: formatCategoryLabel(category), amount, category }))
  const overBudget = data.budget.remaining !== null && data.budget.remaining < 0
  const percentUsed = data.budget.budgetLimit ? (data.budget.total / data.budget.budgetLimit) * 100 : 0

  function handleAddExpense(e: FormEvent) {
    e.preventDefault()
    if (!expDescription.trim() || !data) return
    const amt = parseFloat(expAmount) || 0
    if (amt <= 0) {
      notify('Please enter a valid amount.', 'error')
      return
    }

    const newExpense = {
      id: `exp-${Date.now()}`,
      tripId: data.trip.id,
      category: expCategory,
      amount: amt,
      description: expDescription.trim(),
      date: expDate || data.trip.startDate,
    }

    dispatch({ type: 'ADD_EXPENSE', expense: newExpense })
    setAddExpenseOpen(false)
    setExpDescription('')
    setExpAmount('1200')
    setExpDate('')
    notify('Expense logged and budget updated!')
  }

  function handleSaveScannedExpense(expense: { amount: number; description: string; category: ExpenseCategory; date: string }) {
    if (!data) return
    const newExpense = {
      id: `exp-${Date.now()}`,
      tripId: data.trip.id,
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      date: expense.date || data.trip.startDate,
    }
    dispatch({ type: 'ADD_EXPENSE', expense: newExpense })
    notify(`Scanned expense (${formatCurrency(expense.amount)}) logged into budget!`)
  }

  function handleDeleteExpense(id: string) {
    dispatch({ type: 'DELETE_EXPENSE', expenseId: id })
    notify('Expense removed.')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to={`/trips/${data.trip.id}/itinerary`} className="inline-flex items-center gap-2 text-sm font-semibold text-ink/55 hover:text-ink">
          <ArrowLeft size={16} />Back to itinerary
        </Link>
        <div className="flex items-center gap-2.5">
          <Badge tone={overBudget ? 'clay' : 'sage'}>{overBudget ? 'Over budget' : 'Within budget'}</Badge>
          <Button size="sm" variant="secondary" icon={<Camera size={15} className="text-[#4F46E5]" />} onClick={() => setScannerOpen(true)}>
            Scan Receipt with AI
          </Button>
          <Button size="sm" icon={<Plus size={15} />} onClick={() => setAddExpenseOpen(true)}>
            + Add Expense
          </Button>
        </div>
      </div>

      <SectionHeading
        eyebrow="Spend with intention"
        title="Budget & Cost Breakdown"
        description={`${data.trip.name} · ${formatDateRange(data.trip.startDate, data.trip.endDate)}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-ink text-parchment">
          <WalletCards size={19} className="text-sage" />
          <p className="eyebrow mt-5 text-parchment/60">Total estimated cost</p>
          <p className="mt-2 font-display text-3xl">{formatCurrency(data.budget.total)}</p>
          <p className="mt-1 text-xs text-parchment/55">Across planned items</p>
        </Card>
        <Card><MetricCard label="Cost per day" value={formatCurrency(data.budget.costPerDay)} detail="Average for this route" /></Card>
        <Card><MetricCard label="Budget limit" value={data.budget.budgetLimit ? formatCurrency(data.budget.budgetLimit) : 'Not set'} detail="Your working comfort zone" /></Card>
        <Card><MetricCard label="GST Tax Shield (18%)" value={formatCurrency(Math.round(data.budget.total * 0.18))} detail="Corporate audit claimable" accent="sage" /></Card>
      </div>

      {data.budget.budgetLimit ? (
        <Card className={overBudget ? 'border-clay/40 bg-clay/5' : ''}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Budget pulse</p>
              <h2 className="mt-2 font-display text-2xl font-medium text-ink">
                {overBudget ? 'The route is asking for a little edit.' : 'You are travelling within your plan.'}
              </h2>
            </div>
            {overBudget ? <AlertTriangle size={22} className="text-clay" aria-hidden="true" /> : null}
          </div>
          <ProgressBar value={data.budget.total} max={data.budget.budgetLimit} tone={overBudget ? 'clay' : 'sage'} className="mt-5 h-3" />
          <div className="mt-3 flex justify-between text-xs text-ink/55">
            <span>{Math.round(percentUsed)}% of budget used</span>
            <span>{formatCurrency(Math.abs(data.budget.remaining || 0))} {overBudget ? 'over' : 'left'}</span>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Where it goes</p>
              <h2 className="mt-2 font-display text-2xl font-medium text-ink">Budget proportions</h2>
            </div>
            <PieChartIcon size={20} className="text-clay" aria-hidden="true" />
          </div>
          <div className="mt-6">
            <ProportionBar categories={data.budget.categories} total={data.budget.total} />
          </div>
          <div className="mt-7 space-y-4">
            {categoryData.map((item) => (
              <div key={item.category} className="grid grid-cols-[8rem_minmax(0,1fr)_auto] items-center gap-3 text-sm">
                <span className="truncate text-ink/60">{item.name}</span>
                <ProgressBar value={item.amount} max={Math.max(data.budget.total, 1)} tone={item.category === 'activities' ? 'sage' : item.category === 'transportation' ? 'ink' : 'clay'} />
                <span className="font-semibold text-ink">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Visual breakdown</p>
              <h2 className="mt-2 font-display text-2xl font-medium text-ink">Category mix</h2>
            </div>
            <BarChart3 size={20} className="text-sage" aria-hidden="true" />
          </div>
          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData.filter((item) => item.amount > 0)} dataKey="amount" nameKey="name" cx="50%" cy="46%" innerRadius={58} outerRadius={88} paddingAngle={3}>
                  {categoryData.filter((item) => item.amount > 0).map((item) => (
                    <Cell key={item.category} fill={chartColors[item.category]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: '12px', borderColor: '#D0D0CC', backgroundColor: '#F4F0EC', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* AI Budget Insights — powered by Gemini */}
      <AiBudgetInsights tripId={typeof data.trip.id === 'number' ? data.trip.id : 1} />

      {/* Logged Expenses List Card */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="eyebrow">Expense Records</p>
            <h3 className="font-display text-2xl text-ink">All Logged Expenses</h3>
          </div>
          <Button size="sm" variant="soft" icon={<Plus size={14} />} onClick={() => setAddExpenseOpen(true)}>Add expense</Button>
        </div>
        <div className="divide-y divide-line">
          {tripExpenses.map((exp) => (
            <div key={exp.id} className="py-3 flex items-center justify-between gap-4 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink truncate">{exp.description}</p>
                <p className="text-xs text-ink/50">{formatCategoryLabel(exp.category)} {exp.date ? `· ${exp.date}` : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-ink">{formatCurrency(exp.amount)}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteExpense(exp.id)}
                  className="p-1.5 rounded-lg text-ink/40 hover:text-clay hover:bg-clay/10 transition-colors"
                  title="Delete expense"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
          {!tripExpenses.length ? (
            <p className="py-4 text-center text-xs text-ink/50">No standalone expenses logged yet. Click "+ Add Expense" above.</p>
          ) : null}
        </div>
      </Card>

      {/* Group Trip Bill Splitter */}
      <GroupSplitter />

      {/* Add Expense Modal */}
      {addExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-ink">Log New Expense</h3>
              <button onClick={() => setAddExpenseOpen(false)} className="text-ink/40 hover:text-ink"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink/70 mb-1">Description *</label>
                <input
                  type="text"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  placeholder="e.g. Flight tickets, Heritage resort booking"
                  className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm"
                  >
                    <option value="transportation">Transportation</option>
                    <option value="accommodation">Accommodation</option>
                    <option value="activities">Activities</option>
                    <option value="food">Food</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setAddExpenseOpen(false)}>Cancel</Button>
                <Button type="submit" icon={<Plus size={15} />}>Log Expense</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* AI Receipt Scanner Modal */}
      <ReceiptScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onSaveExpense={handleSaveScannedExpense}
      />
    </div>
  )
}
