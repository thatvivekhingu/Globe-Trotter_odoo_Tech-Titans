import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'

interface FieldProps {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}

export function Field({ label, htmlFor, hint, error, required, children }: FieldProps) {
  const messageId = error ? `${htmlFor}-error` : hint ? `${htmlFor}-hint` : undefined

  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
        {label}
        {required ? <span className="ml-1 text-clay" aria-hidden="true">*</span> : null}
      </label>
      {children}
      {error ? (
        <p id={messageId} role="alert" className="text-xs font-medium text-clay">{error}</p>
      ) : hint ? (
        <p id={messageId} className="text-xs leading-5 text-ink/55">{hint}</p>
      ) : null}
    </div>
  )
}

const inputClasses = (error?: string) => [
  'min-h-11 w-full rounded-control border bg-white/65 px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/35',
  error ? 'border-clay focus:border-clay' : 'border-line focus:border-ink',
].join(' ')

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function TextInput({ error, id, ...props }: TextInputProps) {
  return (
    <input
      {...props}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : props['aria-describedby']}
      className={[inputClasses(error), props.className || ''].join(' ')}
    />
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export function Textarea({ error, id, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : props['aria-describedby']}
      className={[inputClasses(error), 'min-h-28 resize-y py-3', props.className || ''].join(' ')}
    />
  )
}

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  error?: string
}

export function Select({ options, error, id, children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : props['aria-describedby']}
      className={[inputClasses(error), 'appearance-none', props.className || ''].join(' ')}
    >
      {children}
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  )
}

export function DateInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <TextInput {...props} type="date" />
}
