import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FieldProps {
  label: string
  error?: string
}

const fieldClass = [
  'w-full rounded-xl border border-app bg-app-surface-muted px-4 py-3 text-app-fg',
  'placeholder:text-app-subtle transition-colors',
  'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
].join(' ')

export function InputField({
  label,
  error,
  className = '',
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-app-muted">{label}</label>}
      <input
        className={[fieldClass, error ? 'border-red-500' : '', className].filter(Boolean).join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function SelectField({
  label,
  error,
  children,
  className = '',
  ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-app-muted">{label}</label>}
      <select
        className={[
          fieldClass,
          'appearance-none',
          error ? 'border-red-500' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function TextAreaField({
  label,
  error,
  className = '',
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-app-muted">{label}</label>}
      <textarea
        className={[
          fieldClass,
          'resize-none',
          error ? 'border-red-500' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        rows={2}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
