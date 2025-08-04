'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClientSupabase } from '@/lib/supabase-client'
import { Mail, Loader2 } from 'lucide-react'

interface GmailOAuthButtonProps {
  className?: string
  children?: React.ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

export default function GmailOAuthButton({ 
  className = '', 
  children, 
  variant = 'primary',
  size = 'lg'
}: GmailOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientSupabase()

  const handleGmailOAuth = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Log the OAuth attempt
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'oauth_attempt',
          data: { provider: 'google', timestamp: new Date().toISOString() }
        })
      }).catch(() => {}) // Non-critical, don't block on failure

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/gmail.readonly',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        
        // Log the error
        fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'oauth_error',
            data: { error: error.message, timestamp: new Date().toISOString() }
          })
        }).catch(() => {})
        
        return
      }

      // OAuth redirect will happen automatically
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      
      // Log the unexpected error
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'oauth_unexpected_error',
          data: { error: errorMessage, timestamp: new Date().toISOString() }
        })
      }).catch(() => {})
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <div className="flex flex-col items-center">
      {variant === 'primary' ? (
        <motion.button
          onClick={handleGmailOAuth}
          disabled={isLoading}
          className={`btn-primary ${sizeClasses[size]} ${className}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={!isLoading ? {
            scale: 1.02,
            transition: { duration: 0.2 }
          } : undefined}
          whileTap={!isLoading ? {
            scale: 0.98,
            transition: { duration: 0.1 }
          } : undefined}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              {children || 'Connect with Gmail'}
            </>
          )}
        </motion.button>
      ) : (
        <motion.button
          onClick={handleGmailOAuth}
          disabled={isLoading}
          className={`btn-secondary ${sizeClasses[size]} ${className}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={!isLoading ? {
            scale: 1.02,
            transition: { duration: 0.2 }
          } : undefined}
          whileTap={!isLoading ? {
            scale: 0.98,
            transition: { duration: 0.1 }
          } : undefined}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              {children || 'Connect Gmail'}
            </>
          )}
        </motion.button>
      )}

      {/* Modern Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 max-w-md modern-card bg-error border-error"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-3 animate-pulse" />
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-400 hover:text-red-300 transition-colors ml-4"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}