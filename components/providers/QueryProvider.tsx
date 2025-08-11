'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient, queryMetrics } from '@/lib/react-query-client'
import { useEffect } from 'react'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  useEffect(() => {
    // Start performance monitoring in development
    if (process.env.NODE_ENV === 'development') {
      queryMetrics.startPerformanceMonitoring()
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonStyle={{
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: '500',
            zIndex: 99999,
          }}
        />
      )}
    </QueryClientProvider>
  )
}