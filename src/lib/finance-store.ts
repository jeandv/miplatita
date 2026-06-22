import type {
  Account,
  Category,
  Currency,
  FinanceData,
  Transaction,
  TransactionType,
} from '../types/finance'
import { pickCustomCategoryColor } from './categories'
import { dateInputToISO } from './date'
import { generateId, saveFinanceData } from './storage'

export function persistFinanceData(data: FinanceData): FinanceData {
  saveFinanceData(data)
  return data
}

export function addAccount(
  data: FinanceData,
  input: { name: string; currency: Currency; initialBalance: number },
): FinanceData {
  const account: Account = {
    id: generateId(),
    name: input.name.trim(),
    currency: input.currency,
    initialBalance: input.initialBalance,
    createdAt: new Date().toISOString(),
  }
  return {
    ...data,
    accounts: [...data.accounts, account],
  }
}

export function updateAccount(
  data: FinanceData,
  input: { id: string; name: string; currency: Currency; balance: number },
): FinanceData {
  const account = data.accounts.find((a) => a.id === input.id)
  if (!account) throw new Error('Cuenta no encontrada')

  const delta = data.transactions
    .filter((tx) => tx.accountId === input.id)
    .reduce(
      (sum, tx) => sum + (tx.type === 'income' ? tx.amount : -tx.amount),
      0,
    )

  const updated: Account = {
    ...account,
    name: input.name.trim(),
    currency: input.currency,
    initialBalance: input.balance - delta,
  }

  return {
    ...data,
    accounts: data.accounts.map((a) => (a.id === input.id ? updated : a)),
  }
}

export function addTransaction(
  data: FinanceData,
  input: {
    accountId: string
    type: TransactionType
    amount: number
    description: string
    category: Category
    date: string
    id?: string
  },
): FinanceData {
  const transaction: Transaction = {
    id: input.id ?? generateId(),
    accountId: input.accountId,
    type: input.type,
    amount: input.amount,
    description: input.description.trim(),
    category: input.category,
    date: dateInputToISO(input.date),
    createdAt: new Date().toISOString(),
  }
  return {
    ...data,
    transactions: [...data.transactions, transaction],
  }
}

export function updateTransaction(
  data: FinanceData,
  input: {
    id: string
    accountId: string
    type: TransactionType
    amount: number
    description: string
    category: Category
    date: string
  },
): FinanceData {
  const existing = data.transactions.find((tx) => tx.id === input.id)
  if (!existing) throw new Error('Movimiento no encontrado')

  const updated: Transaction = {
    ...existing,
    accountId: input.accountId,
    type: input.type,
    amount: input.amount,
    description: input.description.trim(),
    category: input.category,
    date: dateInputToISO(input.date),
  }

  return {
    ...data,
    transactions: data.transactions.map((tx) =>
      tx.id === input.id ? updated : tx,
    ),
  }
}

export function removeTransaction(
  data: FinanceData,
  transactionId: string,
): FinanceData {
  return {
    ...data,
    transactions: data.transactions.filter((tx) => tx.id !== transactionId),
  }
}

export function removeAccount(data: FinanceData, accountId: string): FinanceData {
  return {
    ...data,
    accounts: data.accounts.filter((a) => a.id !== accountId),
    transactions: data.transactions.filter((tx) => tx.accountId !== accountId),
  }
}

export function addCustomCategory(
  data: FinanceData,
  input: { name: string; type: TransactionType },
): FinanceData {
  const category = {
    id: generateId(),
    name: input.name.trim(),
    type: input.type,
    color: pickCustomCategoryColor(data.customCategories.length),
    createdAt: new Date().toISOString(),
  }
  return {
    ...data,
    customCategories: [...data.customCategories, category],
  }
}

export function computeAccountBalance(
  account: Account,
  transactions: Transaction[],
): number {
  const delta = transactions
    .filter((tx) => tx.accountId === account.id)
    .reduce(
      (sum, tx) => sum + (tx.type === 'income' ? tx.amount : -tx.amount),
      0,
    )
  return account.initialBalance + delta
}

export function computeTotalsByCurrency(
  data: FinanceData,
): Map<Currency, number> {
  const totals = new Map<Currency, number>()
  for (const account of data.accounts) {
    const balance = computeAccountBalance(account, data.transactions)
    totals.set(account.currency, (totals.get(account.currency) ?? 0) + balance)
  }
  return totals
}
