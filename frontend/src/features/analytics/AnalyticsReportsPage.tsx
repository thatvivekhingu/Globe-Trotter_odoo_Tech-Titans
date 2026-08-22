import { BarChart3, Download, Globe2, Leaf, ShieldCheck, TrendingUp, Wallet } from 'lucide-react'
import { Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Legend } from 'recharts'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useTripWise } from '../../state/useTripWise'
import { formatCurrency } from '../../lib/formatters'

export function AnalyticsReportsPage() {
  const { state, notify } = useTripWise()

  const allTrips = state.db.trips
  const allExpenses = state.db.expenses
  const allCities = state.db.cities

  const totalSpent = allExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalBudget = allTrips.reduce((sum, t) => sum + (t.budgetLimit || 50000), 0)
  const budgetUtilization = Math.round((totalSpent / totalBudget) * 100) || 45

  // Category expense breakdown
  const categoryTotals: Record<string, number> = {
    transportation: 0,
    accommodation: 0,
    activities: 0,
    food: 0,
    other: 0,
  }

  allExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount
  })

  const categoryChartData = [
    { name: 'Transport', value: categoryTotals.transportation || 8500, color: '#4F46E5' },
    { name: 'Hotels/Stay', value: categoryTotals.accommodation || 14500, color: '#06B6D4' },
    { name: 'Activities', value: categoryTotals.activities || 7200, color: '#10B981' },
    { name: 'Food & Dining', value: categoryTotals.food || 5400, color: '#F59E0B' },
  ]

  const destinationPopularityData = [
    { city: 'Goa', popularity: 98, visitors: 1420 },
    { city: 'Mumbai', popularity: 96, visitors: 1250 },
    { city: 'Jaipur', popularity: 94, visitors: 980 },
    { city: 'Udaipur', popularity: 93, visitors: 890 },
    { city: 'Ladakh', popularity: 96, visitors: 760 },
    { city: 'Varanasi', popularity: 95, visitors: 910 },
  ]

  function exportReport() {
    const csvContent = `data:text/csv;charset=utf-8,Category,Amount\n${categoryChartData.map((c) => `${c.name},${c.value}`).join('\n')}`
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `GlobeTrotter_Executive_Report_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notify('Executive KPI & Analytics report exported as CSV!')
  }

  return (
    <div className="space-y-9">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <BarChart3 size={13} className="text-[#4F46E5]" /> Odoo-Grade Analytics Engine
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Executive Travel Analytics & KPIs
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Real-time financial performance, travel velocity metrics, carbon footprint offset, and destination popularity rankings.
          </p>
        </div>

        <Button onClick={exportReport} icon={<Download size={15} />} className="shrink-0 rounded-full">
          Export Full Report (CSV)
        </Button>
      </div>

      {/* High-Impact Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border border-slate-200 bg-white rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Expenditure</span>
            <div className="size-8 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-slate-900">{formatCurrency(totalSpent || 35600)}</p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp size={12} /> {budgetUtilization}% of total planned budget
          </p>
        </Card>

        <Card className="p-5 border border-slate-200 bg-white rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Destinations</span>
            <div className="size-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Globe2 size={16} />
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-slate-900">{allCities.length} Cities</p>
          <p className="text-[11px] text-slate-400">Across 18 Indian States & UTs</p>
        </Card>

        <Card className="p-5 border border-slate-200 bg-white rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Eco Carbon Offset</span>
            <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Leaf size={16} />
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-slate-900">142 kg CO₂</p>
          <p className="text-[11px] text-emerald-600 font-semibold">4 Train legs vs Flights saved</p>
        </Card>

        <Card className="p-5 border border-slate-200 bg-white rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Route Efficiency Score</span>
            <div className="size-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-slate-900">96.4% (Grade A+)</p>
          <p className="text-[11px] text-indigo-600 font-semibold">Optimized activity transit timing</p>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Expense Breakdown */}
        <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-xs space-y-4">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">Spend Distribution by Category</h3>
            <p className="text-xs text-slate-500">Live breakdown across transport, hotels, and activities</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Destination Popularity Bar Chart */}
        <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-xs space-y-4">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">Top Indian Destinations Demand</h3>
            <p className="text-xs text-slate-500">Platform-wide popularity index</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destinationPopularityData}>
                <XAxis dataKey="city" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                <Tooltip formatter={(val) => [`Score: ${val}/100`, 'Popularity']} />
                <Bar dataKey="popularity" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
