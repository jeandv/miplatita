import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const variants = {
  primary:
    'btn-sheen bg-app-accent text-app-accent-fg bg-app-accent-hover shadow-accent active:brightness-95',
  secondary:
    'bg-app-elevated text-app-fg shadow-premium hover:bg-app-hover active:opacity-90',
  ghost: 'bg-transparent text-app-muted hover:bg-app-elevated hover:text-app-fg',
  danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3.5 text-base font-semibold tracking-tight',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'active:scale-[0.98]',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
