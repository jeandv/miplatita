import { useMemo, useState } from 'react'
import type { Account, Currency, Transaction } from '../types/finance'
import { getCategoryColor, getCategoryLabel } from '../lib/categories'
import {
  calculateCategoryStats,
  filterExpensesByPeriod,
  formatCurrency,
  type PeriodFilter,
} from '../lib/date'
import { useCustomCategories } from '../hooks/useFinance'
import { AnimatedNumber } from './motion/AnimatedNumber'

interface CategoryStatsProps {
  transactions: Transaction[]
  accounts: Account[]
}

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  day: 'Hoy',
  week: 'Semana',
  month: 'Mes',
}

export function CategoryStats({ transactions, accounts }: CategoryStatsProps) {
  const customCategories = useCustomCategories()
  const [period, setPeriod] = useState<PeriodFilter>('month')

  const accountMap = useMemo(
    () => new Map(accounts.map((a) => [a.id, a])),
    [accounts],
  )

  const expenses = useMemo(
    () => filterExpensesByPeriod(transactions, period),
    [transactions, period],
  )

  const currenciesWithExpenses = useMemo(() => {
    const set = new Set<Currency>()
    for (const tx of expenses) {
      const account = accountMap.get(tx.accountId)
      if (account) set.add(account.currency)
    }
    return Array.from(set)
  }, [expenses, accountMap])

  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)

  const activeCurrency = selectedCurrency ?? currenciesWithExpenses[0] ?? accounts[0]?.currency ?? 'USD'

  const currencyExpenses = useMemo(
    () =>
      expenses.filter((tx) => accountMap.get(tx.accountId)?.currency === activeCurrency),
    [expenses, accountMap, activeCurrency],
  )

  const stats = useMemo(() => calculateCategoryStats(currencyExpenses), [currencyExpenses])

  const totalExpenses = useMemo(
    () => currencyExpenses.reduce((sum, tx) => sum + tx.amount, 0),
    [currencyExpenses],
  )

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-app-muted">Gastos por categoría</h2>
        </div>

      <div className="flex rounded-xl bg-app-elevated p-1">
        {(['day', 'week', 'month'] as PeriodFilter[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={[
              'flex-1 rounded-lg py-2 text-xs font-medium transition-all duration-200',
              period === p
                ? 'bg-app-hover text-app-fg shadow-sm'
                : 'text-app-muted hover:text-app-fg',
            ].join(' ')}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {currenciesWithExpenses.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {currenciesWithExpenses.map((currency) => (
            <button
              key={currency}
              type="button"
              onClick={() => setSelectedCurrency(currency)}
              className={[
                'flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                activeCurrency === currency
                  ? 'bg-app-accent text-app-accent-fg'
                  : 'bg-app-elevated text-app-muted hover:text-app-fg',
              ].join(' ')}
            >
              {currency}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 pb-4">
        {stats.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-app-dashed bg-app-surface/50 py-10 text-center">
          <p className="text-sm text-app-muted">
            No hay gastos en este período
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative mx-auto h-40 w-40">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              {(() => {
                let offset = 0
                return stats.map((stat) => {
                  const dash = stat.percentage
                  const color = getCategoryColor(stat.category, customCategories)
                  const circle = (
                    <circle
                      key={stat.category}
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke={color}
                      strokeWidth="3.5"
                      strokeDasharray={`${dash} ${100 - dash}`}
                      strokeDashoffset={-offset}
                      className="transition-all duration-500"
                    />
                  )
                  offset += dash
                  return circle
                })
              })()}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-app-subtle">{activeCurrency}</span>
              <AnimatedNumber
                as="span"
                className="text-sm font-bold text-app-fg"
                value={totalExpenses}
                format={(v) => formatCurrency(v, activeCurrency)}
                springOptions={{ stiffness: 120, damping: 24 }}
              />
            </div>
          </div>

          <div className="space-y-2">
            {stats.map((stat) => {
              const color = getCategoryColor(stat.category, customCategories)
              return (
                <div key={stat.category} className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-app-muted">
                        {getCategoryLabel(stat.category, customCategories)}
                      </span>
                      <AnimatedNumber
                        as="span"
                        className="text-sm font-medium text-app-fg"
                        value={stat.percentage}
                        format={(v) => `${Math.round(v)}%`}
                        springOptions={{ stiffness: 120, damping: 24 }}
                      />
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-app-elevated">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${stat.percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
