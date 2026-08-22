import type {
  ActivityCategory,
  CostIndex,
  ExpenseCategory,
  TripStatus,
} from '../types/domain'

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat('en-IN', {
  month: 'short',
  day: 'numeric',
})

export function formatDateRange(startDate: string, endDate: string) {
  return `${shortDateFormatter.format(new Date(`${startDate}T12:00:00`))} – ${dateFormatter.format(new Date(`${endDate}T12:00:00`))}`
}

export function formatShortDate(date: string) {
  return shortDateFormatter.format(new Date(`${date}T12:00:00`))
}

export function formatLongDate(date: string) {
  return dateFormatter.format(new Date(`${date}T12:00:00`))
}

export function formatTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const normalizedHours = hours % 12 || 12
  return `${normalizedHours}:${String(minutes).padStart(2, '0')} ${suffix}`
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

export function formatCurrency(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCount(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`
}

export function formatRelativeDays(targetDate: string, referenceDate = new Date().toISOString().slice(0, 10)) {
  const target = new Date(`${targetDate}T12:00:00`).getTime()
  const reference = new Date(`${referenceDate}T12:00:00`).getTime()
  const days = Math.round((target - reference) / 86400000)
  if (days < 0) return `${Math.abs(days)} days ago`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `In ${days} days`
}

export function formatStatusLabel(status: TripStatus) {
  const labels: Record<TripStatus, string> = {
    draft: 'Draft',
    upcoming: 'Upcoming',
    'in-progress': 'In progress',
    completed: 'Completed',
  }
  return labels[status]
}

export function formatCategoryLabel(category: ActivityCategory | ExpenseCategory) {
  return category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')
}

export function formatCostIndex(index: CostIndex) {
  return `${index.charAt(0).toUpperCase()}${index.slice(1)} cost`
}

export function formatShareUrl(origin: string, token: string) {
  return `${origin}/shared/${token}`
}
