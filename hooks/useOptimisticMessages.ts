'use client'

import { useState, useCallback, useMemo } from 'react'
import type { Message } from '@/types'

interface OptimisticUpdate {
  id: string
  type: 'refresh' | 'mark_read' | 'priority_change' | 'cache_update'
  timestamp: number
  payload?: any
}

interface UseOptimisticMessagesOptions {
  onOptimisticUpdate?: (update: OptimisticUpdate) => void
  onRollback?: (update: OptimisticUpdate, error: Error) => void
}

export function useOptimisticMessages(
  messages: Message[],
  options: UseOptimisticMessagesOptions = {}
) {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, OptimisticUpdate>>(new Map())
  const [isUpdating, setIsUpdating] = useState(false)

  // Apply optimistic updates to messages
  const optimizedMessages = useMemo(() => {
    let result = [...messages]
    
    // Apply each optimistic update
    optimisticUpdates.forEach((update) => {
      switch (update.type) {
        case 'mark_read':
          result = result.map(msg => 
            msg.id === update.payload?.messageId 
              ? { ...msg, metadata: { ...msg.metadata, read: true } }
              : msg
          )
          break
        case 'priority_change':
          result = result.map(msg =>
            msg.id === update.payload?.messageId
              ? { ...msg, priority: update.payload.newPriority }
              : msg
          )
          break
        case 'cache_update':
          // For cache updates, we might add new messages optimistically
          if (update.payload?.newMessages) {
            result = [...update.payload.newMessages, ...result]
          }
          break
      }
    })
    
    return result
  }, [messages, optimisticUpdates])

  // Add optimistic update
  const addOptimisticUpdate = useCallback((update: Omit<OptimisticUpdate, 'timestamp'>) => {
    const fullUpdate: OptimisticUpdate = {
      ...update,
      timestamp: Date.now()
    }
    
    setOptimisticUpdates(prev => new Map(prev).set(update.id, fullUpdate))
    options.onOptimisticUpdate?.(fullUpdate)
    
    return fullUpdate
  }, [options])

  // Remove optimistic update (on success or rollback)
  const removeOptimisticUpdate = useCallback((updateId: string) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev)
      newMap.delete(updateId)
      return newMap
    })
  }, [])

  // Rollback optimistic update (on error)
  const rollbackOptimisticUpdate = useCallback((updateId: string, error: Error) => {
    const update = optimisticUpdates.get(updateId)
    if (update) {
      removeOptimisticUpdate(updateId)
      options.onRollback?.(update, error)
    }
  }, [optimisticUpdates, removeOptimisticUpdate, options])

  // Optimistic refresh with immediate UI feedback
  const optimisticRefresh = useCallback(async (
    refreshFn: () => Promise<Message[]>
  ): Promise<Message[]> => {
    const updateId = `refresh-${Date.now()}`
    
    // Show loading state immediately
    setIsUpdating(true)
    addOptimisticUpdate({
      id: updateId,
      type: 'refresh'
    })

    try {
      // Perform the actual refresh
      const newMessages = await refreshFn()
      
      // Remove optimistic update on success
      removeOptimisticUpdate(updateId)
      
      return newMessages
    } catch (error) {
      // Rollback optimistic update on error
      rollbackOptimisticUpdate(updateId, error as Error)
      throw error
    } finally {
      setIsUpdating(false)
    }
  }, [addOptimisticUpdate, removeOptimisticUpdate, rollbackOptimisticUpdate])

  // Optimistic message action (mark as read, change priority, etc.)
  const optimisticMessageAction = useCallback(async <T>(
    messageId: string,
    action: string,
    payload: any,
    actionFn: () => Promise<T>
  ): Promise<T> => {
    const updateId = `${action}-${messageId}-${Date.now()}`
    
    // Apply optimistic update immediately
    addOptimisticUpdate({
      id: updateId,
      type: action as any,
      payload: { messageId, ...payload }
    })

    try {
      // Perform the actual action
      const result = await actionFn()
      
      // Remove optimistic update on success
      removeOptimisticUpdate(updateId)
      
      return result
    } catch (error) {
      // Rollback optimistic update on error
      rollbackOptimisticUpdate(updateId, error as Error)
      throw error
    }
  }, [addOptimisticUpdate, removeOptimisticUpdate, rollbackOptimisticUpdate])

  // Optimistic cache update with background refresh
  const optimisticCacheUpdate = useCallback(async (
    cacheKey: string,
    fetchFn: () => Promise<Message[]>,
    backgroundRefresh = true
  ): Promise<Message[]> => {
    const updateId = `cache-${cacheKey}-${Date.now()}`

    try {
      // Check if we have cached data to show immediately
      const cachedData = localStorage.getItem(`cache-${cacheKey}`)
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData)
          
          // Show cached data immediately (optimistic)
          addOptimisticUpdate({
            id: updateId,
            type: 'cache_update',
            payload: { newMessages: parsedData.messages || [] }
          })
        } catch (parseError) {
          console.warn('Failed to parse cached data:', parseError)
        }
      }

      // Fetch fresh data
      const freshMessages = await fetchFn()
      
      // Update cache
      if (backgroundRefresh) {
        localStorage.setItem(`cache-${cacheKey}`, JSON.stringify({
          messages: freshMessages,
          timestamp: Date.now()
        }))
      }
      
      // Remove optimistic update - real data will take over
      removeOptimisticUpdate(updateId)
      
      return freshMessages
    } catch (error) {
      // If cached data was shown, rollback to original state
      rollbackOptimisticUpdate(updateId, error as Error)
      throw error
    }
  }, [addOptimisticUpdate, removeOptimisticUpdate, rollbackOptimisticUpdate])

  // Clean up expired optimistic updates (older than 30 seconds)
  const cleanupExpiredUpdates = useCallback(() => {
    const thirtySecondsAgo = Date.now() - 30000
    
    setOptimisticUpdates(prev => {
      const cleaned = new Map()
      prev.forEach((update, key) => {
        if (update.timestamp > thirtySecondsAgo) {
          cleaned.set(key, update)
        }
      })
      return cleaned
    })
  }, [])

  return {
    // Optimized messages with updates applied
    messages: optimizedMessages,
    
    // State
    isUpdating,
    hasOptimisticUpdates: optimisticUpdates.size > 0,
    
    // Actions
    optimisticRefresh,
    optimisticMessageAction,
    optimisticCacheUpdate,
    
    // Utilities
    addOptimisticUpdate,
    removeOptimisticUpdate,
    rollbackOptimisticUpdate,
    cleanupExpiredUpdates
  }
}