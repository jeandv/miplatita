import type { CategoryStat, Transaction } from '../types/finance'

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function startOfWeek(date: Date): Date {
  const d = startOfDay(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(date)
}

export function formatDayHeader(date: Date): string {
  const today = startOfDay(new Date())
  const target = startOfDay(date)

  if (isSameDay(today, target)) return 'Hoy'
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameDay(yesterday, target)) return 'Ayer'

  return new Intl.DateTimeFormat('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateInput(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function groupTransactionsByDay(
  transactions: Transaction[],
): Map<string, Transaction[]> {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const groups = new Map<string, Transaction[]>()
  for (const tx of sorted) {
    const key = toDateInputValue(new Date(tx.date))
    const existing = groups.get(key) ?? []
    existing.push(tx)
    groups.set(key, existing)
  }
  return groups
}

export function filterTransactionsByMonth(
  transactions: Transaction[],
  month: Date,
): Transaction[] {
  return transactions.filter((tx) => isSameMonth(new Date(tx.date), month))
}

export function filterTransactionsByAccount(
  transactions: Transaction[],
  accountId: string | null,
): Transaction[] {
  if (!accountId) return transactions
  return transactions.filter((tx) => tx.accountId === accountId)
}

export function calculateMonthTotals(
  transactions: Transaction[],
  month: Date,
  accountId: string | null = null,
): { income: number; expense: number } {
  const filtered = filterTransactionsByAccount(
    filterTransactionsByMonth(transactions, month),
    accountId,
  )

  return filtered.reduce(
    (acc, tx) => {
      if (tx.type === 'income') acc.income += tx.amount
      else acc.expense += tx.amount
      return acc
    },
    { income: 0, expense: 0 },
  )
}

export function calculateMonthTotalsByCurrency(
  transactions: Transaction[],
  accounts: { id: string; currency: string }[],
  month: Date,
  accountId: string | null = null,
): Map<string, { income: number; expense: number }> {
  const accountMap = new Map(accounts.map((a) => [a.id, a.currency]))
  const filtered = filterTransactionsByAccount(
    filterTransactionsByMonth(transactions, month),
    accountId,
  )

  const totals = new Map<string, { income: number; expense: number }>()
  for (const tx of filtered) {
    const currency = accountMap.get(tx.accountId) ?? 'USD'
    const current = totals.get(currency) ?? { income: 0, expense: 0 }
    if (tx.type === 'income') current.income += tx.amount
    else current.expense += tx.amount
    totals.set(currency, current)
  }
  return totals
}


export type PeriodFilter = 'day' | 'week' | 'month'

export function filterExpensesByPeriod(
  transactions: Transaction[],
  period: PeriodFilter,
  referenceDate: Date = new Date(),
): Transaction[] {
  const expenses = transactions.filter((tx) => tx.type === 'expense')
  const ref = startOfDay(referenceDate)

  if (period === 'day') {
    return expenses.filter((tx) => isSameDay(new Date(tx.date), ref))
  }

  if (period === 'week') {
    const weekStart = startOfWeek(ref)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    return expenses.filter((tx) => {
      const d = new Date(tx.date)
      return d >= weekStart && d <= weekEnd
    })
  }

  return expenses.filter((tx) => isSameMonth(new Date(tx.date), ref))
}

export function calculateCategoryStats(
  transactions: Transaction[],
): CategoryStat[] {
  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0)
  if (total === 0) return []

  const byCategory = new Map<string, number>()
  for (const tx of transactions) {
    byCategory.set(tx.category, (byCategory.get(tx.category) ?? 0) + tx.amount)
  }

  return Array.from(byCategory.entries())
    .map(([category, amount]) => ({
      category: category as CategoryStat['category'],
      amount,
      percentage: Math.round((amount / total) * 100),
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function formatCurrency(amount: number, currency: string): string {
  const locales: Record<string, string> = {
    USD: 'en-US',
    VES: 'es-VE',
    EUR: 'de-DE',
    COP: 'es-CO',
    MXN: 'es-MX',
  }

  return new Intl.NumberFormat(locales[currency] ?? 'es', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'VES' ? 2 : 2,
    maximumFractionDigits: currency === 'VES' ? 2 : 2,
  }).format(amount)
}

