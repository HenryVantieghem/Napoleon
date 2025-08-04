'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { SignInButton, SignUpButton, useUser, UserButton } from '@clerk/nextjs'
import { Mail, Loader2, Crown } from 'lucide-react'

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
  const { isSignedIn, user, isLoaded } = useUser()

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

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
      onClick={() => setIsLoading(true)}
      disabled={isLoading}
      className={`${variant === 'primary' ? 'btn-primary' : 'btn-secondary'} ${sizeClasses[size]} ${className}`}
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
          <Crown className="w-5 h-5" />
          {buttonChildren}
        </>
      )}
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