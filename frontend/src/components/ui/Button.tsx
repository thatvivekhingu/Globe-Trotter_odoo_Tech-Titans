import { LoaderCircle } from 'lucide-react'
import { cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger' | 'mac'
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
  primary: 'bg-[#0F172A] text-white hover:bg-slate-800 active:scale-[0.97] shadow-sm shadow-black/15 border border-slate-800 hover:border-slate-700 transition-all duration-150 ease-out',
  secondary: 'bg-white/85 backdrop-blur-md border border-slate-200/90 text-slate-800 hover:bg-white hover:border-slate-300 hover:shadow-xs active:scale-[0.97] transition-all duration-150 ease-out',
  soft: 'bg-indigo-50/90 text-indigo-700 border border-indigo-100/80 hover:bg-indigo-100/90 active:scale-[0.97] transition-all duration-150',
  ghost: 'text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 active:scale-[0.97] transition-all duration-150',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.97] shadow-sm shadow-rose-600/20 transition-all duration-150',
  mac: 'bg-linear-to-b from-white/90 to-slate-100/90 backdrop-blur-md text-slate-800 border border-slate-300/80 shadow-2xs hover:from-white hover:to-slate-50 hover:shadow-xs active:scale-[0.96] transition-all duration-150',
}

export function MacWindowControls({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="size-3 rounded-full bg-[#FF5F56] border border-[#E0443E] inline-block shadow-2xs group-hover:opacity-100" />
      <span className="size-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] inline-block shadow-2xs group-hover:opacity-100" />
      <span className="size-3 rounded-full bg-[#27C93F] border border-[#1AAB29] inline-block shadow-2xs group-hover:opacity-100" />
    </div>
  )
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
