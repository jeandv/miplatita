import { useMemo } from 'react'
import { CURRENCY_LABELS } from '../types/finance'
import { formatCurrency } from '../lib/date'
import { maskAmount } from '../lib/settings'
import { CURRENCY_ACCENT, CURRENCY_AMOUNT_COLOR, CURRENCY_ORDER } from '../lib/currency-styles'
import { useTotalsByCurrency } from '../hooks/useFinance'
import { AnimatedNumber } from './motion/AnimatedNumber'
import { SettingsToolbar } from './SettingsToolbar'

interface CurrencyTotalsProps {
  amountsHidden: boolean
  theme: 'light' | 'dark'
  onTogglePrivacy: () => void
  onToggleTheme: () => void
  onViewAccounts?: () => void
}

export function CurrencyTotals({
  amountsHidden,
  theme,
  onTogglePrivacy,
  onToggleTheme,
  onViewAccounts,
}: CurrencyTotalsProps) {
  const totalsByCurrency = useTotalsByCurrency()

  const currencyTotals = useMemo(() => {
    const entries = Array.from(totalsByCurrency.entries())
    return entries.sort(([a], [b]) => {
      const orderA = CURRENCY_ORDER.indexOf(a)
      const orderB = CURRENCY_ORDER.indexOf(b)
      return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB)
    })
  }, [totalsByCurrency])

  if (currencyTotals.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-app-subtle">
          Totales por moneda
        </h2>
        <SettingsToolbar
          amountsHidden={amountsHidden}
          theme={theme}
          onTogglePrivacy={onTogglePrivacy}
          onToggleTheme={onToggleTheme}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
        {currencyTotals.map(([currency, total]) => (
          <div
            key={currency}
            className={[
              'flex-shrink-0 min-w-[132px] rounded-xl border px-3 py-2.5',
              CURRENCY_ACCENT[currency],
            ].join(' ')}
          >
            <p className="truncate text-[11px] font-medium text-app-muted">
              {CURRENCY_LABELS[currency]}
            </p>
            <p className={`mt-0.5 truncate text-base font-bold leading-tight ${CURRENCY_AMOUNT_COLOR[currency]}`}>
              {amountsHidden ? (
                maskAmount(true)
              ) : (
                <AnimatedNumber
                  value={total}
                  format={(v) => formatCurrency(v, currency)}
                  springOptions={{ stiffness: 120, damping: 24 }}
                />
              )}
            </p>
          </div>
        ))}
      </div>

      {onViewAccounts && (
        <button
          type="button"
          onClick={onViewAccounts}
          className="flex w-full items-center justify-center gap-1 rounded-lg bg-app-elevated/80 py-2 text-xs font-medium text-app-muted transition-colors hover:bg-app-elevated hover:text-app-fg"
        >
          Ver todas las cuentas
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}
