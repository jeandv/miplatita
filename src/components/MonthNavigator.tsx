interface MonthNavigatorProps {
  currentMonth: Date
  onMonthChange: (date: Date) => void
}

export function MonthNavigator({ currentMonth, onMonthChange }: MonthNavigatorProps) {
  function goToPrevMonth() {
    const prev = new Date(currentMonth)
    prev.setMonth(prev.getMonth() - 1)
    onMonthChange(prev)
  }

  function goToNextMonth() {
    const next = new Date(currentMonth)
    next.setMonth(next.getMonth() + 1)
    onMonthChange(next)
  }

  const label = new Intl.DateTimeFormat('es', {
    month: 'long',
    year: 'numeric',
  }).format(currentMonth)

  const isCurrentMonth =
    currentMonth.getMonth() === new Date().getMonth() &&
    currentMonth.getFullYear() === new Date().getFullYear()

  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={goToPrevMonth}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-elevated text-app-muted transition-all duration-200 hover:bg-app-hover active:scale-95"
        aria-label="Mes anterior"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="text-center">
        <p className="text-base font-semibold capitalize text-app-fg">{label}</p>
        {!isCurrentMonth && (
          <button
            type="button"
            onClick={() => onMonthChange(new Date())}
            className="text-xs text-emerald-400 transition-colors hover:text-emerald-300"
          >
            Ir a hoy
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={goToNextMonth}
        disabled={isCurrentMonth}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-elevated text-app-muted transition-all duration-200 hover:bg-app-hover active:scale-95 disabled:opacity-30 disabled:hover:bg-app-elevated"
        aria-label="Mes siguiente"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
