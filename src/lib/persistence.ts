import type {
  Account,
  CustomCategory,
  FinanceData,
  Transaction,
} from '../types/finance'
import { loadFinanceData, saveFinanceData } from './storage'
import {
  addAccount as storeAddAccount,
  addTransaction as storeAddTransaction,
  updateTransaction as storeUpdateTransaction,
  removeTransaction as storeRemoveTransaction,
  removeAccount as storeRemoveAccount,
  addCustomCategory as storeAddCustomCategory,
  persistFinanceData,
} from './finance-store'
import { api } from './api'

// ---------------------------------------------------------------------------
// Input / output types
// ---------------------------------------------------------------------------

export interface CreateAccountInput {
  name: string
  currency: string
  initialBalance: number
}

export interface UpdateAccountInput {
  id: string
  name?: string
  currency?: string
  initialBalance?: number
}

export interface CreateTransactionInput {
  accountId: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: string
}

export interface UpdateTransactionInput {
  id: string
  accountId?: string
  type?: 'income' | 'expense'
  amount?: number
  description?: string
  category?: string
  date?: string
}

export interface CreateCategoryInput {
  name: string
  type: 'income' | 'expense'
  color?: string
}

export interface TransactionFilters {
  accountId?: string
  month?: string
  type?: 'income' | 'expense'
  limit?: number
  offset?: number
}

export interface TransactionListResult {
  data: Transaction[]
  total: number
}

export interface ImportResult {
  imported: { accounts: number; transactions: number; categories: number }
}

// ---------------------------------------------------------------------------
// Strategy interface
// ---------------------------------------------------------------------------

export interface PersistenceStrategy {
  fetchAll(): Promise<FinanceData>
  createAccount(input: CreateAccountInput): Promise<Account>
  updateAccount(input: UpdateAccountInput): Promise<Account>
  deleteAccount(id: string): Promise<void>
  fetchTransactions(filters?: TransactionFilters): Promise<TransactionListResult>
  createTransaction(input: CreateTransactionInput): Promise<Transaction>
  updateTransaction(input: UpdateTransactionInput): Promise<Transaction>
  deleteTransaction(id: string): Promise<void>
  fetchCategories(): Promise<CustomCategory[]>
  createCategory(input: CreateCategoryInput): Promise<CustomCategory>
  importData(data: FinanceData): Promise<ImportResult>
}

// ---------------------------------------------------------------------------
// API response parsers (PostgreSQL returns numeric columns as strings)
// ---------------------------------------------------------------------------

function parseAccount(raw: Record<string, unknown>): Account {
  return { ...(raw as unknown as Account), initialBalance: Number(raw.initialBalance) }
}

function parseTransaction(raw: Record<string, unknown>): Transaction {
  return { ...(raw as unknown as Transaction), amount: Number(raw.amount) }
}

// ---------------------------------------------------------------------------
// LocalPersistence — wraps existing storage.ts / finance-store.ts functions
// ---------------------------------------------------------------------------

export class LocalPersistence implements PersistenceStrategy {
  async fetchAll(): Promise<FinanceData> {
    return loadFinanceData()
  }

  async createAccount(input: CreateAccountInput): Promise<Account> {
    const data = loadFinanceData()
    const updated = storeAddAccount(data, {
      name: input.name,
      currency: input.currency as Account['currency'],
      initialBalance: input.initialBalance,
    })
    persistFinanceData(updated)
    // The new account is the last one added
    return updated.accounts[updated.accounts.length - 1]
  }

  async updateAccount(input: UpdateAccountInput): Promise<Account> {
    const data = loadFinanceData()
    const existing = data.accounts.find((a) => a.id === input.id)
    if (!existing) throw new Error('Cuenta no encontrada')

    const updated: Account = {
      ...existing,
      ...(input.name !== undefined && { name: input.name }),
      ...(input.currency !== undefined && { currency: input.currency as Account['currency'] }),
      ...(input.initialBalance !== undefined && { initialBalance: input.initialBalance }),
    }

    const newData: FinanceData = {
      ...data,
      accounts: data.accounts.map((a) => (a.id === input.id ? updated : a)),
    }
    persistFinanceData(newData)
    return updated
  }

  async deleteAccount(id: string): Promise<void> {
    const data = loadFinanceData()
    const updated = storeRemoveAccount(data, id)
    persistFinanceData(updated)
  }

