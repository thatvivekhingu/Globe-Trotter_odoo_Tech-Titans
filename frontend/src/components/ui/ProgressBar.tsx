interface ProgressBarProps {
  value: number
  max?: number
  tone?: 'clay' | 'sage' | 'ink'
  className?: string
}

export function ProgressBar({ value, max = 100, tone = 'clay', className = '' }: ProgressBarProps) {
  const width = Math.min(100, Math.max(0, (value / max) * 100))
  const toneClasses = {
    clay: 'bg-clay',
    sage: 'bg-sage',
    ink: 'bg-ink',
  }
  return (
    <div className={['h-2 overflow-hidden rounded-full bg-ink/8', className].join(' ')} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className={['h-full rounded-full', toneClasses[tone]].join(' ')} style={{ width: `${width}%` }} />
    </div>
  )
}
