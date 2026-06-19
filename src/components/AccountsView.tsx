import { useMemo } from 'react'
import type { Account, Currency } from '../types/finance'
import { CURRENCY_LABELS } from '../types/finance'
import { CURRENCY_AMOUNT_COLOR, CURRENCY_ORDER } from '../lib/currency-styles'
import { formatCurrency } from '../lib/date'
import { maskAmount } from '../lib/settings'
import { useAccountBalance } from '../hooks/useFinance'
import { CurrencyTotals } from './CurrencyTotals'

interface AccountsViewProps {
  accounts: Account[]
  amountsHidden: boolean
  theme: 'light' | 'dark'
  onTogglePrivacy: () => void
  onToggleTheme: () => void
  onAddAccount: () => void
  onEditAccount: (account: Account) => void
  onBack: () => void
}

function AccountRow({
  account,
  amountsHidden,
  onEdit,
}: {
  account: Account
  amountsHidden: boolean
  onEdit: (account: Account) => void
}) {
  const balance = useAccountBalance(account.id)

  return (
    <button
      type="button"
      onClick={() => onEdit(account)}
      className="flex w-full items-center justify-between rounded-xl bg-app-surface-muted px-4 py-3 text-left transition-colors hover:bg-app-elevated active:scale-[0.99]"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-app-fg">{account.name}</p>
        <p className="text-xs text-app-subtle">{CURRENCY_LABELS[account.currency]}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className={`text-sm font-semibold ${CURRENCY_AMOUNT_COLOR[account.currency]}`}>
          {amountsHidden ? maskAmount(true) : formatCurrency(balance, account.currency)}
        </p>
        <p className="text-xs text-app-subtle">Editar</p>
      </div>
    </button>
  )
}

export function AccountsView({
  accounts,
  amountsHidden,
  theme,
  onTogglePrivacy,
  onToggleTheme,
  onAddAccount,
  onEditAccount,
  onBack,
}: AccountsViewProps) {
  const accountsByCurrency = useMemo(() => {
    const grouped = new Map<Currency, Account[]>()
    for (const account of accounts) {
      const list = grouped.get(account.currency) ?? []
      list.push(account)
      grouped.set(account.currency, list)
    }
    for (const list of grouped.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name))
    }
    return grouped
  }, [accounts])

  const sortedCurrencies = useMemo(() => {
    const fromAccounts = Array.from(accountsByCurrency.keys())
    return fromAccounts.sort((a, b) => {
      const orderA = CURRENCY_ORDER.indexOf(a)
      const orderB = CURRENCY_ORDER.indexOf(b)
      return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB)
    })
  }, [accountsByCurrency])

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-app-muted transition-colors hover:text-app-fg"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-app-dashed bg-app-surface/50 p-8 text-center">
          <p className="text-sm text-app-muted">Aún no tienes cuentas</p>
          <button
            type="button"
            onClick={onAddAccount}
            className="mt-4 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
          >
            + Agregar cuenta
          </button>
        </div>
      ) : (
        <>
          <CurrencyTotals
            amountsHidden={amountsHidden}
            theme={theme}
            onTogglePrivacy={onTogglePrivacy}
            onToggleTheme={onToggleTheme}
          />

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-app-fg">Mis cuentas</h2>
            <button
              type="button"
              onClick={onAddAccount}
              className="text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
              + Agregar cuenta
            </button>
          </div>

          <div className="space-y-5">
            {sortedCurrencies.map((currency) => {
              const currencyAccounts = accountsByCurrency.get(currency) ?? []
              return (
                <div key={currency}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-app-subtle">
                    {CURRENCY_LABELS[currency]}
                  </h3>
                  <div className="space-y-2">
                    {currencyAccounts.map((account) => (
                      <AccountRow
                        key={account.id}
                        account={account}
                        amountsHidden={amountsHidden}
                        onEdit={onEditAccount}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
