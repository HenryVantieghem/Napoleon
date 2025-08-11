'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { MessageLoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import type { ConnectionStatus } from '@/types'

// Lazy load the heavy MessageStream component
const MessageStream = dynamic(() => import('./MessageStream').then(mod => ({ default: mod.MessageStream })), {
  loading: () => <MessageLoadingSkeleton count={5} />,
  ssr: false // Client-side only for better performance
})

interface LazyMessageStreamProps {
  connectionStatus?: ConnectionStatus
}

export function LazyMessageStream({ connectionStatus }: LazyMessageStreamProps) {
  return (
    <Suspense fallback={<MessageLoadingSkeleton count={5} />}>
      <MessageStream connectionStatus={connectionStatus} />
    </Suspense>
  )
}

export default LazyMessageStream