'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    // Log error details for debugging (without sensitive data)
    console.group('🚨 Executive Dashboard Error')
    console.error('Error:', error)
    console.error('Component Stack:', errorInfo.componentStack)
    console.error('Error ID:', this.state.errorId)
    console.groupEnd()

    // In production, you might want to send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, {
      //   extra: errorInfo,
      //   tags: { component: 'ErrorBoundary', errorId: this.state.errorId }
      // })
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props
    const { hasError } = this.state

    // Auto-reset on props change if enabled
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetError()
    }

    // Reset on specific keys change
    if (hasError && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || []
      const hasResetKeyChanged = resetKeys.some((key, index) => key !== prevResetKeys[index])
      
      if (hasResetKeyChanged) {
        this.resetError()
      }
    }
  }

  resetError = () => {
    // Clear any pending timeout
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId)
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    })
  }

  // Automatic retry after delay
  scheduleRetry = (delay: number = 3000) => {
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetError()
    }, delay)
  }

  render() {
    const { hasError, error, errorId } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Default executive-grade error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-100/20 to-orange-100/20 opacity-50"></div>
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>

              {/* Error message */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Executive Dashboard Temporarily Unavailable
              </h1>
              
              <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                We've encountered an unexpected issue with your communication dashboard. 
                Our team has been automatically notified and is working to resolve this immediately.
              </p>

              {/* Error details for debugging */}
              <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Error ID:</strong> {errorId}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Time:</strong> {new Date().toLocaleString()}
                </div>
                {error && (
                  <div className="text-sm text-gray-600">
                    <strong>Issue:</strong> {error.message}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={this.resetError}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  variant="outline"
                  className="px-8 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-all duration-200"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Return to Dashboard
                </Button>
              </div>

              {/* Auto-retry notification */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Your dashboard will automatically retry in a few seconds, or you can try again now.
                </p>
              </div>

              {/* Support information */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  For immediate assistance, reference Error ID <code className="bg-gray-100 px-1 rounded">{errorId}</code> when contacting support.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return children
  }
}

// Wrapper component for easier usage
interface ErrorBoundaryWrapperProps {
  children: ReactNode
  name?: string
  level?: 'page' | 'section' | 'component'
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export function ErrorBoundaryWrapper({ 
  children, 
  name = 'Component',
  level = 'component',
  onError
}: ErrorBoundaryWrapperProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Enhanced logging with context
    console.group(`🚨 ${name} Error (${level} level)`)
    console.error('Error:', error)
    console.error('Component Stack:', errorInfo.componentStack)
    console.groupEnd()

    onError?.(error, errorInfo)
  }

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  )
}