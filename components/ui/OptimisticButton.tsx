'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OptimisticButtonProps {
  children: React.ReactNode
  onClick: () => Promise<void>
  loadingText?: string
  successText?: string
  errorText?: string
  showFeedback?: boolean
  feedbackDuration?: number
  disabled?: boolean
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

type ButtonState = 'idle' | 'loading' | 'success' | 'error'

export function OptimisticButton({
  children,
  onClick,
  loadingText = 'Loading...',
  successText = 'Success!',
  errorText = 'Error',
  showFeedback = true,
  feedbackDuration = 2000,
  disabled = false,
  variant = 'default',
  size = 'default',
  className
}: OptimisticButtonProps) {
  const [state, setState] = useState<ButtonState>('idle')

  const handleClick = useCallback(async () => {
    if (state === 'loading' || disabled) return

    // Immediately show loading state (optimistic)
    setState('loading')

    try {
      await onClick()
      
      // Show success feedback
      if (showFeedback) {
        setState('success')
        setTimeout(() => setState('idle'), feedbackDuration)
      } else {
        setState('idle')
      }
    } catch (error) {
      console.error('OptimisticButton error:', error)
      
      // Show error feedback
      if (showFeedback) {
        setState('error')
        setTimeout(() => setState('idle'), feedbackDuration)
      } else {
        setState('idle')
      }
    }
  }, [onClick, state, disabled, showFeedback, feedbackDuration])

  const getButtonContent = () => {
    switch (state) {
      case 'loading':
        return (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            {loadingText}
          </>
        )
      case 'success':
        return (
          <>
            <Check className="w-4 h-4 mr-2 text-green-600" />
            {successText}
          </>
        )
      case 'error':
        return (
          <>
            <X className="w-4 h-4 mr-2 text-red-600" />
            {errorText}
          </>
        )
      default:
        return children
    }
  }

  const getButtonVariant = () => {
    switch (state) {
      case 'success':
        return 'outline'
      case 'error':
        return 'outline'
      default:
        return variant
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || state === 'loading'}
      variant={getButtonVariant()}
      size={size}
      className={cn(
        'transition-all duration-200',
        state === 'success' && 'border-green-500 text-green-700 bg-green-50 hover:bg-green-100',
        state === 'error' && 'border-red-500 text-red-700 bg-red-50 hover:bg-red-100',
        state === 'loading' && 'cursor-not-allowed opacity-75',
        className
      )}
    >
      {getButtonContent()}
    </Button>
  )
}

export default OptimisticButton