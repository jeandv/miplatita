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
import {
  addAccount,
  addCustomCategory,
  addTransaction,
  computeAccountBalance,
  computeTotalsByCurrency,
  persistFinanceData,
  removeAccount,
  removeTransaction,
  updateAccount,
  updateTransaction,
} from '../lib/finance-store'
import { financeKeys } from '../lib/query-keys'
import { loadFinanceData } from '../lib/storage'

type FinanceContext = { previous?: FinanceData }

function readData(): FinanceData {
  return loadFinanceData()
}

export const financeQueryOptions = {
  queryKey: financeKeys.all,
  queryFn: readData,
  staleTime: Infinity,
  initialData: () => loadFinanceData(),
  initialDataUpdatedAt: () => Date.now(),
} as const

export function useFinanceData() {
  return useQuery({
    ...financeQueryOptions,
    notifyOnChangeProps: ['data', 'error', 'isFetching'],
  })
}

export function useAccounts(): Account[] {
  const { data } = useQuery({
    ...financeQueryOptions,
    select: (d) => d.accounts,
  })
  return data ?? []
}

export function useTransactions(): Transaction[] {
  const { data } = useQuery({
    ...financeQueryOptions,
    select: (d) => d.transactions,
  })
  return data ?? []
}

export function useCustomCategories() {
  const { data } = useQuery({
    ...financeQueryOptions,
    select: (d) => d.customCategories,
  })
  return data ?? []
}

export function useAccountBalance(accountId: string) {
  const { data = 0 } = useQuery({
    ...financeQueryOptions,
    select: (d) => {
      const account = d.accounts.find((a) => a.id === accountId)
      if (!account) return 0
      return computeAccountBalance(account, d.transactions)
    },
  })
  return data
}

export function useTotalsByCurrency() {
  const { data } = useQuery({
    ...financeQueryOptions,
    select: computeTotalsByCurrency,
  })
  return data ?? new Map<Currency, number>()
}

export function useIsFinanceMutating() {
  return useIsMutating({ mutationKey: financeKeys.all }) > 0
}

function useFinanceMutation<TInput>(
  updater: (data: FinanceData, input: TInput) => FinanceData,
) {
  const queryClient = useQueryClient()

  return useMutation<FinanceData, Error, TInput, FinanceContext>({
    mutationKey: financeKeys.all,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: financeKeys.all })
      const previous = queryClient.getQueryData<FinanceData>(financeKeys.all) ?? readData()
      queryClient.setQueryData<FinanceData>(financeKeys.all, updater(previous, input))
      return { previous }
    },
    mutationFn: async () => {
      const current = queryClient.getQueryData<FinanceData>(financeKeys.all)
      if (!current) throw new Error('Datos no disponibles')
      return persistFinanceData(current)
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(financeKeys.all, context.previous)
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(financeKeys.all, data)
    },
  })
}

export function useCreateAccount() {
  return useFinanceMutation(addAccount)
}

export function useUpdateAccount() {
  return useFinanceMutation(updateAccount)
}

export function useCreateTransaction() {
  return useFinanceMutation(addTransaction)
}

export function useUpdateTransaction() {
  return useFinanceMutation(updateTransaction)
}

export function useDeleteTransaction() {
  return useFinanceMutation((data, id: string) => removeTransaction(data, id))
}

export function useDeleteAccount() {
  return useFinanceMutation((data, id: string) => removeAccount(data, id))
}

export function useCreateCustomCategory() {
  return useFinanceMutation(addCustomCategory)
}

export { computeAccountBalance }
