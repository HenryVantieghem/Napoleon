'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// Types for cross-tab synchronization
interface CrossTabMessage<T = any> {
  type: string
  data: T
  timestamp: number
  tabId: string
  origin: string
}

interface CrossTabState<T = any> {
  value: T
  lastUpdated: number
  updatedBy: string
}

interface CrossTabSyncOptions<T> {
  key: string
  defaultValue: T
  syncInterval?: number
  conflictResolver?: (current: T, incoming: T) => T
  shouldSync?: (data: T) => boolean
}

// Generate unique tab ID
const generateTabId = () => `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export function useCrossTabSync<T>({
  key,
  defaultValue,
  syncInterval = 1000,
  conflictResolver,
  shouldSync = () => true
}: CrossTabSyncOptions<T>) {
  const [state, setState] = useState<T>(defaultValue)
  const [isOnline, setIsOnline] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [conflictCount, setConflictCount] = useState(0)
  const tabIdRef = useRef<string>(generateTabId())
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null)

  // Initialize BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const channel = new BroadcastChannel(`napoleon-sync-${key}`)
      broadcastChannelRef.current = channel

      // Listen for messages from other tabs
      channel.onmessage = (event: MessageEvent<CrossTabMessage<T>>) => {
        handleCrossTabMessage(event.data)
      }

      // Listen for online/offline events
      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)
      
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      // Initial state load from localStorage
      loadStateFromStorage()

      return () => {
        channel.close()
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current)
        }
      }
    } catch (error) {
      console.warn('BroadcastChannel not supported, falling back to localStorage polling')
      startPolling()
    }
  }, [key])

  // Load state from localStorage
  const loadStateFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(`napoleon-state-${key}`)
      if (stored) {
        const parsed: CrossTabState<T> = JSON.parse(stored)
        setState(parsed.value)
        setLastSync(new Date(parsed.lastUpdated))
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error)
    }
  }, [key])

  // Save state to localStorage
  const saveStateToStorage = useCallback((newState: T) => {
    try {
      const stateData: CrossTabState<T> = {
        value: newState,
        lastUpdated: Date.now(),
        updatedBy: tabIdRef.current
      }
      
      localStorage.setItem(`napoleon-state-${key}`, JSON.stringify(stateData))
    } catch (error) {
      console.error('Failed to save state to localStorage:', error)
    }
  }, [key])

  // Handle messages from other tabs
  const handleCrossTabMessage = useCallback((message: CrossTabMessage<T>) => {
    // Ignore messages from same tab
    if (message.tabId === tabIdRef.current) return

    // Only process messages for our key
    if (!message.type.endsWith(key)) return

    // Check if we should sync this data
    if (!shouldSync(message.data)) return

    console.log('🔄 Cross-tab sync received:', {
      type: message.type,
      from: message.tabId,
      timestamp: new Date(message.timestamp)
    })

    setState(currentState => {
      // Use conflict resolver if provided
      if (conflictResolver && currentState !== defaultValue) {
        const resolved = conflictResolver(currentState, message.data)
        if (resolved !== currentState) {
          setConflictCount(prev => prev + 1)
        }
        return resolved
      }

      // Default: use timestamp to resolve conflicts (last write wins)
      const storedData = localStorage.getItem(`napoleon-state-${key}`)
      if (storedData) {
        const parsed: CrossTabState<T> = JSON.parse(storedData)
        if (message.timestamp > parsed.lastUpdated) {
          setLastSync(new Date(message.timestamp))
          return message.data
        }
        return currentState
      }

      setLastSync(new Date(message.timestamp))
      return message.data
    })
  }, [key, shouldSync, conflictResolver, defaultValue])

  // Broadcast state changes to other tabs
  const broadcastChange = useCallback((newState: T) => {
    if (!broadcastChannelRef.current || !isOnline) return

    const message: CrossTabMessage<T> = {
      type: `state-update-${key}`,
      data: newState,
      timestamp: Date.now(),
      tabId: tabIdRef.current,
      origin: window.location.origin
    }

    try {
      broadcastChannelRef.current.postMessage(message)
      console.log('📡 Cross-tab sync broadcast:', message.type)
    } catch (error) {
      console.error('Failed to broadcast cross-tab message:', error)
    }
  }, [key, isOnline])

  // Update state with cross-tab sync
  const updateState = useCallback((newState: T | ((current: T) => T)) => {
    setState(currentState => {
      const resolvedState = typeof newState === 'function' 
        ? (newState as (current: T) => T)(currentState)
        : newState

      // Only sync if data should be synchronized
      if (shouldSync(resolvedState)) {
        saveStateToStorage(resolvedState)
        broadcastChange(resolvedState)
        setLastSync(new Date())
      }

      return resolvedState
    })
  }, [shouldSync, saveStateToStorage, broadcastChange])

  // Force sync from storage (useful for manual sync)
  const forceSync = useCallback(() => {
    loadStateFromStorage()
  }, [loadStateFromStorage])

  // Polling fallback for browsers without BroadcastChannel
  const startPolling = useCallback(() => {
    const poll = () => {
      const stored = localStorage.getItem(`napoleon-state-${key}`)
      if (stored) {
        const parsed: CrossTabState<T> = JSON.parse(stored)
        
        // Only update if this change came from another tab
        if (parsed.updatedBy !== tabIdRef.current) {
          setState(currentState => {
            if (JSON.stringify(currentState) !== JSON.stringify(parsed.value)) {
              setLastSync(new Date(parsed.lastUpdated))
              return parsed.value
            }
            return currentState
          })
        }
      }

      syncTimeoutRef.current = setTimeout(poll, syncInterval)
    }

    poll()
  }, [key, syncInterval])

  // Clear all synced data
  const clearSyncData = useCallback(() => {
    try {
      localStorage.removeItem(`napoleon-state-${key}`)
      setState(defaultValue)
      setLastSync(null)
      setConflictCount(0)
      
      // Broadcast clear event
      if (broadcastChannelRef.current) {
        const message: CrossTabMessage<null> = {
          type: `state-clear-${key}`,
          data: null,
          timestamp: Date.now(),
          tabId: tabIdRef.current,
          origin: window.location.origin
        }
        broadcastChannelRef.current.postMessage(message)
      }
    } catch (error) {
      console.error('Failed to clear sync data:', error)
    }
  }, [key, defaultValue])

  return {
    state,
    updateState,
    forceSync,
    clearSyncData,
    isOnline,
    lastSync,
    conflictCount,
    tabId: tabIdRef.current
  }
}

// Hook for syncing specific Napoleon AI application state
export function useNapoleonSync() {
  // Sync message refresh state across tabs
  const messageRefresh = useCrossTabSync({
    key: 'message-refresh',
    defaultValue: { lastRefresh: 0, isRefreshing: false },
    shouldSync: (data) => data.lastRefresh > 0
  })

  // Sync connection status across tabs
  const connectionStatus = useCrossTabSync({
    key: 'connection-status',
    defaultValue: { gmail: false, slack: false, lastCheck: 0 },
    conflictResolver: (current, incoming) => {
      // Prefer the most recent connection status
      return incoming.lastCheck > current.lastCheck ? incoming : current
    }
  })

  // Sync error states across tabs
  const errorStates = useCrossTabSync({
    key: 'error-states',
    defaultValue: { errors: [], lastError: 0 },
    shouldSync: (data) => data.errors.length > 0 || data.lastError > 0
  })

  // Sync filter preferences across tabs
  const filterPreferences = useCrossTabSync({
    key: 'filter-preferences',
    defaultValue: { 
      currentFilter: 'all' as 'all' | 'urgent' | 'question' | 'gmail' | 'slack',
      sortBy: 'priority' as 'priority' | 'timestamp',
      lastChanged: 0
    }
  })

  // Trigger refresh across all tabs
  const triggerGlobalRefresh = useCallback(() => {
    messageRefresh.updateState(current => ({
      lastRefresh: Date.now(),
      isRefreshing: true
    }))

    // Clear refreshing state after delay
    setTimeout(() => {
      messageRefresh.updateState(current => ({
        ...current,
        isRefreshing: false
      }))
    }, 3000)
  }, [messageRefresh])

  // Update connection status across tabs
  const updateConnectionStatus = useCallback((status: { gmail: boolean; slack: boolean }) => {
    connectionStatus.updateState({
      ...status,
      lastCheck: Date.now()
    })
  }, [connectionStatus])

  // Share error across tabs
  const shareError = useCallback((error: { id: string; message: string; timestamp: number }) => {
    errorStates.updateState(current => ({
      errors: [...current.errors.filter(e => e.id !== error.id), error],
      lastError: error.timestamp
    }))
  }, [errorStates])

  // Clear error across tabs
  const clearError = useCallback((errorId: string) => {
    errorStates.updateState(current => ({
      ...current,
      errors: current.errors.filter(e => e.id !== errorId)
    }))
  }, [errorStates])

  // Update filter across tabs
  const updateFilter = useCallback((filter: 'all' | 'urgent' | 'question' | 'gmail' | 'slack') => {
    filterPreferences.updateState(current => ({
      ...current,
      currentFilter: filter,
      lastChanged: Date.now()
    }))
  }, [filterPreferences])

  return {
    // Message refresh sync
    messageRefresh: messageRefresh.state,
    triggerGlobalRefresh,
    isRefreshing: messageRefresh.state.isRefreshing,

    // Connection status sync
    connectionStatus: connectionStatus.state,
    updateConnectionStatus,

    // Error state sync
    errorStates: errorStates.state,
    shareError,
    clearError,

    // Filter preferences sync
    filterPreferences: filterPreferences.state,
    updateFilter,

    // General sync info
    isOnline: messageRefresh.isOnline,
    lastSync: Math.max(
      messageRefresh.lastSync?.getTime() || 0,
      connectionStatus.lastSync?.getTime() || 0,
      errorStates.lastSync?.getTime() || 0,
      filterPreferences.lastSync?.getTime() || 0
    ),
    
    // Force sync all
    forceSync: () => {
      messageRefresh.forceSync()
      connectionStatus.forceSync()
      errorStates.forceSync()
      filterPreferences.forceSync()
    },

    // Clear all sync data
    clearAll: () => {
      messageRefresh.clearSyncData()
      connectionStatus.clearSyncData()
      errorStates.clearSyncData()
      filterPreferences.clearSyncData()
    }
  }
}