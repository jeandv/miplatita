import type { ReactNode } from 'react'
import { TopGradient } from './TopGradient'

interface FormScreenProps {
  title: string
  onBack: () => void
  children: ReactNode
}

/**
 * Full-page form layout. Replaces the old BottomSheet modals for create/edit
 * flows: instead of sliding a sheet over the content (which on mobile also
 * forced the keyboard open), the form takes over the whole screen with a
 * back button in the header. No element auto-focuses, so the on-screen
 * keyboard only appears when the user deliberately taps a field.
 */
export function FormScreen({ title, onBack, children }: FormScreenProps) {
  return (
    <div className="relative min-h-dvh bg-app text-app-fg animate-fade-in">
      <TopGradient />
      <div className="relative z-10 mx-auto max-w-lg px-4 pb-16 pt-safe">
        <header className="mb-6 flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-app-elevated text-app-muted transition-colors hover:bg-app-hover hover:text-app-fg"
            aria-label="Volver"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        </header>
        {children}
      </div>
    </div>
  )
}
