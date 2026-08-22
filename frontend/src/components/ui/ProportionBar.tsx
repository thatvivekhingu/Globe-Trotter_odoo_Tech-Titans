import type { ExpenseCategory } from '../../types/domain'
import { formatCategoryLabel, formatCurrency } from '../../lib/formatters'

interface ProportionBarProps {
  categories: Record<ExpenseCategory, number>
  total: number
}

const colors: Record<ExpenseCategory, string> = {
  transportation: 'bg-ink',
  accommodation: 'bg-clay',
  activities: 'bg-sage',
  food: 'bg-[#d8a88f]',
  other: 'bg-ink/25',
}

export function ProportionBar({ categories, total }: ProportionBarProps) {
  return (
    <div>
      <div className="flex h-4 overflow-hidden rounded-full bg-ink/8" aria-label="Budget proportions">
        {(Object.entries(categories) as [ExpenseCategory, number][]).map(([category, amount]) => amount > 0 ? <div key={category} className={colors[category]} style={{ width: `${(amount / Math.max(total, 1)) * 100}%` }} title={`${formatCategoryLabel(category)}: ${formatCurrency(amount)}`} /> : null)}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {(Object.entries(categories) as [ExpenseCategory, number][]).map(([category, amount]) => <div key={category} className="flex items-center gap-2 text-xs text-ink/60"><span className={['size-2 rounded-full', colors[category]].join(' ')} />{formatCategoryLabel(category)} <span className="font-semibold text-ink">{formatCurrency(amount)}</span></div>)}
      </div>
    </div>
  )
}
