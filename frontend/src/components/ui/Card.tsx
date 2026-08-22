import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  interactive?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6 sm:p-7',
}

export function Card({
  children,
  className = '',
  interactive = false,
  padding = 'md',
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={[
        'surface-card min-w-0',
        paddingClasses[padding],
        interactive ? 'interactive-lift' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function SectionHeading({ eyebrow, title, description, action, className = '' }: SectionHeadingProps) {
  return (
    <div className={['flex flex-wrap items-end justify-between gap-4', className].join(' ')}>
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h2 className="font-display text-3xl font-medium tracking-[-0.035em] text-ink sm:text-4xl">{title}</h2>
        {description ? <p className="body-copy mt-2 max-w-2xl text-sm">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string
  detail?: string
  accent?: 'clay' | 'sage' | 'ink'
}

export function MetricCard({ label, value, detail, accent = 'ink' }: MetricCardProps) {
  const accentClasses = {
    clay: 'text-clay',
    sage: 'text-ink',
    ink: 'text-ink',
  }

  return (
    <div className="min-w-0 border-l border-line pl-4 first:border-l-0 first:pl-0">
      <p className="eyebrow">{label}</p>
      <p className={['mt-2 font-display text-3xl font-medium tracking-[-0.04em]', accentClasses[accent]].join(' ')}>{value}</p>
      {detail ? <p className="mt-1 text-xs text-ink/55">{detail}</p> : null}
    </div>
  )
}
