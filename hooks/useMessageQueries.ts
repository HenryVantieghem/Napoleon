'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@clerk/nextjs'
import { queryKeys, cacheUtils } from '@/lib/react-query-client'
import type { Message } from '@/types'

// Unified Messages Query with advanced caching
export function useUnifiedMessages(options?: {
  enabled?: boolean
  refetchInterval?: number | false
  staleTime?: number
}) {
  const { user } = useUser()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: queryKeys.messages.unified(user?.id || ''),
    queryFn: async (): Promise<{
      messages: Message[]
      stats: any
      connections: any
      errors?: any[]
      fetchedAt: string
      cached?: boolean
      cacheHit?: boolean
    }> => {
      const response = await fetch('/api/messages/unified', {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`)
      }

      const data = await response.json()
      
      // Log cache performance
      if (data.cacheHit) {
        console.log('⚡ React Query + Server Cache HIT - Ultra fast response')
      }

      return data
    },
    enabled: !!user?.id && (options?.enabled !== false),
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes default
    refetchInterval: options?.refetchInterval || false,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('401')) return false
      return failureCount < 3
    },
    select: (data) => ({
      ...data,
      // Add derived data for performance
      priorityMessages: {
        urgent: data.messages?.filter(m => m.priority === 'urgent') || [],
        question: data.messages?.filter(m => m.priority === 'question') || [],
        normal: data.messages?.filter(m => m.priority === 'normal') || [],
      }
    }),
    meta: {
      // Metadata for performance tracking
      description: 'Unified messages with priority filtering',
      critical: true, // Mark as critical query for monitoring
    }
  })
}

// Connection Status Query
export function useConnectionStatus(options?: { enabled?: boolean }) {
  const { user } = useUser()

  return useQuery({
    queryKey: queryKeys.user.connections(user?.id || ''),
    queryFn: async () => {
      const response = await fetch('/api/user/tokens')
      if (!response.ok) {
        throw new Error(`Failed to fetch connection status: ${response.status}`)
      }
      return response.json()
    },
    enabled: !!user?.id && (options?.enabled !== false),
    staleTime: 10 * 60 * 1000, // 10 minutes - connection status doesn't change often
    select: (data) => ({
      gmail: data.connected?.gmail || false,
      slack: data.connected?.slack || false,
      details: data.details || {},
      hasAnyConnection: data.connected?.gmail || data.connected?.slack
    })
  })
}

// Messages Refresh Mutation with optimistic updates
export function useRefreshMessages() {
  const { user } = useUser()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<any> => {
      // Add a small delay to show optimistic feedback
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const response = await fetch('/api/messages/unified', {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to refresh messages: ${response.status}`)
      }

      return response.json()
    },
    onMutate: async () => {
      const userId = user?.id || ''
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.messages.unified(userId) })

      // Get current data for rollback
      const previousMessages = queryClient.getQueryData(queryKeys.messages.unified(userId))

      // Optimistically show refreshing state
      queryClient.setQueryData(queryKeys.messages.unified(userId), (old: any) => ({
        ...old,
        refreshing: true,
        optimistic: true
      }))

      return { previousMessages }
    },
    onSuccess: (newData) => {
      const userId = user?.id || ''
      
      // Update the cache with new data
      queryClient.setQueryData(queryKeys.messages.unified(userId), newData)
      
      // Also invalidate to trigger background refetch for other tabs
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.unified(userId) })
    },
    onError: (error, variables, context) => {
      const userId = user?.id || ''
      
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(queryKeys.messages.unified(userId), context.previousMessages)
      }
      
      console.error('Failed to refresh messages:', error)
    },
    onSettled: () => {
      const userId = user?.id || ''
      
      // Always refetch after mutation settles to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.unified(userId) })
    }
  })
}

// Cache Performance Query
export function useCachePerformance(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.performance.cache(),
    queryFn: async () => {
      const response = await fetch('/api/cache/performance')
      if (!response.ok) {
        throw new Error(`Failed to fetch cache performance: ${response.status}`)
      }
      return response.json()
    },
    enabled: options?.enabled !== false,
    staleTime: 30 * 1000, // 30 seconds - performance data can be slightly stale
    refetchInterval: 60 * 1000, // Refresh every minute for monitoring
    select: (data) => ({
      ...data,
      // Add computed metrics
      isHealthy: data.overall?.hitRate > 70,
      needsAttention: data.overall?.hitRate < 50,
      memoryUsageMB: Math.round(data.overall?.memoryUsage / 1024 / 1024 * 100) / 100,
    })
  })
}

// Background prefetch for performance
export function usePrefetchMessages() {
  const { user } = useUser()
  const queryClient = useQueryClient()

  const prefetchMessages = async () => {
    if (user?.id) {
      await cacheUtils.prefetchMessages(user.id)
    }
  }

  const prefetchConnections = async () => {
    if (user?.id) {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.user.connections(user.id),
        queryFn: () => fetch('/api/user/tokens').then(res => res.json()),
        staleTime: 5 * 60 * 1000, // 5 minutes
      })
    }
  }

  return {
    prefetchMessages,
    prefetchConnections,
    prefetchAll: async () => {
      await Promise.all([
        prefetchMessages(),
        prefetchConnections()
      ])
    }
  }
}

// Smart invalidation utilities
export function useSmartInvalidation() {
  const { user } = useUser()
  const queryClient = useQueryClient()

  return {
    // Invalidate everything (user logout, major error)
    invalidateAll: () => {
      if (user?.id) {
        cacheUtils.invalidateUserData(user.id)
      }
    },

    // Invalidate just messages (manual refresh, new data)
    invalidateMessages: () => {
      if (user?.id) {
        cacheUtils.invalidateMessages(user.id)
      }
    },

    // Clear cache and force fresh fetch (connection changes)
    hardRefresh: () => {
      if (user?.id) {
        queryClient.removeQueries({ queryKey: queryKeys.messages.all })
        queryClient.removeQueries({ queryKey: queryKeys.user.connections(user.id) })
      }
    },

    // Soft refresh (background update)
    softRefresh: () => {
      if (user?.id) {
        queryClient.refetchQueries({ queryKey: queryKeys.messages.unified(user.id) })
      }
    }
  }
}