  async fetchTransactions(filters?: TransactionFilters): Promise<TransactionListResult> {
    const data = loadFinanceData()
    let txs = [...data.transactions]

    if (filters?.accountId) {
      txs = txs.filter((tx) => tx.accountId === filters.accountId)
    }

    if (filters?.type) {
      txs = txs.filter((tx) => tx.type === filters.type)
    }

    if (filters?.month) {
      txs = txs.filter((tx) => tx.date.startsWith(filters.month!))
    }

    // Sort by date descending
    txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const total = txs.length
    const offset = filters?.offset ?? 0
    const limit = filters?.limit ?? txs.length

    return {
      data: txs.slice(offset, offset + limit),
      total,
    }
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const data = loadFinanceData()
    const updated = storeAddTransaction(data, {
      accountId: input.accountId,
      type: input.type,
      amount: input.amount,
      description: input.description,
      category: input.category,
      date: input.date,
    })
    persistFinanceData(updated)
    return updated.transactions[updated.transactions.length - 1]
  }

  async updateTransaction(input: UpdateTransactionInput): Promise<Transaction> {
    const data = loadFinanceData()
    const existing = data.transactions.find((tx) => tx.id === input.id)
    if (!existing) throw new Error('Movimiento no encontrado')

    const merged = {
      id: input.id,
      accountId: input.accountId ?? existing.accountId,
      type: input.type ?? existing.type,
      amount: input.amount ?? existing.amount,
      description: input.description ?? existing.description,
      category: input.category ?? existing.category,
      date: input.date ?? existing.date,
    }

    const updated = storeUpdateTransaction(data, merged)
    persistFinanceData(updated)
    return updated.transactions.find((tx) => tx.id === input.id)!
  }

  async deleteTransaction(id: string): Promise<void> {
    const data = loadFinanceData()
    const updated = storeRemoveTransaction(data, id)
    persistFinanceData(updated)
  }

  async fetchCategories(): Promise<CustomCategory[]> {
    const data = loadFinanceData()
    return data.customCategories
  }

  async createCategory(input: CreateCategoryInput): Promise<CustomCategory> {
    const data = loadFinanceData()
    const updated = storeAddCustomCategory(data, {
      name: input.name,
      type: input.type,
    })
    persistFinanceData(updated)
    return updated.customCategories[updated.customCategories.length - 1]
  }

  async importData(_data: FinanceData): Promise<ImportResult> {
    // Local import replaces all data
    saveFinanceData(_data)
    return {
      imported: {
        accounts: _data.accounts.length,
        transactions: _data.transactions.length,
        categories: _data.customCategories.length,
      },
    }
  }
}

// ---------------------------------------------------------------------------
// ApiPersistence — wraps the typed fetch helper from api.ts
// ---------------------------------------------------------------------------

export class ApiPersistence implements PersistenceStrategy {
  async fetchAll(): Promise<FinanceData> {
    const raw = await api.get<{
      accounts: Record<string, unknown>[]
      transactions: Record<string, unknown>[]
      customCategories: CustomCategory[]
    }>('/finance')
    return {
      accounts: raw.accounts.map(parseAccount),
      transactions: raw.transactions.map(parseTransaction),
      customCategories: raw.customCategories,
    }
  }

  async createAccount(input: CreateAccountInput): Promise<Account> {
    const raw = await api.post<Record<string, unknown>>('/accounts', input)
    return parseAccount(raw)
  }

  async updateAccount(input: UpdateAccountInput): Promise<Account> {
    const { id, ...body } = input
    const raw = await api.put<Record<string, unknown>>(`/accounts/${id}`, body)
    return parseAccount(raw)
  }

  async deleteAccount(id: string): Promise<void> {
    await api.delete(`/accounts/${id}`)
  }

  async fetchTransactions(filters?: TransactionFilters): Promise<TransactionListResult> {
    const params = new URLSearchParams()
    if (filters?.accountId) params.set('accountId', filters.accountId)
    if (filters?.month) params.set('month', filters.month)
    if (filters?.type) params.set('type', filters.type)
    if (filters?.limit !== undefined) params.set('limit', String(filters.limit))
    if (filters?.offset !== undefined) params.set('offset', String(filters.offset))

    const qs = params.toString()
    const raw = await api.get<{
      data: Record<string, unknown>[]
      total: number
    }>(`/transactions${qs ? `?${qs}` : ''}`)

    return {
      data: raw.data.map(parseTransaction),
      total: raw.total,
    }
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const raw = await api.post<Record<string, unknown>>('/transactions', input)
    return parseTransaction(raw)
  }

  async updateTransaction(input: UpdateTransactionInput): Promise<Transaction> {
    const { id, ...body } = input
    const raw = await api.put<Record<string, unknown>>(`/transactions/${id}`, body)
    return parseTransaction(raw)
  }

  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`)
  }

  async fetchCategories(): Promise<CustomCategory[]> {
    return api.get<CustomCategory[]>('/categories')
  }

  async createCategory(input: CreateCategoryInput): Promise<CustomCategory> {
    return api.post<CustomCategory>('/categories', input)
  }

  async importData(data: FinanceData): Promise<ImportResult> {
    return api.post<ImportResult>('/finance/import', data)
  }
}
