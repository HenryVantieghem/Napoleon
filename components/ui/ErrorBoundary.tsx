'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './button'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback
        return (
          <Fallback
            error={this.state.error!}
            reset={() => this.setState({ hasError: false, error: null })}
          />
        )
      }

      return <DefaultErrorFallback error={this.state.error!} reset={() => this.setState({ hasError: false, error: null })} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        We encountered an unexpected error. This has been logged and our team will investigate.
      </p>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mb-6 text-left">
          <summary className="text-sm text-gray-500 cursor-pointer mb-2">Error Details</summary>
          <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-auto max-w-lg">
            {error.stack}
          </pre>
        </details>
      )}
      
      <Button onClick={reset} variant="outline" className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  )
}

export { ErrorBoundary, DefaultErrorFallback }