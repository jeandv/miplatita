/** Filters for transaction queries. Matches the shape in persistence.ts */
export interface TransactionFilters {
  accountId?: string
  categoryId?: string
  type?: 'income' | 'expense'
  from?: string
  to?: string
}

export const financeKeys = {
  all:          ['finance'] as const,
  accounts:     ['finance', 'accounts'] as const,
  transactions: (filters?: TransactionFilters) =>
    ['finance', 'transactions', filters] as const,
  categories:   ['finance', 'categories'] as const,
}
