export type Currency = 'USD' | 'VES' | 'EUR' | 'COP' | 'MXN'

export type TransactionType = 'income' | 'expense'

export type BuiltInCategory =
  | 'food'
  | 'transport'
  | 'housing'
  | 'entertainment'
  | 'health'
  | 'shopping'
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'other'

export type Category = BuiltInCategory | string

export interface CustomCategory {
  id: string
  name: string
  type: TransactionType
  color: string
  createdAt: string
}

export interface Account {
  id: string
  name: string
  currency: Currency
  initialBalance: number
  createdAt: string
}

export interface Transaction {
  id: string
  accountId: string
  type: TransactionType
  amount: number
  description: string
  category: Category
  date: string
  createdAt: string
}

export interface FinanceData {
  accounts: Account[]
  transactions: Transaction[]
  customCategories: CustomCategory[]
}

export interface CategoryStat {
  category: Category
  amount: number
  percentage: number
}

export const CURRENCY_LABELS: Record<Currency, string> = {
  USD: 'Dólares (USD)',
  VES: 'Bolívares (VES)',
  EUR: 'Euros (EUR)',
  COP: 'Pesos colombianos (COP)',
  MXN: 'Pesos mexicanos (MXN)',
}

export const CATEGORY_LABELS: Record<BuiltInCategory, string> = {
  food: 'Comida',
  transport: 'Transporte',
  housing: 'Vivienda',
  entertainment: 'Entretenimiento',
  health: 'Salud',
  shopping: 'Compras',
  salary: 'Salario',
  freelance: 'Freelance',
  investment: 'Inversión',
  other: 'Otros',
}

export const EXPENSE_CATEGORIES: BuiltInCategory[] = [
  'food',
  'transport',
  'housing',
  'entertainment',
  'health',
  'shopping',
  'other',
]

export const INCOME_CATEGORIES: BuiltInCategory[] = [
  'salary',
  'freelance',
  'investment',
  'other',
]

export const CATEGORY_COLORS: Record<BuiltInCategory, string> = {
  food: '#f97316',
  transport: '#3b82f6',
  housing: '#8b5cf6',
  entertainment: '#ec4899',
  health: '#10b981',
  shopping: '#eab308',
  salary: '#22c55e',
  freelance: '#06b6d4',
  investment: '#6366f1',
  other: '#94a3b8',
}

export const CUSTOM_CATEGORY_COLORS = [
  '#f43f5e',
  '#a855f7',
  '#14b8a6',
  '#f59e0b',
  '#64748b',
  '#0ea5e9',
]
