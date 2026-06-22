import { useMemo } from 'react'
import type { Account, Currency } from '../types/finance'
import { CURRENCY_LABELS } from '../types/finance'
import { CURRENCY_AMOUNT_COLOR, CURRENCY_ORDER } from '../lib/currency-styles'
import { formatCurrency } from '../lib/date'
import { maskAmount } from '../lib/settings'
import { useAccountBalance } from '../hooks/useFinance'
import { AnimatedGroup } from './motion/AnimatedGroup'
import { AnimatedNumber } from './motion/AnimatedNumber'
import { CurrencyTotals } from './CurrencyTotals'

interface AccountsViewProps {
  accounts: Account[]
  amountsHidden: boolean
  theme: 'light' | 'dark'
  onTogglePrivacy: () => void
  onToggleTheme: () => void
  onAddAccount: () => void
  onViewMovements: (account: Account) => void
  onEditAccount: (account: Account) => void
  onBack: () => void
}

function AccountRow({
  account,
  amountsHidden,
  onView,
  onEdit,
}: {
  account: Account
  amountsHidden: boolean
  onView: (account: Account) => void
  onEdit: (account: Account) => void
}) {
  const balance = useAccountBalance(account.id)

  return (
    <div className="flex items-center gap-2 rounded-xl bg-app-surface-muted pr-2 transition-colors hover:bg-app-elevated">
      {/* Primary action: open this account's movements (filtered list). */}
      <button
        type="button"
        onClick={() => onView(account)}
        className="flex min-w-0 flex-1 items-center justify-between px-4 py-3 text-left active:scale-[0.99]"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-app-fg">{account.name}</p>
          <p className="text-xs text-app-subtle">{CURRENCY_LABELS[account.currency]}</p>
        </div>
        <div className="flex-shrink-0 pl-2 text-right">
          <p className={`text-sm font-semibold ${CURRENCY_AMOUNT_COLOR[account.currency]}`}>
            {amountsHidden ? (
              maskAmount(true)
            ) : (
              <AnimatedNumber
                value={balance}
                format={(v) => formatCurrency(v, account.currency)}
                springOptions={{ stiffness: 120, damping: 24 }}
              />
            )}
          </p>
          <p className="text-xs text-app-subtle">Ver movimientos</p>
        </div>
      </button>

      {/* Secondary action: edit the account. */}
      <button
        type="button"
        onClick={() => onEdit(account)}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-app-elevated text-app-muted transition-colors hover:bg-app-hover hover:text-app-fg active:scale-95"
        aria-label={`Editar ${account.name}`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
      </button>
    </div>
  )
}

export function AccountsView({
  accounts,
  amountsHidden,
  theme,
  onTogglePrivacy,
  onToggleTheme,
  onAddAccount,
  onViewMovements,
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
            className="mt-4 text-sm font-semibold text-app-accent transition-opacity hover:opacity-70"
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
              className="text-xs font-semibold text-app-accent transition-opacity hover:opacity-70"
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
                  <AnimatedGroup
                    preset="blur-slide"
                    className="space-y-2"
                    variants={{
                      container: {
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.05 } },
                      },
                    }}
                  >
                    {currencyAccounts.map((account) => (
                      <AccountRow
                        key={account.id}
                        account={account}
                        amountsHidden={amountsHidden}
                        onView={onViewMovements}
                        onEdit={onEditAccount}
                      />
                    ))}
                  </AnimatedGroup>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
