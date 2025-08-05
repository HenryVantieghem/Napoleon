'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SignInButton, SignUpButton, useUser, UserButton } from '@clerk/nextjs'
import { Mail, Loader2, Crown, CheckCircle, AlertCircle } from 'lucide-react'

interface ClerkAuthButtonProps {
  className?: string
  children?: React.ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  mode?: 'signin' | 'signup'
}

export default function ClerkAuthButton({ 
  className = '', 
  children, 
  variant = 'primary',
  size = 'lg',
  mode = 'signin'
}: ClerkAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [authState, setAuthState] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle')
  const { isSignedIn, user, isLoaded } = useUser()

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  // Enhanced loading states
  useEffect(() => {
    if (isSignedIn && authState === 'connecting') {
      setAuthState('success')
      setIsLoading(false)
    }
  }, [isSignedIn, authState])

  // If user is already signed in, show user button
  if (isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-luxury-gold">
          <span className="text-sm text-white/70">Executive:</span>
          <span className="ml-2 font-medium">{user.firstName || user.emailAddresses[0].emailAddress}</span>
        </div>
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "h-10 w-10",
              userButtonPopoverCard: "bg-black border border-white/10 shadow-2xl",
              userButtonPopoverActionButton: "text-white hover:bg-white/5"
            }
          }}
        />
      </div>
    )
  }

  // Show loading state while Clerk loads
  if (!isLoaded) {
    return (
      <div className={`btn-primary ${sizeClasses[size]} ${className} opacity-50`}>
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading...
      </div>
    )
  }

  const ButtonContent = ({ children: buttonChildren }: { children: React.ReactNode }) => (
    <motion.button
      onClick={() => {
        setIsLoading(true)
        setAuthState('connecting')
      }}
      disabled={isLoading || authState === 'connecting'}
      className={`
        ${variant === 'primary' ? 'btn-luxury-primary' : 'btn-luxury-secondary'} 
        ${sizeClasses[size]} 
        ${className}
        ${authState === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
        ${authState === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-300 ease-luxury
      `}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={!isLoading && authState === 'idle' ? {
        scale: 1.02,
        transition: { duration: 0.2 }
      } : undefined}
      whileTap={!isLoading && authState === 'idle' ? {
        scale: 0.98,
        transition: { duration: 0.1 }
      } : undefined}
    >
      <AnimatePresence mode="wait">
        {authState === 'connecting' || isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            Connecting to Gmail...
          </motion.div>
        ) : authState === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Connected Successfully
          </motion.div>
        ) : authState === 'error' ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            Connection Failed
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Crown className="w-5 h-5" />
            {buttonChildren}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )

  if (mode === 'signup') {
    return (
      <SignUpButton 
        mode="modal"
        appearance={{
          elements: {
            modalContent: "bg-black border border-white/10",
            headerTitle: "text-white",
            headerSubtitle: "text-white/70",
            socialButtonsBlockButton: "border-white/10 text-white hover:bg-white/5",
            formFieldInput: "bg-white/5 border-white/10 text-white",
            formButtonPrimary: "bg-luxury-indigo hover:bg-luxury-indigo/80",
            footerActionLink: "text-luxury-gold hover:text-luxury-gold/80"
          }
        }}
      >
        <ButtonContent>
          {children || 'Join Executive Access'}
        </ButtonContent>
      </SignUpButton>
    )
  }

  return (
    <SignInButton 
      mode="modal"
      appearance={{
        elements: {
          modalContent: "bg-black border border-white/10 shadow-2xl",
          headerTitle: "text-white font-space text-2xl",
          headerSubtitle: "text-white/70",
          socialButtonsBlockButton: "border-white/10 text-white hover:bg-white/5 transition-all",
          socialButtonsBlockButtonText: "text-white font-medium",
          formFieldInput: "bg-white/5 border-white/10 text-white placeholder:text-white/50",
          formButtonPrimary: "bg-luxury-indigo hover:bg-luxury-indigo/80 transition-all",
          footerActionLink: "text-luxury-gold hover:text-luxury-gold/80 transition-colors",
          card: "bg-black",
          formFieldLabel: "text-white/90"
        }
      }}
    >
      <ButtonContent>
        <Mail className="w-5 h-5" />
        {children || 'Executive Login'}
      </ButtonContent>
    </SignInButton>
  )
}