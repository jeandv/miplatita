import { useState } from 'react'
import type { Account, Transaction } from './types/finance'
import { useAccounts, useIsFinanceMutating, useTransactions } from './hooks/useFinance'
import { usePrivacy } from './hooks/usePrivacy'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './contexts/AuthProvider'
import { AccountForm } from './components/AccountForm'
import { AccountsView } from './components/AccountsView'
import { CategoryStats } from './components/CategoryStats'
import { CurrencyTotals } from './components/CurrencyTotals'
import { ImportDialog } from './components/ImportDialog'
import { ProfileView } from './components/ProfileView'
import { SyncIndicator } from './components/SyncIndicator'
import { TopGradient } from './components/TopGradient'
import { TransactionForm } from './components/TransactionForm'
import { TransactionList } from './components/TransactionList'

type Tab = 'movements' | 'stats'
type Screen = 'home' | 'accounts' | 'profile'

interface FinanceAppProps {
  /** Leave the app entirely (logout) and return to the landing page. */
  onLogout: () => void
  /** Guest taps "Iniciar sesión": exit guest mode and go to the login page. */
  onRequestLogin: () => void
}

export function FinanceApp({ onLogout, onRequestLogin }: FinanceAppProps) {
  const { isAuthenticated, user } = useAuth()
  const accounts = useAccounts()
  const transactions = useTransactions()
  const isMutating = useIsFinanceMutating()
  const { amountsHidden, toggleAmountsHidden } = usePrivacy()
  const { theme, toggleTheme } = useTheme()

  const [screen, setScreen] = useState<Screen>('home')
  const [activeTab, setActiveTab] = useState<Tab>('movements')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  const [showAccountForm, setShowAccountForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  function openCreateAccount() {
    setEditingAccount(null)
    setShowAccountForm(true)
  }

  function openEditAccount(account: Account) {
    setEditingAccount(account)
    setShowAccountForm(true)
  }

  function closeAccountForm() {
    setShowAccountForm(false)
    setEditingAccount(null)
  }

  function openTransactionForm(type: 'expense' | 'income') {
    setEditingTransaction(null)
    setTransactionType(type)
    setShowTransactionForm(true)
  }

  function openEditTransaction(transaction: Transaction) {
    setEditingTransaction(transaction)
    setTransactionType(transaction.type)
    setShowTransactionForm(true)
  }

  function closeTransactionForm() {
    setShowTransactionForm(false)
    setEditingTransaction(null)
  }

  if (screen === 'profile' && isAuthenticated) {
    return (
      <ProfileView
        onBack={() => setScreen('home')}
        onLogout={onLogout}
      />
    )
  }

  if (screen === 'accounts') {
    return (
      <div className="relative min-h-dvh bg-app text-app-fg">
        {isMutating && <SyncIndicator />}
        <TopGradient />
        <div className="relative z-10 mx-auto max-w-lg px-4 pb-28 pt-safe">
          <header className="mb-6 pt-4">
            <h1 className="text-2xl font-bold tracking-tight">Mi Platita</h1>
          </header>
          <AccountsView
            accounts={accounts}
            amountsHidden={amountsHidden}
            theme={theme}
            onTogglePrivacy={toggleAmountsHidden}
            onToggleTheme={toggleTheme}
            onAddAccount={openCreateAccount}
            onEditAccount={openEditAccount}
            onBack={() => setScreen('home')}
          />
        </div>

        <AccountForm
          open={showAccountForm}
          onClose={closeAccountForm}
          account={editingAccount}
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh bg-app text-app-fg">
      {isMutating && <SyncIndicator />}
      <TopGradient />
      <div className="relative z-10 mx-auto max-w-lg px-4 pb-28 pt-safe">
        <header className="mb-6 pt-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Mi Platita</h1>
              <p className="text-sm text-app-muted">
                {isAuthenticated && user ? `Bienvenido, ${user.name}` : 'Control de gastos e ingresos'}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setScreen('profile')}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 transition-colors hover:bg-emerald-500/25"
                  aria-label="Perfil"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onRequestLogin}
                  className="text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          </div>
        </header>

        {accounts.length > 0 ? (
          <section className="mb-6">
            <CurrencyTotals
              amountsHidden={amountsHidden}
              theme={theme}
              onTogglePrivacy={toggleAmountsHidden}
              onToggleTheme={toggleTheme}
              onViewAccounts={() => setScreen('accounts')}
            />
          </section>
        ) : (
          <section className="mb-6">
            <div className="rounded-2xl border border-dashed border-app-dashed bg-app-surface/50 p-6 text-center">
              <p className="text-sm text-app-muted">Crea tu primera cuenta para empezar</p>
              <button
                type="button"
                onClick={openCreateAccount}
                className="mt-3 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
              >
                + Agregar cuenta
              </button>
            </div>
          </section>
        )}

        <div className="mb-4 flex rounded-xl bg-app-tab p-1">
          <button
            type="button"
            onClick={() => setActiveTab('movements')}
            className={[
              'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200',
              activeTab === 'movements'
                ? 'bg-app-tab-active text-app-fg shadow-sm'
                : 'text-app-muted hover:text-app-fg',
            ].join(' ')}
          >
            Movimientos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={[
              'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200',
              activeTab === 'stats'
                ? 'bg-app-tab-active text-app-fg shadow-sm'
                : 'text-app-muted hover:text-app-fg',
            ].join(' ')}
          >
            Estadísticas
          </button>
        </div>

        <section className="animate-fade-in">
          {activeTab === 'movements' ? (
            <TransactionList
              transactions={transactions}
              accounts={accounts}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              selectedAccountId={selectedAccountId}
              onAccountFilterChange={setSelectedAccountId}
              onEditTransaction={openEditTransaction}
              amountsHidden={amountsHidden}
            />
          ) : (
            <CategoryStats transactions={transactions} accounts={accounts} />
          )}
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-app bg-app-bottom backdrop-blur-lg pb-safe">
        <div className="mx-auto flex max-w-lg items-center justify-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => openTransactionForm('expense')}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500/15 py-3.5 text-sm font-semibold text-red-400 transition-all duration-200 hover:bg-red-500/25 active:scale-[0.97]"
          >
            <span className="text-lg leading-none">−</span>
            Gasto
          </button>
          <button
            type="button"
            onClick={() => openTransactionForm('income')}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500/15 py-3.5 text-sm font-semibold text-emerald-400 transition-all duration-200 hover:bg-emerald-500/25 active:scale-[0.97]"
          >
            <span className="text-lg leading-none">+</span>
            Ingreso
          </button>
        </div>
      </div>

      <AccountForm
        open={showAccountForm}
        onClose={closeAccountForm}
        account={editingAccount}
      />
      <TransactionForm
        open={showTransactionForm}
        onClose={closeTransactionForm}
        defaultType={transactionType}
        transaction={editingTransaction}
      />
      <ImportDialog />
    </div>
  )
}
