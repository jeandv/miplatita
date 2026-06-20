import { QueryClient } from '@tanstack/react-query'

export function createQueryClient(): QueryClient {
  return new QueryClient({
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
}
