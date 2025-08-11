'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { ConnectionLoadingSkeleton } from '@/components/ui/LoadingSkeleton'

// Lazy load the ConnectAccounts component (only needed when no connections exist)
const ConnectAccounts = dynamic(() => import('./ConnectAccounts').then(mod => ({ default: mod.ConnectAccounts })), {
  loading: () => (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="text-center animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
      </div>
      
      {/* Connection cards skeleton */}
      <ConnectionLoadingSkeleton />
    </div>
  ),
  ssr: false // Client-side only for better performance
})

export function LazyConnectAccounts() {
  return (
    <Suspense fallback={
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="text-center animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
        
        {/* Connection cards skeleton */}
        <ConnectionLoadingSkeleton />
      </div>
    }>
      <ConnectAccounts />
    </Suspense>
  )
}

export default LazyConnectAccounts