'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ErrorInfo {
  id: string
  type: 'oauth' | 'api' | 'network' | 'permission' | 'system'
  service?: 'gmail' | 'slack'
  message: string
  code?: string
  timestamp: number
  retryable: boolean
  autoRetryCount: number
  maxAutoRetries: number
}

interface UseErrorHandlerOptions {
  maxRetries?: number
  enableAutoRetry?: boolean
  enableNotifications?: boolean
  onError?: (error: ErrorInfo) => void
  onRecovery?: (error: ErrorInfo) => void
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    maxRetries = 3,
    enableAutoRetry = true,
    enableNotifications = true,
    onError,
    onRecovery
  } = options

  const router = useRouter()
  const [errors, setErrors] = useState<ErrorInfo[]>([])
  const [isRecovering, setIsRecovering] = useState(false)

  // Parse URL parameters for OAuth errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const error = params.get('error')
      const message = params.get('message')
      const code = params.get('code')
      const service = params.get('service') as 'gmail' | 'slack' | null

      if (error === 'gmail_oauth_error' || error === 'slack_oauth_error') {
        const errorInfo: ErrorInfo = {
          id: `oauth_${Date.now()}`,
          type: 'oauth',
          service: service || (error === 'gmail_oauth_error' ? 'gmail' : 'slack'),
          message: decodeURIComponent(message || 'OAuth connection failed'),
          code: code || 'unknown',
          timestamp: Date.now(),
          retryable: true,
          autoRetryCount: 0,
          maxAutoRetries: maxRetries
        }

        handleError(errorInfo)

        // Clean up URL parameters
        const cleanUrl = window.location.pathname
        window.history.replaceState({}, document.title, cleanUrl)
      }
    }
  }, [maxRetries])

  const handleError = useCallback((error: ErrorInfo) => {
    console.error(`🚨 Error Handler - ${error.type.toUpperCase()}:`, error)

    setErrors(prev => {
      // Remove existing error with same ID if it exists
      const filtered = prev.filter(e => e.id !== error.id)
      return [...filtered, error]
    })

    if (enableNotifications && typeof window !== 'undefined') {
      // Show browser notification for critical errors
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Napoleon AI - ${error.service ? error.service.toUpperCase() : 'System'} Issue`, {
          body: error.message,
          icon: '/favicon.ico'
        })
      }
    }

    onError?.(error)
  }, [enableNotifications, onError])

  const retryError = useCallback(async (errorId: string) => {
    const error = errors.find(e => e.id === errorId)
    if (!error || !error.retryable) return

    setIsRecovering(true)

    try {
      switch (error.type) {
        case 'oauth':
          if (error.service === 'gmail') {
            window.location.href = '/api/oauth/gmail'
          } else if (error.service === 'slack') {
            window.location.href = '/api/oauth/slack'
          }
          break

        case 'api':
        case 'network':
          // Trigger page refresh to retry API calls
          router.refresh()
          break

        default:
          console.warn('Unknown error type for retry:', error.type)
      }

      // Mark error as recovered
      setErrors(prev => prev.filter(e => e.id !== errorId))
      onRecovery?.(error)

    } catch (retryError) {
      console.error('Error during retry:', retryError)
      
      // Update error with retry attempt
      setErrors(prev => prev.map(e => 
        e.id === errorId 
          ? { ...e, autoRetryCount: e.autoRetryCount + 1 }
          : e
      ))
    } finally {
      setIsRecovering(false)
    }
  }, [errors, router, onRecovery])

  const clearError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(e => e.id !== errorId))
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors([])
  }, [])

  // Auto-retry logic for retryable errors
  useEffect(() => {
    if (!enableAutoRetry) return

    const retryableErrors = errors.filter(e => 
      e.retryable && 
      e.autoRetryCount < e.maxAutoRetries &&
      Date.now() - e.timestamp > 2000 // Wait at least 2 seconds
    )

    if (retryableErrors.length === 0) return

    const timeouts = retryableErrors.map(error => {
      const delay = Math.min(
        1000 * Math.pow(2, error.autoRetryCount), // Exponential backoff
        30000 // Max 30 seconds
      )

      return setTimeout(() => {
        console.log(`🔄 Auto-retrying error: ${error.id} (attempt ${error.autoRetryCount + 1})`)
        retryError(error.id)
      }, delay)
    })

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [errors, enableAutoRetry, retryError])

  // Error factory functions
  const createOAuthError = useCallback((service: 'gmail' | 'slack', message: string, code?: string) => {
    const error: ErrorInfo = {
      id: `oauth_${service}_${Date.now()}`,
      type: 'oauth',
      service,
      message,
      code,
      timestamp: Date.now(),
      retryable: true,
      autoRetryCount: 0,
      maxAutoRetries: maxRetries
    }
    handleError(error)
    return error
  }, [handleError, maxRetries])

  const createApiError = useCallback((message: string, code?: string, service?: 'gmail' | 'slack') => {
    const error: ErrorInfo = {
      id: `api_${Date.now()}`,
      type: 'api',
      service,
      message,
      code,
      timestamp: Date.now(),
      retryable: true,
      autoRetryCount: 0,
      maxAutoRetries: maxRetries
    }
    handleError(error)
    return error
  }, [handleError, maxRetries])

  const createNetworkError = useCallback((message: string) => {
    const error: ErrorInfo = {
      id: `network_${Date.now()}`,
      type: 'network',
      message,
      timestamp: Date.now(),
      retryable: true,
      autoRetryCount: 0,
      maxAutoRetries: maxRetries
    }
    handleError(error)
    return error
  }, [handleError, maxRetries])

  const createPermissionError = useCallback((service: 'gmail' | 'slack', message: string) => {
    const error: ErrorInfo = {
      id: `permission_${service}_${Date.now()}`,
      type: 'permission',
      service,
      message,
      timestamp: Date.now(),
      retryable: true,
      autoRetryCount: 0,
      maxAutoRetries: 1 // Permissions usually need manual intervention
    }
    handleError(error)
    return error
  }, [handleError])

  // Error state getters
  const hasErrors = errors.length > 0
  const criticalErrors = errors.filter(e => e.type === 'system' || e.type === 'permission')
  const retryableErrors = errors.filter(e => e.retryable && e.autoRetryCount < e.maxAutoRetries)

  return {
    errors,
    hasErrors,
    criticalErrors,
    retryableErrors,
    isRecovering,
    
    // Actions
    retryError,
    clearError,
    clearAllErrors,
    
    // Error creators
    createOAuthError,
    createApiError,
    createNetworkError,
    createPermissionError
  }
}

// Hook for displaying error notifications
export function useErrorNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && permission === 'default') {
      const newPermission = await Notification.requestPermission()
      setPermission(newPermission)
      return newPermission
    }
    return permission
  }, [permission])

  const canShowNotifications = permission === 'granted'

  return {
    permission,
    canShowNotifications,
    requestPermission
  }
}