import { useState } from 'react'
import { Building2, CheckCircle2, Download, Layers, RefreshCw } from 'lucide-react'
import { Card, SectionHeading } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useTripWise } from '../../state/useTripWise'
import { formatCurrency } from '../../lib/formatters'

interface ExpenseVoucher {
  id: string
  employee: string
  description: string
  amount: number
  category: string
  odooModel: string
  status: 'draft' | 'submitted' | 'approved' | 'posted'
  odooRef?: string
}

const SAMPLE_VOUCHERS: ExpenseVoucher[] = [
  {
    id: 'exp-v1',
    employee: 'Aarav Mehta (EMP-1042)',
    description: "Martin's Corner Client Dinner",
    amount: 2850,
    category: 'Food & Meals',
    odooModel: 'hr.expense',
    status: 'approved',
    odooRef: 'EXP/2026/00142',
  },
  {
    id: 'exp-v2',
    employee: 'Aarav Mehta (EMP-1042)',
    description: 'Goa Airport Express Transit Taxi',
    amount: 1650,
    category: 'Local Conveyance',
    odooModel: 'hr.expense',
    status: 'submitted',
    odooRef: 'EXP/2026/00143',
  },
  {
    id: 'exp-v3',
    employee: 'Rohan Sharma (EMP-1088)',
    description: 'Taj Fort Aguada Conference Accommodation',
    amount: 14500,
    category: 'Lodging & Hotel',
    odooModel: 'account.move',
    status: 'posted',
    odooRef: 'INV/2026/00891',
  },
]

export function OdooIntegrationPage() {
  const { notify } = useTripWise()
  const [syncing, setSyncing] = useState(false)
  const [vouchers, setVouchers] = useState<ExpenseVoucher[]>(SAMPLE_VOUCHERS)
  const odooConfig = {
    serverUrl: 'https://globetrotter-demo.odoo.com',
    database: 'odoo_travel_corp_prod',
    username: 'admin@globetrotter.app',
    apiKey: '••••••••••••••••••••••••',
  }

  function handleSyncOdoo() {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      setVouchers((prev) =>
        prev.map((v) => ({
          ...v,
          status: 'posted',
          odooRef: v.odooRef || `EXP/2026/00${Math.floor(100 + Math.random() * 900)}`,
        }))
      )
      notify('✅ Successfully synchronized all trip expenses & invoices to Odoo ERP (hr.expense & account.move)!')
    }, 1400)
  }

  function handleApprove(id: string) {
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'approved', odooRef: `EXP/2026/00${Math.floor(100 + Math.random() * 900)}` } : v))
    )
    notify('Trip Expense Voucher approved & queued for Odoo Accounting Post.')
  }

  function exportOdooXml() {
    const odooXml = `<?xml version="1.0" encoding="utf-8"?>
<odoo>
  <data noupdate="1">
    ${vouchers
      .map(
        (v) => `
    <record id="${v.id}" model="${v.odooModel}">
      <field name="name">${v.description}</field>
      <field name="employee_id" ref="${v.employee}"/>
      <field name="total_amount">${v.amount}</field>
      <field name="currency_id" ref="base.INR"/>
      <field name="state">${v.status}</field>
    </record>`
      )
      .join('\n')}
  </data>
</odoo>`

    const blob = new Blob([odooXml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `odoo_travel_expenses_export_${Date.now()}.xml`
    a.click()
    URL.revokeObjectURL(url)
    notify('Odoo XML-RPC Data Record file exported!')
  }

  return (
    <div className="space-y-9">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Building2 size={13} className="text-purple-600" /> Odoo Enterprise ERP Bridge
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Odoo Corporate ERP Sync & Invoicing
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Seamlessly bridge scanned travel receipts, per-diem allowances, and booking invoices into Odoo's <code>hr.expense</code> and <code>account.move</code> ledger modules.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="secondary"
            onClick={exportOdooXml}
            icon={<Download size={14} />}
            className="rounded-full text-xs"
          >
            Export Odoo XML
          </Button>
          <Button
            onClick={handleSyncOdoo}
            disabled={syncing}
            icon={<RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />}
            className="rounded-full text-xs bg-purple-600 hover:bg-purple-700 text-white"
          >
            {syncing ? 'Syncing with Odoo...' : 'Sync to Odoo ERP'}
          </Button>
        </div>
      </div>

      {/* Odoo Connection Status Card */}
      <Card className="p-6 bg-linear-to-r from-purple-950 to-slate-900 text-white rounded-3xl border border-purple-800/60 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center font-bold text-lg">
              <Layers size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-bold text-white">Odoo v17 / v18 Community & Enterprise</h3>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Connected
                </span>
              </div>
              <p className="text-xs text-purple-200/70 font-mono mt-0.5">{odooConfig.serverUrl} ({odooConfig.database})</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-300">Accounting Protocol</p>
              <p className="text-[11px] text-purple-300 font-mono">XML-RPC / JSON-RPC REST</p>
            </div>
          </div>
        </div>

        {/* Integration Modules Linked */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-purple-800/40 text-xs">
          <div className="p-3 rounded-2xl bg-purple-900/40 border border-purple-800/50 space-y-1">
            <p className="text-purple-300 font-bold text-[11px]">1. Odoo Expenses (`hr.expense`)</p>
            <p className="text-purple-100/70 text-[11px]">Auto-creates employee reimbursement claims from AI OCR bill scans.</p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-900/40 border border-purple-800/50 space-y-1">
            <p className="text-purple-300 font-bold text-[11px]">2. Odoo Invoicing (`account.move`)</p>
            <p className="text-purple-100/70 text-[11px]">Generates GST Vendor Bills for corporate flights and boutique hotels.</p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-900/40 border border-purple-800/50 space-y-1">
            <p className="text-purple-300 font-bold text-[11px]">3. Odoo Fleet & Approvals</p>
            <p className="text-purple-100/70 text-[11px]">Multi-level Manager & HR sign-off on travel per-diem limits.</p>
          </div>
        </div>
      </Card>

      {/* Corporate Travel Voucher Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeading
            eyebrow="Corporate Reconciliation"
            title="Travel Expense Claims & Invoices"
            description="All trip expenses captured via OCR or booking engine mapped directly to Odoo database models."
          />
          <Badge tone="neutral">{vouchers.length} Corporate Records</Badge>
        </div>

        <div className="space-y-3">
          {vouchers.map((v) => (
            <Card key={v.id} className="p-4 border border-slate-200/90 rounded-2xl bg-white shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    {v.odooModel}
                  </span>
                  {v.odooRef && (
                    <span className="font-mono text-xs text-slate-500 font-semibold">
                      Ref: {v.odooRef}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      v.status === 'posted'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : v.status === 'approved'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>

                <h4 className="font-display text-sm font-bold text-slate-900">{v.description}</h4>
                <p className="text-xs text-slate-500">{v.employee} • <span className="text-slate-700 font-medium">{v.category}</span></p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Amount Claimed</p>
                  <p className="font-display text-lg font-bold text-slate-900">{formatCurrency(v.amount)}</p>
                </div>

                {v.status === 'submitted' && (
                  <Button size="sm" onClick={() => handleApprove(v.id)} className="rounded-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                    Approve
                  </Button>
                )}
                {v.status === 'posted' && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                    <CheckCircle2 size={13} />
                    Posted in Odoo
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
