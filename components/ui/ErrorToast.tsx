'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle, RefreshCw, Mail, MessageSquare, Wifi, WifiOff } from 'lucide-react'
import { Button } from './button'

interface ErrorToastProps {
  id: string
  type: 'oauth' | 'api' | 'network' | 'permission' | 'system'
  service?: 'gmail' | 'slack'
  message: string
  code?: string
  retryable: boolean
  isRetrying?: boolean
  onRetry?: () => void
  onDismiss?: () => void
  autoHide?: boolean
  duration?: number
}

export function ErrorToast({
  id,
  type,
  service,
  message,
  code,
  retryable,
  isRetrying = false,
  onRetry,
  onDismiss,
  autoHide = false,
  duration = 8000
}: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState(duration / 1000)

  useEffect(() => {
    if (!autoHide) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleDismiss()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [autoHide, duration])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss?.(), 300) // Allow for fade out animation
  }

  const getIcon = () => {
    switch (type) {
      case 'oauth':
        return service === 'gmail' ? Mail : MessageSquare
      case 'network':
        return WifiOff
      case 'api':
        return AlertTriangle
      default:
        return AlertTriangle
    }
  }

  const getServiceIcon = () => {
    if (!service) return null
    return service === 'gmail' ? Mail : MessageSquare
  }

  const getBgColor = () => {
    switch (type) {
      case 'oauth':
        return 'from-blue-50 to-blue-100 border-blue-300'
      case 'network':
        return 'from-red-50 to-red-100 border-red-300'
      case 'permission':
        return 'from-yellow-50 to-yellow-100 border-yellow-300'
      case 'system':
        return 'from-red-50 to-red-100 border-red-300'
      default:
        return 'from-amber-50 to-orange-100 border-amber-300'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'oauth':
        return 'text-blue-900'
      case 'network':
        return 'text-red-900'
      case 'permission':
        return 'text-yellow-900'
      case 'system':
        return 'text-red-900'
      default:
        return 'text-amber-900'
    }
  }

  if (!isVisible) return null

  const Icon = getIcon()
  const ServiceIcon = getServiceIcon()

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        bg-gradient-to-r ${getBgColor()}
        border-2 rounded-xl shadow-lg
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
      `}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 ${getTextColor()} flex items-center justify-center`}>
              <Icon className="w-4 h-4" />
            </div>
            <h4 className={`font-semibold text-sm ${getTextColor()}`}>
              {service ? `${service.charAt(0).toUpperCase() + service.slice(1)} ` : ''}
              {type === 'oauth' ? 'Connection' : 
               type === 'network' ? 'Network' : 
               type === 'permission' ? 'Permission' : 
               'System'} Issue
            </h4>
          </div>
          
          <button
            onClick={handleDismiss}
            className={`${getTextColor()} hover:opacity-70 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <p className={`text-sm ${getTextColor()} mb-3 leading-relaxed`}>
          {message}
        </p>

        {/* Code */}
        {code && (
          <p className={`text-xs font-mono ${getTextColor()} opacity-70 mb-3`}>
            Code: {code}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Service Icon */}
            {ServiceIcon && (
              <div className="flex items-center gap-1 text-xs opacity-70">
                <ServiceIcon className="w-3 h-3" />
              </div>
            )}
            
            {/* Auto-hide timer */}
            {autoHide && timeLeft > 0 && (
              <span className={`text-xs ${getTextColor()} opacity-50`}>
                {timeLeft}s
              </span>
            )}
          </div>

          {/* Retry Button */}
          {retryable && onRetry && (
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              size="sm"
              className={`
                text-xs px-3 py-1 h-7
                ${type === 'oauth' ? 'bg-blue-600 hover:bg-blue-700' :
                  type === 'network' ? 'bg-red-600 hover:bg-red-700' :
                  type === 'permission' ? 'bg-yellow-600 hover:bg-yellow-700' :
                  'bg-amber-600 hover:bg-amber-700'}
                text-white
              `}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar for auto-hide */}
      {autoHide && (
        <div className="h-1 bg-black/10 overflow-hidden rounded-b-xl">
          <div
            className="h-full bg-current opacity-30 transition-all duration-1000 ease-linear"
            style={{
              width: `${(timeLeft / (duration / 1000)) * 100}%`,
              transition: timeLeft <= 0 ? 'none' : undefined
            }}
          />
        </div>
      )}
    </div>
  )
}

// Container for managing multiple error toasts
interface ErrorToastContainerProps {
  errors: Array<{
    id: string
    type: 'oauth' | 'api' | 'network' | 'permission' | 'system'
    service?: 'gmail' | 'slack'
    message: string
    code?: string
    retryable: boolean
  }>
  isRetrying?: Record<string, boolean>
  onRetry?: (errorId: string) => void
  onDismiss?: (errorId: string) => void
}

export function ErrorToastContainer({
  errors,
  isRetrying = {},
  onRetry,
  onDismiss
}: ErrorToastContainerProps) {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2 pointer-events-none">
      {errors.slice(0, 3).map((error, index) => ( // Show max 3 toasts
        <div
          key={error.id}
          className="pointer-events-auto"
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          <ErrorToast
            {...error}
            isRetrying={isRetrying[error.id]}
            onRetry={onRetry ? () => onRetry(error.id) : undefined}
            onDismiss={onDismiss ? () => onDismiss(error.id) : undefined}
            autoHide={!error.retryable} // Auto-hide non-retryable errors
          />
        </div>
      ))}
      
      {/* Overflow indicator */}
      {errors.length > 3 && (
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg pointer-events-auto">
          +{errors.length - 3} more errors
        </div>
      )}
    </div>
  )
}