import { QueryClient } from '@tanstack/react-query'

// Create a custom query client with executive-grade performance settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Executive Dashboard Performance Settings
      staleTime: 5 * 60 * 1000, // 5 minutes - keep data fresh for executives
      gcTime: 10 * 60 * 1000, // 10 minutes - cache cleanup time
      retry: (failureCount, error: any) => {
        // Smart retry logic for different error types
        if (error?.status === 401 || error?.status === 403) {
          return false // Don't retry auth errors
        }
        if (error?.status >= 500) {
          return failureCount < 3 // Retry server errors up to 3 times
        }
        return failureCount < 2 // Retry other errors up to 2 times
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff, max 10s
      refetchOnWindowFocus: true, // Refresh when executive returns to tab
      refetchOnReconnect: true, // Refresh on network reconnect
      refetchInterval: false, // Disable automatic polling (we'll handle manually)
      networkMode: 'online', // Only fetch when online
    },
    mutations: {
      retry: 1, // Retry mutations once on failure
      networkMode: 'online',
    },
  },
})

// Query Keys - Centralized and typed for better cache management
export const queryKeys = {
  // Messages
  messages: {
    all: ['messages'] as const,
    unified: (userId: string) => ['messages', 'unified', userId] as const,
    gmail: (userId: string) => ['messages', 'gmail', userId] as const,
    slack: (userId: string) => ['messages', 'slack', userId] as const,
    stats: (userId: string) => ['messages', 'stats', userId] as const,
  },
  
  // User data
  user: {
    all: ['user'] as const,
    tokens: (userId: string) => ['user', 'tokens', userId] as const,
    connections: (userId: string) => ['user', 'connections', userId] as const,
    profile: (userId: string) => ['user', 'profile', userId] as const,
  },
  
  // Performance
  performance: {
    all: ['performance'] as const,
    cache: () => ['performance', 'cache'] as const,
    metrics: (userId: string) => ['performance', 'metrics', userId] as const,
  },
} as const

// Cache invalidation utilities for executive workflow
export const cacheUtils = {
  // Invalidate all user-related data (on logout/context change)
  invalidateUserData: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.messages.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.user.all })
    queryClient.removeQueries({ queryKey: queryKeys.performance.metrics(userId) })
  },

  // Invalidate messages (on manual refresh)
  invalidateMessages: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.messages.unified(userId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.messages.stats(userId) })
  },

  // Prefetch critical data for performance
  prefetchMessages: async (userId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.messages.unified(userId),
      queryFn: () => fetch('/api/messages/unified').then(res => res.json()),
      staleTime: 2 * 60 * 1000, // 2 minutes for prefetch
    })
  },

  // Set optimistic data for immediate feedback
  setOptimisticMessages: (userId: string, messages: any[]) => {
    queryClient.setQueryData(queryKeys.messages.unified(userId), (oldData: any) => ({
      ...oldData,
      messages,
      optimistic: true,
      timestamp: Date.now()
    }))
  },

  // Clear all caches (emergency reset)
  clearAllCaches: () => {
    queryClient.clear()
  },
}

// Performance monitoring for React Query
export const queryMetrics = {
  getQueryStats: () => {
    const cache = queryClient.getQueryCache()
    const queries = cache.getAll()
    
    const stats = {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.observers.length > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.isFetching()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      cacheSize: queries.reduce((size, q) => size + JSON.stringify(q.state.data).length, 0),
      avgFetchTime: 0, // Will be calculated from query observers
    }

    return stats
  },

  // Monitor cache performance
  startPerformanceMonitoring: () => {
    const cache = queryClient.getQueryCache()
    
    cache.subscribe((event) => {
      if (event?.type === 'queryUpdated' && event.query.state.status === 'success') {
        const fetchTime = event.query.state.dataUpdateCount > 0 
          ? Date.now() - (event.query.state.dataUpdatedAt || 0)
          : 0

        console.log(`⚡ Query Cache: ${event.query.queryKey.join('.')} - ${fetchTime}ms`)
      }
    })
  }
}