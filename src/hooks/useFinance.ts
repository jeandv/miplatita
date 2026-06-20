import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type {
  Account,
  Currency,
  FinanceData,
  Transaction,
} from '../types/finance'
import type {
  CreateAccountInput,
  CreateCategoryInput,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../lib/persistence'
import {
  addAccount,
  addCustomCategory,
  addTransaction,
  computeAccountBalance,
  computeTotalsByCurrency,
  removeAccount,
  removeTransaction,
  updateAccount,
  updateTransaction,
} from '../lib/finance-store'
import { financeKeys } from '../lib/query-keys'
import { usePersistence } from '../contexts/AuthProvider'

// ---------------------------------------------------------------------------
// Shared query options builder (needs strategy from context)
// ---------------------------------------------------------------------------

function useFinanceQueryOptions() {
  const strategy = usePersistence()
  return {
    queryKey: financeKeys.all,
    queryFn: () => strategy.fetchAll(),
    staleTime: Infinity,
  }
}

// ---------------------------------------------------------------------------
// Data hooks
// ---------------------------------------------------------------------------

type FinanceContext = { previous?: FinanceData }

export function useFinanceData() {
  const opts = useFinanceQueryOptions()
  return useQuery({
    ...opts,
    notifyOnChangeProps: ['data', 'error', 'isFetching'],
  })
}

export function useAccounts(): Account[] {
  const opts = useFinanceQueryOptions()
  const { data } = useQuery({
    ...opts,
    select: (d) => d.accounts,
  })
  return data ?? []
}

export function useTransactions(): Transaction[] {
  const opts = useFinanceQueryOptions()
  const { data } = useQuery({
    ...opts,
    select: (d) => d.transactions,
  })
  return data ?? []
}

export function useCustomCategories() {
  const opts = useFinanceQueryOptions()
  const { data } = useQuery({
    ...opts,
    select: (d) => d.customCategories,
  })
  return data ?? []
}

export function useAccountBalance(accountId: string) {
  const opts = useFinanceQueryOptions()
  const { data = 0 } = useQuery({
    ...opts,
    select: (d) => {
      const account = d.accounts.find((a) => a.id === accountId)
      if (!account) return 0
      return computeAccountBalance(account, d.transactions)
    },
  })
  return data
}

export function useTotalsByCurrency() {
  const opts = useFinanceQueryOptions()
  const { data } = useQuery({
    ...opts,
    select: computeTotalsByCurrency,
  })
  return data ?? new Map<Currency, number>()
}

export function useIsFinanceMutating() {
  return useIsMutating({ mutationKey: financeKeys.all }) > 0
}

// ---------------------------------------------------------------------------
// Mutation helper
// ---------------------------------------------------------------------------

function useFinanceMutation<TInput, TResult>(
  updater: (data: FinanceData, input: TInput) => FinanceData,
  mutationFn: (input: TInput) => Promise<TResult>,
) {
  const queryClient = useQueryClient()

  return useMutation<TResult, Error, TInput, FinanceContext>({
    mutationKey: financeKeys.all,
    mutationFn,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: financeKeys.all })
      const previous = queryClient.getQueryData<FinanceData>(financeKeys.all)
      if (previous) {
        queryClient.setQueryData<FinanceData>(
          financeKeys.all,
          updater(previous, input),
        )
      }
      return { previous }
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(financeKeys.all, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all })
    },
  })
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

export function useCreateAccount() {
  const strategy = usePersistence()
  return useFinanceMutation(
    (data, input: CreateAccountInput) =>
      addAccount(data, {
        name: input.name,
        currency: input.currency as Currency,
        initialBalance: input.initialBalance,
      }),
    (input) => strategy.createAccount(input),
  )
}

/**
 * Input type for the update-account hook. The form sends `balance` (the
 * displayed balance), which `finance-store.updateAccount` uses to
 * back-calculate the correct `initialBalance`.
 */
interface UpdateAccountHookInput {
  id: string
  name: string
  currency: string
  balance: number
}

export function useUpdateAccount() {
  const strategy = usePersistence()
  const queryClient = useQueryClient()

  return useFinanceMutation(
    (data, input: UpdateAccountHookInput) =>
      updateAccount(data, {
        id: input.id,
        name: input.name,
        currency: input.currency as Currency,
        balance: input.balance,
      }),
    (input) => {
      // After the optimistic update runs, the cache has the correct
      // initialBalance (back-calculated by finance-store.updateAccount).
      // Read it from cache to pass to the strategy.
      const cached = queryClient.getQueryData<FinanceData>(financeKeys.all)
      const updatedAccount = cached?.accounts.find((a) => a.id === input.id)
      return strategy.updateAccount({
        id: input.id,
        name: input.name,
        currency: input.currency,
        initialBalance: updatedAccount?.initialBalance ?? input.balance,
      })
    },
  )
}

export function useCreateTransaction() {
  const strategy = usePersistence()
  return useFinanceMutation(
    (data, input: CreateTransactionInput) =>
      addTransaction(data, {
        accountId: input.accountId,
        type: input.type,
        amount: input.amount,
        description: input.description,
        category: input.category,
        date: input.date,
      }),
    (input) => strategy.createTransaction(input),
  )
}

export function useUpdateTransaction() {
  const strategy = usePersistence()
  return useFinanceMutation(
    (data, input: UpdateTransactionInput) => {
      const existing = data.transactions.find((tx) => tx.id === input.id)
      if (!existing) return data
      return updateTransaction(data, {
        id: input.id,
        accountId: input.accountId ?? existing.accountId,
        type: input.type ?? existing.type,
        amount: input.amount ?? existing.amount,
        description: input.description ?? existing.description,
        category: input.category ?? existing.category,
        date: input.date ?? existing.date,
      })
    },
    (input) => strategy.updateTransaction(input),
  )
}

export function useDeleteTransaction() {
  const strategy = usePersistence()
  return useFinanceMutation(
    (data, id: string) => removeTransaction(data, id),
    (id) => strategy.deleteTransaction(id),
  )
}

export function useDeleteAccount() {
  const strategy = usePersistence()
  return useFinanceMutation(
    (data, id: string) => removeAccount(data, id),
    (id) => strategy.deleteAccount(id),
  )
}

export function useCreateCustomCategory() {
  const strategy = usePersistence()
  return useFinanceMutation(
    (data, input: CreateCategoryInput) =>
      addCustomCategory(data, {
        name: input.name,
        type: input.type,
      }),
    (input) => strategy.createCategory(input),
  )
}

export { computeAccountBalance }
