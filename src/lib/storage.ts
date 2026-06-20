import type { FinanceData } from '../types/finance'

const STORAGE_KEY = 'miplatita-finance-v1'

const DEFAULT_DATA: FinanceData = {
  accounts: [],
  transactions: [],
  customCategories: [],
}

export function loadFinanceData(): FinanceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_DATA
    const parsed = JSON.parse(raw) as Partial<FinanceData>
    return {
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      customCategories: Array.isArray(parsed.customCategories)
        ? parsed.customCategories
        : [],
    }
  } catch {
    return DEFAULT_DATA
  }
}

export function saveFinanceData(data: FinanceData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function hasLocalData(): boolean {
  const data = loadFinanceData()
  return data.accounts.length > 0 || data.transactions.length > 0
}

export function clearFinanceData(): void {
  localStorage.removeItem(STORAGE_KEY)
}
