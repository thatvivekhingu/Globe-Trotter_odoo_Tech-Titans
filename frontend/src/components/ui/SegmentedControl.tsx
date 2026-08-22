import type { ReactNode } from 'react'

export interface SegmentOption<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

interface SegmentedControlProps<T extends string> {
  value: T
  options: SegmentOption<T>[]
  onChange: (value: T) => void
  label?: string
}

export function SegmentedControl<T extends string>({ value, options, onChange, label = 'View options' }: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-control border border-line bg-white/55 p-1">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={[
              'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[0.6rem] px-3 text-xs font-semibold outline-none transition-colors duration-200',
              active ? 'bg-ink text-parchment' : 'text-ink/60 hover:bg-ink/5 hover:text-ink',
            ].join(' ')}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
