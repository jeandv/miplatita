import { QueryClient } from '@tanstack/react-query'
import { loadFinanceData } from './storage'
import { financeKeys } from './query-keys'

export function createQueryClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60 * 24,
        structuralSharing: true,
      },
      mutations: {
        retry: false,
      },
    },
  })

  client.setQueryData(financeKeys.all, loadFinanceData())

  return client
}
