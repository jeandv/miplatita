import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Account, Transaction } from './types/finance'
import { useAccounts, useIsFinanceMutating, useTransactions } from './hooks/useFinance'
import { usePrivacy } from './hooks/usePrivacy'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './contexts/AuthProvider'
import { AccountDetailView } from './components/AccountDetailView'
import { AccountForm } from './components/AccountForm'
import { AccountsView } from './components/AccountsView'
import { CategoryStats } from './components/CategoryStats'
import { CurrencyTotals } from './components/CurrencyTotals'
import { GrainGradient } from './components/GrainGradient'
import { ImportDialog } from './components/ImportDialog'
import { ProfileView } from './components/ProfileView'
import { SyncIndicator } from './components/SyncIndicator'
import { TopGradient } from './components/TopGradient'
import { TransactionForm } from './components/TransactionForm'
import { TransactionList } from './components/TransactionList'
import { TextShimmer } from './components/motion/TextShimmer'

type Tab = 'movements' | 'stats'
type Screen =
  | 'home'
  | 'accounts'
  | 'account-detail'
  | 'profile'
  | 'account-form'
  | 'transaction-form'

interface FinanceAppProps {
  /** Leave the app entirely (logout) and return to the landing page. */
  onLogout: () => void
  /** Guest taps "Iniciar sesión": exit guest mode and go to the login page. */
  onRequestLogin: () => void
}

const ROTATING_MESSAGES = [
  'Control de gastos e ingresos',
  'Cuida tu plata',
  'No gastes tanto',
  'Sé inteligente',
  'Lograrás tu meta',
]

export function FinanceApp({ onLogout, onRequestLogin }: FinanceAppProps) {
  const { isAuthenticated } = useAuth()
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ROTATING_MESSAGES.length)
    }, 20000)
    return () => clearInterval(interval)
  }, [])
  const accounts = useAccounts()
  const transactions = useTransactions()
  const isMutating = useIsFinanceMutating()
  const { amountsHidden, toggleAmountsHidden } = usePrivacy()
  const { theme, toggleTheme } = useTheme()

  const [screen, setScreen] = useState<Screen>('home')
  const [activeTab, setActiveTab] = useState<Tab>('movements')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  // Screen to return to when a full-page form closes.
  const [formOrigin, setFormOrigin] = useState<Screen>('home')
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  // Account whose dedicated detail screen is open (looked up live for freshness).
  const [detailAccountId, setDetailAccountId] = useState<string | null>(null)
  const detailAccount = accounts.find((a) => a.id === detailAccountId) ?? null

  function openCreateAccount(origin: Screen) {
    setEditingAccount(null)
    setFormOrigin(origin)
    setScreen('account-form')
  }

  function openEditAccount(account: Account, origin: Screen = 'accounts') {
    setEditingAccount(account)
    setFormOrigin(origin)
    setScreen('account-form')
  }

  function viewAccountMovements(account: Account) {
    setDetailAccountId(account.id)
    setScreen('account-detail')
  }

  function openTransactionForm(type: 'expense' | 'income', origin: Screen = 'home') {
    setEditingTransaction(null)
    setTransactionType(type)
    setFormOrigin(origin)
    setScreen('transaction-form')
  }

  function openEditTransaction(transaction: Transaction, origin: Screen = 'home') {
    setEditingTransaction(transaction)
    setTransactionType(transaction.type)
    setFormOrigin(origin)
    setScreen('transaction-form')
  }

  function closeForm() {
    setEditingAccount(null)
    setEditingTransaction(null)
    setScreen(formOrigin)
  }

  const isFormOpen = screen === 'account-form' || screen === 'transaction-form'
  const activeBaseScreen = isFormOpen ? formOrigin : screen

  let baseContent: ReactNode

  if (activeBaseScreen === 'account-detail' && detailAccount) {
    baseContent = (
      <AccountDetailView
        account={detailAccount}
        transactions={transactions}
        amountsHidden={amountsHidden}
        onBack={() => setScreen('accounts')}
        onEditAccount={(account) => openEditAccount(account, 'account-detail')}
        onEditTransaction={(tx) => openEditTransaction(tx, 'account-detail')}
        onAddTransaction={(type) => openTransactionForm(type, 'account-detail')}
      />
    )
  } else if (activeBaseScreen === 'profile' && isAuthenticated) {
    baseContent = <ProfileView onBack={() => setScreen('home')} onLogout={onLogout} />
  } else if (activeBaseScreen === 'accounts') {
    baseContent = (
      <div className="relative flex min-h-dvh flex-col bg-app text-app-fg">
        <TopGradient />
        <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-safe">
          <header className="mb-6 pt-4">
            <h1 className="text-2xl font-bold tracking-tight">Cuentas</h1>
          </header>
          <div className="-mx-4 flex-1 px-4 pb-8">
            <AccountsView
              accounts={accounts}
              amountsHidden={amountsHidden}
              theme={theme}
              onTogglePrivacy={toggleAmountsHidden}
              onToggleTheme={toggleTheme}
              onAddAccount={() => openCreateAccount('accounts')}
              onViewMovements={viewAccountMovements}
              onEditAccount={openEditAccount}
              onBack={() => setScreen('home')}
            />
          </div>
        </div>
      </div>
    )
  } else {
    baseContent = (
    <div className="relative flex min-h-dvh flex-col bg-app text-app-fg">
      <GrainGradient />
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-safe pb-28">
        <header className="mb-6 pt-4">
          <div className="flex items-start justify-between">
            <div>
              <TextShimmer as="h1" duration={3} className="text-2xl font-bold tracking-tight">Mi Platita</TextShimmer>
              <div className="relative h-5 text-sm text-app-muted">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={messageIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="absolute inset-0 whitespace-nowrap"
                  >
                    {ROTATING_MESSAGES[messageIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setScreen('profile')}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-app-accent-soft text-app-fg transition-colors bg-app-accent-soft-hover"
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
                  className="text-xs font-semibold text-app-accent transition-opacity hover:opacity-70"
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
                onClick={() => openCreateAccount('home')}
                className="mt-3 text-sm font-semibold text-app-accent transition-opacity hover:opacity-70"
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

      <ImportDialog />
    </div>
    )
  }

  return (
    <>
      {isMutating && <SyncIndicator />}
      <div style={{ display: isFormOpen ? 'none' : 'block' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBaseScreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {baseContent}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {screen === 'account-form' && (
          <motion.div
            key="account-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 z-50 overflow-y-auto bg-app"
          >
            <AccountForm account={editingAccount} onClose={closeForm} />
          </motion.div>
        )}
        {screen === 'transaction-form' && (
          <motion.div
            key="transaction-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 z-50 overflow-y-auto bg-app"
          >
            <TransactionForm
              defaultType={transactionType}
              transaction={editingTransaction}
              defaultAccountId={detailAccountId ?? undefined}
              onClose={closeForm}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
