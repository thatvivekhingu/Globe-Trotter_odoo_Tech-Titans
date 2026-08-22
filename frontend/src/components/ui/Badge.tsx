import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'clay' | 'sage' | 'ink'

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-ink/5 text-ink/70',
  clay: 'bg-clay/12 text-clay',
  sage: 'bg-sage/20 text-ink',
  ink: 'bg-ink text-parchment',
}

export function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  return (
    <span className={['inline-flex items-center rounded-full px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.04em]', toneClasses[tone], className].join(' ')}>
      {children}
    </span>
  )
}
