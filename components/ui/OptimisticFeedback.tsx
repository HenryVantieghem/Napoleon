'use client'

import { useState, useEffect } from 'react'
import { Check, X, RefreshCw, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OptimisticFeedbackProps {
  isLoading?: boolean
  isSuccess?: boolean
  isError?: boolean
  loadingText?: string
  successText?: string
  errorText?: string
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center'
  variant?: 'toast' | 'inline' | 'overlay'
  className?: string
}

export function OptimisticFeedback({
  isLoading = false,
  isSuccess = false,
  isError = false,
  loadingText = 'Loading...',
  successText = 'Success!',
  errorText = 'Failed to load',
  duration = 3000,
  position = 'top-right',
  variant = 'toast',
  className
}: OptimisticFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentState, setCurrentState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (isLoading) {
      setCurrentState('loading')
      setIsVisible(true)
    } else if (isSuccess) {
      setCurrentState('success')
      setIsVisible(true)
      setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => setCurrentState('idle'), 300) // Wait for fade out
      }, duration)
    } else if (isError) {
      setCurrentState('error')
      setIsVisible(true)
      setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => setCurrentState('idle'), 300)
      }, duration)
    } else {
      setIsVisible(false)
      setTimeout(() => setCurrentState('idle'), 300)
    }
  }, [isLoading, isSuccess, isError, duration])

  if (currentState === 'idle') {
    return null
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'fixed top-4 right-4 z-50'
      case 'top-left':
        return 'fixed top-4 left-4 z-50'
      case 'bottom-right':
        return 'fixed bottom-4 right-4 z-50'
      case 'bottom-left':
        return 'fixed bottom-4 left-4 z-50'
      case 'center':
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50'
      default:
        return 'fixed top-4 right-4 z-50'
    }
  }

  const getVariantClasses = () => {
    const baseClasses = 'rounded-lg shadow-lg border px-4 py-3 flex items-center space-x-2 max-w-sm'
    
    switch (variant) {
      case 'toast':
        return cn(
          baseClasses,
          'backdrop-blur-sm',
          currentState === 'loading' && 'bg-blue-50/90 border-blue-200 text-blue-900',
          currentState === 'success' && 'bg-green-50/90 border-green-200 text-green-900',
          currentState === 'error' && 'bg-red-50/90 border-red-200 text-red-900'
        )
      case 'inline':
        return cn(
          'rounded-md px-3 py-2 flex items-center space-x-2 text-sm',
          currentState === 'loading' && 'bg-blue-50 text-blue-700',
          currentState === 'success' && 'bg-green-50 text-green-700',
          currentState === 'error' && 'bg-red-50 text-red-700'
        )
      case 'overlay':
        return cn(
          baseClasses,
          'bg-white/95 backdrop-blur-md',
          currentState === 'loading' && 'border-blue-300',
          currentState === 'success' && 'border-green-300',
          currentState === 'error' && 'border-red-300'
        )
      default:
        return baseClasses
    }
  }

  const getIcon = () => {
    switch (currentState) {
      case 'loading':
        return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'success':
        return <Check className="w-4 h-4" />
      case 'error':
        return <X className="w-4 h-4" />
      default:
        return <Zap className="w-4 h-4" />
    }
  }

  const getText = () => {
    switch (currentState) {
      case 'loading':
        return loadingText
      case 'success':
        return successText
      case 'error':
        return errorText
      default:
        return ''
    }
  }

  const containerClasses = variant === 'inline' ? '' : getPositionClasses()

  return (
    <div
      className={cn(
        containerClasses,
        'transition-all duration-300 ease-in-out',
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2 pointer-events-none',
        className
      )}
    >
      <div className={getVariantClasses()}>
        {getIcon()}
        <span className="font-medium">{getText()}</span>
        
        {/* Progress indicator for loading state */}
        {currentState === 'loading' && variant === 'toast' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-200 rounded-b-lg overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  )
}

// Optimistic feedback for specific use cases
export function OptimisticRefreshFeedback({ isRefreshing }: { isRefreshing: boolean }) {
  return (
    <OptimisticFeedback
      isLoading={isRefreshing}
      loadingText="Refreshing messages..."
      successText="Messages updated!"
      position="top-right"
      variant="toast"
    />
  )
}

export function OptimisticCacheFeedback({ 
  isCacheHit, 
  isFetching 
}: { 
  isCacheHit: boolean
  isFetching: boolean 
}) {
  return (
    <>
      {isCacheHit && (
        <OptimisticFeedback
          isSuccess={true}
          successText="⚡ Loaded from cache"
          duration={1500}
          position="bottom-right"
          variant="inline"
        />
      )}
      
      {isFetching && (
        <OptimisticFeedback
          isLoading={true}
          loadingText="Fetching latest data..."
          position="bottom-right"
          variant="inline"
        />
      )}
    </>
  )
}

export default OptimisticFeedback