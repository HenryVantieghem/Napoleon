'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import type { Message } from '@/types'

// Lazy load the heavy virtual scrolling components
const PriorityGroupedVirtualList = dynamic(() => import('./VirtualMessageList').then(mod => ({ default: mod.PriorityGroupedVirtualList })), {
  loading: () => (
    <div className="border rounded-lg shadow-sm bg-white p-4 animate-pulse">
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  ),
  ssr: false // Virtual scrolling is client-side only
})

const SimpleVirtualList = dynamic(() => import('./VirtualMessageList').then(mod => ({ default: mod.SimpleVirtualList })), {
  loading: () => (
    <div className="border rounded-lg shadow-sm bg-white p-4 animate-pulse">
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  ),
  ssr: false
})

interface LazyPriorityGroupedVirtualListProps {
  messages: Message[]
  height: number
  onMessageClick: (message: Message) => void
  showPrioritySections?: boolean
  className?: string
}

interface LazySimpleVirtualListProps {
  messages: Message[]
  height: number
  onMessageClick: (message: Message) => void
  className?: string
}

export function LazyPriorityGroupedVirtualList({ 
  messages, 
  height, 
  onMessageClick, 
  showPrioritySections = true, 
  className = '' 
}: LazyPriorityGroupedVirtualListProps) {
  return (
    <Suspense fallback={
      <div className={`border rounded-lg shadow-sm bg-white p-4 animate-pulse ${className}`} style={{ height }}>
        <div className="space-y-3">
          {Array.from({ length: Math.min(10, messages.length) }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    }>
      <PriorityGroupedVirtualList
        messages={messages}
        height={height}
        onMessageClick={onMessageClick}
        showPrioritySections={showPrioritySections}
        className={className}
      />
    </Suspense>
  )
}

export function LazySimpleVirtualList({ 
  messages, 
  height, 
  onMessageClick, 
  className = '' 
}: LazySimpleVirtualListProps) {
  return (
    <Suspense fallback={
      <div className={`border rounded-lg shadow-sm bg-white p-4 animate-pulse ${className}`} style={{ height }}>
        <div className="space-y-3">
          {Array.from({ length: Math.min(10, messages.length) }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    }>
      <SimpleVirtualList
        messages={messages}
        height={height}
        onMessageClick={onMessageClick}
        className={className}
      />
    </Suspense>
  )
}