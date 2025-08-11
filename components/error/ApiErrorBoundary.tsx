'use client'

import React, { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ApiErrorBoundaryProps {
  children: ReactNode
  onRetry?: () => void
  serviceName?: string
}

export function ApiErrorBoundary({ children, onRetry, serviceName = 'API' }: ApiErrorBoundaryProps) {
  const handleError = (error: Error) => {
    console.error(`${serviceName} Error:`, error)
  }

  const ApiErrorFallback = (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 p-8 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
        <WifiOff className="w-8 h-8 text-white" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-3">
        {serviceName} Connection Issue
      </h3>
      
      <p className="text-gray-700 mb-6 max-w-md mx-auto">
        We're having trouble connecting to {serviceName}. This might be due to a temporary 
        network issue or service maintenance.
      </p>

      <div className="flex justify-center gap-3">
        <Button
          onClick={onRetry}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Connection
        </Button>
      </div>

      <div className="mt-4 p-3 bg-amber-100 rounded-lg">
        <p className="text-xs text-amber-800">
          <Wifi className="w-3 h-3 inline mr-1" />
          Check your internet connection or try again in a few minutes
        </p>
      </div>
    </div>
  )

  return (
    <ErrorBoundary 
      fallback={ApiErrorFallback}
      onError={handleError}
      resetOnPropsChange
    >
      {children}
    </ErrorBoundary>
  )
}