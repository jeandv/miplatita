import { useMemo, useState } from 'react'
import type { Account, Transaction } from '../types/finance'
import { CURRENCY_AMOUNT_COLOR } from '../lib/currency-styles'
import { CURRENCY_LABELS } from '../types/finance'
import { formatCurrency } from '../lib/date'
import { maskAmount } from '../lib/settings'
import { useAccountBalance } from '../hooks/useFinance'
import { AnimatedNumber } from './motion/AnimatedNumber'
import { CategoryStats } from './CategoryStats'
import { TopGradient } from './TopGradient'
import { TransactionList } from './TransactionList'

type DetailTab = 'movements' | 'stats'

interface AccountDetailViewProps {
  account: Account
  transactions: Transaction[]
  amountsHidden: boolean
  onBack: () => void
  onEditAccount: (account: Account) => void
  onEditTransaction: (transaction: Transaction) => void
  onAddTransaction: (type: 'expense' | 'income') => void
}

/**
 * Dedicated, single-account screen. Shows only this account's movements, with
 * a small toggle to peek at its category statistics. Reuses TransactionList
 * and CategoryStats, both fed transactions pre-scoped to this account.
 */
export function AccountDetailView({
  account,
  transactions,
  amountsHidden,
  onBack,
  onEditAccount,
  onEditTransaction,
  onAddTransaction,
}: AccountDetailViewProps) {
  const [tab, setTab] = useState<DetailTab>('movements')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const balance = useAccountBalance(account.id)

  const accountTransactions = useMemo(
    () => transactions.filter((tx) => tx.accountId === account.id),
    [transactions, account.id],
  )

  return (
    <div className="relative flex min-h-dvh flex-col bg-app text-app-fg animate-fade-in">
      <TopGradient />
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-safe pb-28">
        <header className="mb-5 flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-app-elevated text-app-muted transition-colors hover:bg-app-hover hover:text-app-fg"
            aria-label="Volver"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-tight">{account.name}</h1>
            <p className={`text-sm font-semibold ${CURRENCY_AMOUNT_COLOR[account.currency]}`}>
              {amountsHidden ? (
                maskAmount(true)
              ) : (
                <>
                  <AnimatedNumber
                    value={balance}
                    format={(v) => formatCurrency(v, account.currency)}
                    springOptions={{ stiffness: 120, damping: 24 }}
                  />
                  {` · ${CURRENCY_LABELS[account.currency]}`}
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEditAccount(account)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-app-elevated text-app-muted transition-colors hover:bg-app-hover hover:text-app-fg active:scale-95"
            aria-label={`Editar ${account.name}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </button>
        </header>

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setTab(tab === 'movements' ? 'stats' : 'movements')}
            className="inline-flex items-center gap-1.5 rounded-full bg-app-elevated px-3 py-1.5 text-xs font-medium text-app-muted transition-colors hover:bg-app-hover hover:text-app-fg active:scale-95"
          >
            {tab === 'movements' ? (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
                Ver estadísticas
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                Ver movimientos
              </>
            )}
          </button>
        </div>

        <div>
          {tab === 'movements' ? (
            <TransactionList
              transactions={accountTransactions}
              accounts={[account]}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              selectedAccountId={null}
              onAccountFilterChange={() => {}}
              onEditTransaction={onEditTransaction}
              amountsHidden={amountsHidden}
              hideAccountFilter
            />
          ) : (
            <CategoryStats transactions={accountTransactions} accounts={[account]} />
          )}
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-app bg-app-bottom backdrop-blur-lg pb-safe">
        <div className="mx-auto flex max-w-lg items-center justify-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => onAddTransaction('expense')}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500/15 py-3.5 text-sm font-semibold text-red-400 transition-all duration-200 hover:bg-red-500/25 active:scale-[0.97]"
          >
            <span className="text-lg leading-none">−</span>
            Gasto
          </button>
          <button
            type="button"
            onClick={() => onAddTransaction('income')}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500/15 py-3.5 text-sm font-semibold text-emerald-400 transition-all duration-200 hover:bg-emerald-500/25 active:scale-[0.97]"
          >
            <span className="text-lg leading-none">+</span>
            Ingreso
          </button>
        </div>
      </div>
    </div>
  )
}
