'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { MessageLoadingSkeleton, ConnectionLoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import type { ConnectionStatus } from '@/types'

// Lazy load heavy components with intelligent loading strategies
const LazyMessageStream = dynamic(() => import('./LazyMessageStream').then(mod => ({ default: mod.LazyMessageStream })), {
  loading: () => <MessageLoadingSkeleton count={5} />,
  ssr: false // Message stream is interactive, doesn't need SSR
})

const LazyConnectAccounts = dynamic(() => import('./LazyConnectAccounts').then(mod => ({ default: mod.LazyConnectAccounts })), {
  loading: () => <ConnectionLoadingSkeleton />,
  ssr: false
})

interface OptimizedDashboardProps {
  initialConnectionStatus?: ConnectionStatus
}

export function OptimizedDashboard({ initialConnectionStatus }: OptimizedDashboardProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | undefined>(initialConnectionStatus)
  const [loading, setLoading] = useState(!initialConnectionStatus)

  useEffect(() => {
    // If no initial connection status, fetch it
    if (!initialConnectionStatus) {
      fetchConnectionStatus()
    }
  }, [initialConnectionStatus])

  const fetchConnectionStatus = async () => {
    try {
      const response = await fetch('/api/user/tokens')
      if (response.ok) {
        const data = await response.json()
        setConnectionStatus(data.connected)
      }
    } catch (error) {
      console.error('Failed to fetch connection status:', error)
      // Default to no connections for graceful degradation
      setConnectionStatus({ gmail: false, slack: false })
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while determining connection status
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
        <ConnectionLoadingSkeleton />
      </div>
    )
  }

  const hasConnections = connectionStatus?.gmail || connectionStatus?.slack

  return (
    <div className="space-y-8">
      {/* Conditionally load components based on connection status */}
      {hasConnections ? (
        <Suspense fallback={<MessageLoadingSkeleton count={5} />}>
          <LazyMessageStream connectionStatus={connectionStatus} />
        </Suspense>
      ) : (
        <Suspense fallback={<ConnectionLoadingSkeleton />}>
          <LazyConnectAccounts />
        </Suspense>
      )}
    </div>
  )
}

// Preload components when user is likely to need them
export function preloadDashboardComponents() {
  // Preload MessageStream when user has connections
  import('./LazyMessageStream')
  // Preload ConnectAccounts for users without connections
  import('./LazyConnectAccounts')
  // Preload virtual scrolling components for large message lists
  import('../ui/LazyVirtualMessageList')
}

export default OptimizedDashboard