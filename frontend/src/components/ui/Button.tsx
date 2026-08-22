import { LoaderCircle } from 'lucide-react'
import { cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

type SlotProps = { className?: string; [key: string]: unknown }

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  asChild?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-parchment hover:bg-clay',
  secondary: 'border border-line bg-white/70 text-ink hover:border-ink hover:bg-white',
  soft: 'bg-sage/20 text-ink hover:bg-sage/35',
  ghost: 'text-ink/70 hover:bg-ink/5 hover:text-ink',
  danger: 'bg-clay text-white hover:bg-ink',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-xs',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-sm',
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  asChild = false,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-control font-semibold leading-none outline-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ')
  const content = loading ? <LoaderCircle size={16} aria-hidden="true" className="animate-spin" /> : <>{icon}{children}</>

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<SlotProps>
    return cloneElement(child, {
      ...(props as unknown as SlotProps),
      className: [classes, child.props.className || ''].join(' '),
      'aria-busy': loading || undefined,
    })
  }

  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
    >
      {content}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  size?: 'sm' | 'md' | 'lg'
  variant?: ButtonVariant
  asChild?: boolean
}

const iconSizeClasses = {
  sm: 'size-9',
  md: 'size-10',
  lg: 'size-12',
}

export function IconButton({
  children,
  className = '',
  label,
  size = 'md',
  variant = 'ghost',
  asChild = false,
  type = 'button',
  ...props
}: IconButtonProps) {
  const classes = [
    'inline-flex items-center justify-center rounded-full outline-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45',
    variantClasses[variant],
    iconSizeClasses[size],
    className,
  ].join(' ')

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<SlotProps>
    return cloneElement(child, {
      ...(props as unknown as SlotProps),
      'aria-label': label,
      title: label,
      className: [classes, child.props.className || ''].join(' '),
    })
  }

  return (
    <button
      {...props}
      type={type}
      aria-label={label}
      title={label}
      className={classes}
    >
      {children}
    </button>
  )
}
