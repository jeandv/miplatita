import { useMemo } from 'react'
import type { Account, Transaction } from '../types/finance'
import { getCategoryLabel } from '../lib/categories'
import {
  calculateMonthTotalsByCurrency,
  filterTransactionsByAccount,
  filterTransactionsByMonth,
  formatCurrency,
  formatDayHeader,
  groupTransactionsByDay,
  parseDateInput,
} from '../lib/date'
import { maskAmount } from '../lib/settings'
import { useCustomCategories } from '../hooks/useFinance'
import { MonthNavigator } from './MonthNavigator'

interface TransactionListProps {
  transactions: Transaction[]
  accounts: Account[]
  currentMonth: Date
  onMonthChange: (date: Date) => void
  selectedAccountId: string | null
  onAccountFilterChange: (accountId: string | null) => void
  onEditTransaction: (transaction: Transaction) => void
  amountsHidden?: boolean
}

export function TransactionList({
  transactions,
  accounts,
  currentMonth,
  onMonthChange,
  selectedAccountId,
  onAccountFilterChange,
  onEditTransaction,
  amountsHidden = false,
}: TransactionListProps) {
  const customCategories = useCustomCategories()

  const accountMap = useMemo(
    () => new Map(accounts.map((a) => [a.id, a])),
    [accounts],
  )

  const monthTransactions = useMemo(
    () =>
      filterTransactionsByAccount(
        filterTransactionsByMonth(transactions, currentMonth),
        selectedAccountId,
      ),
    [transactions, currentMonth, selectedAccountId],
  )

  const monthTotals = useMemo(
    () =>
      calculateMonthTotalsByCurrency(
        transactions,
        accounts,
        currentMonth,
        selectedAccountId,
      ),
    [transactions, accounts, currentMonth, selectedAccountId],
  )

  const grouped = useMemo(
    () => groupTransactionsByDay(monthTransactions),
    [monthTransactions],
  )

  const sortedDays = useMemo(
    () => Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a)),
    [grouped],
  )

  const currencyTotals = useMemo(() => {
    const entries = Array.from(monthTotals.entries())
    if (entries.length > 0) return entries

    if (selectedAccountId) {
      const account = accountMap.get(selectedAccountId)
      if (account) return [[account.currency, { income: 0, expense: 0 }] as const]
    }

    return entries
  }, [monthTotals, selectedAccountId, accountMap])

  return (
    <div className="space-y-4">
      <MonthNavigator currentMonth={currentMonth} onMonthChange={onMonthChange} />

      {currencyTotals.length > 0 && (
        <div className="space-y-3">
          {currencyTotals.map(([currency, totals]) => (
            <div key={currency}>
              {currencyTotals.length > 1 && (
                <p className="mb-2 text-xs font-medium text-app-subtle">{currency}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-emerald-500/10 px-4 py-3">
                  <p className="text-xs text-emerald-400/80">Ingresos</p>
                  <p className="text-sm font-semibold text-emerald-400">
                    {amountsHidden ? maskAmount(true) : `+${formatCurrency(totals.income, currency)}`}
                  </p>
                </div>
                <div className="rounded-xl bg-red-500/10 px-4 py-3">
                  <p className="text-xs text-red-400/80">Gastos</p>
                  <p className="text-sm font-semibold text-red-400">
                    {amountsHidden ? maskAmount(true) : `-${formatCurrency(totals.expense, currency)}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {accounts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            type="button"
            onClick={() => onAccountFilterChange(null)}
            className={[
              'flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
              selectedAccountId === null
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-app-elevated text-app-muted hover:text-app-fg',
            ].join(' ')}
          >
            Todas
          </button>
          {accounts.map((account) => (
            <button
              key={account.id}
              type="button"
              onClick={() => onAccountFilterChange(account.id)}
              className={[
                'flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                selectedAccountId === account.id
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-app-elevated text-app-muted hover:text-app-fg',
              ].join(' ')}
            >
              {account.name}
            </button>
          ))}
        </div>
      )}

      {sortedDays.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-app-dashed bg-app-surface/50 py-10 text-center">
          <p className="text-sm text-app-muted">No hay movimientos este mes</p>
        </div>
      ) : (
        <div className="space-y-5">
          {sortedDays.map((dayKey) => {
            const dayTxs = grouped.get(dayKey) ?? []
            const dayDate = parseDateInput(dayKey)

            return (
              <div key={dayKey} className="animate-fade-in">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-app-subtle">
                  {formatDayHeader(dayDate)}
                </h3>
                <div className="space-y-2">
                  {dayTxs.map((tx) => {
                    const account = accountMap.get(tx.accountId)
                    const isIncome = tx.type === 'income'

                    return (
                      <button
                        key={tx.id}
                        type="button"
                        onClick={() => onEditTransaction(tx)}
                        className="flex w-full items-center gap-3 rounded-xl bg-app-surface-muted px-4 py-3 text-left transition-colors hover:bg-app-elevated active:scale-[0.99]"
                      >
                        <div
                          className={[
                            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm',
                            isIncome
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-red-500/15 text-red-400',
                          ].join(' ')}
                        >
                          {isIncome ? '↑' : '↓'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-app-fg">
                            {tx.description}
                          </p>
                          <p className="text-xs text-app-subtle">
                            {getCategoryLabel(tx.category, customCategories)}
                            {account && ` · ${account.name}`}
                          </p>
                        </div>
                        <p
                          className={[
                            'flex-shrink-0 text-sm font-semibold',
                            isIncome ? 'text-emerald-400' : 'text-red-400',
                          ].join(' ')}
                        >
                          {isIncome ? '+' : '-'}
                          {account
                            ? formatCurrency(tx.amount, account.currency)
                            : tx.amount.toFixed(2)}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
