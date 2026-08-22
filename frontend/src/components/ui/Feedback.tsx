import { AlertTriangle, CheckCircle2, Info, RefreshCcw, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button, IconButton } from './Button'

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={['skeleton-sheen rounded-control', className].join(' ')} />
}

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={['flex min-h-64 flex-col items-center justify-center rounded-card border border-dashed border-line px-6 py-10 text-center', className].join(' ')}>
      {icon ? <div className="mb-4 text-clay">{icon}</div> : null}
      <h3 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">{title}</h3>
      <p className="body-copy mt-2 max-w-sm text-sm">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ title = 'Something went wrong', description = 'We could not load this view. Try again in a moment.', onRetry, className = '' }: ErrorStateProps) {
  return (
    <div className={['rounded-card border border-clay/30 bg-clay/5 px-6 py-8 text-center', className].join(' ')}>
      <AlertTriangle size={24} className="mx-auto text-clay" aria-hidden="true" />
      <h3 className="mt-3 font-display text-2xl font-medium text-ink">{title}</h3>
      <p className="body-copy mx-auto mt-2 max-w-md text-sm">{description}</p>
      {onRetry ? <Button className="mt-5" variant="secondary" size="sm" icon={<RefreshCcw size={14} />} onClick={onRetry}>Try again</Button> : null}
    </div>
  )
}

export interface ToastMessage {
  message: string
  tone: 'success' | 'error' | 'info'
}

interface ToastViewportProps {
  toast: ToastMessage | null
  onDismiss: () => void
}

export function ToastViewport({ toast, onDismiss }: ToastViewportProps) {
  if (!toast) return null
  const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? AlertTriangle : Info
  const tone = toast.tone === 'success' ? 'border-sage/50 bg-sage/20' : toast.tone === 'error' ? 'border-clay/40 bg-clay/10' : 'border-line bg-white'

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-20 z-50 flex justify-center sm:inset-x-auto sm:bottom-6 sm:right-6">
      <div role="status" className={['pointer-events-auto flex max-w-sm items-center gap-3 rounded-control border px-4 py-3 text-sm font-semibold text-ink shadow-[0_16px_40px_rgb(42_52_57_/_0.16)]', tone].join(' ')}>
        <Icon size={18} aria-hidden="true" />
        <span className="flex-1">{toast.message}</span>
        <IconButton label="Dismiss notification" size="sm" variant="ghost" onClick={onDismiss}><X size={15} /></IconButton>
      </div>
    </div>
  )
}

interface DialogProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}

export function Dialog({ open, title, description, onClose, children }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/35 p-4 sm:items-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="w-full max-w-md rounded-card border border-line bg-parchment p-6 shadow-[0_24px_70px_rgb(42_52_57_/_0.24)]" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="dialog-title" className="font-display text-3xl font-medium tracking-[-0.035em] text-ink">{title}</h2>
            {description ? <p className="body-copy mt-2 text-sm">{description}</p> : null}
          </div>
          <IconButton label="Close dialog" size="sm" onClick={onClose}><X size={16} /></IconButton>
        </div>
        <div className="mt-6">{children}</div>
      </section>
    </div>
  )
}

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function ConfirmDialog({ open, title, description, confirmLabel, onClose, onConfirm, loading }: ConfirmDialogProps) {
  return (
    <Dialog open={open} title={title} description={description} onClose={onClose}>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Dialog>
  )
}
