'use client'

import { motion } from 'framer-motion'
import { forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'tertiary'
  hover?: boolean
  glow?: boolean
  borderGradient?: boolean
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    children, 
    className = '', 
    variant = 'primary', 
    hover = true, 
    glow = false,
    borderGradient = false 
  }, ref) => {
    
    const variants = {
      primary: {
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      },
      secondary: {
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      },
      tertiary: {
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
      }
    }

    const cardStyle = variants[variant]

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative rounded-xl overflow-hidden',
          'before:absolute before:inset-0 before:rounded-xl before:p-[1px]',
          borderGradient && 'before:bg-gradient-to-r before:from-napoleon-gold/20 before:via-transparent before:to-napoleon-gold/20',
          glow && 'shadow-2xl',
          className
        )}
        style={{
          background: cardStyle.background,
          backdropFilter: cardStyle.backdropFilter,
          WebkitBackdropFilter: cardStyle.backdropFilter,
          border: borderGradient ? 'none' : cardStyle.border,
        }}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
          }
        }}
        whileHover={hover ? {
          y: -4,
          scale: 1.02,
          boxShadow: glow 
            ? '0 20px 40px rgba(212, 175, 55, 0.2), 0 8px 16px rgba(0, 0, 0, 0.1)'
            : '0 12px 24px rgba(0, 0, 0, 0.15)',
          transition: {
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1]
          }
        } : undefined}
        whileTap={hover ? {
          scale: 0.98,
          transition: {
            duration: 0.1,
            ease: [0.4, 0, 0.2, 1]
          }
        } : undefined}
      >
        {/* Border gradient overlay */}
        {borderGradient && (
          <div 
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-napoleon-gold/20 via-transparent to-napoleon-gold/20 p-[1px]"
          >
            <div 
              className="h-full w-full rounded-xl"
              style={{
                background: cardStyle.background,
                backdropFilter: cardStyle.backdropFilter,
                WebkitBackdropFilter: cardStyle.backdropFilter,
              }}
            />
          </div>
        )}

        {/* Luxury top highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-napoleon-gold/30 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Subtle glow effect */}
        {glow && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-napoleon-gold/5 via-transparent to-transparent pointer-events-none" />
        )}
      </motion.div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

// Specialized glass panels
export const GlassPanel = forwardRef<HTMLDivElement, Omit<GlassCardProps, 'variant'>>(
  ({ children, className = '', ...props }, ref) => (
    <GlassCard
      ref={ref}
      variant="secondary"
      className={cn('p-6', className)}
      {...props}
    >
      {children}
    </GlassCard>
  )
)

GlassPanel.displayName = 'GlassPanel'

export const GlassButton = forwardRef<HTMLButtonElement, {
  children: ReactNode
  className?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}>(
  ({ 
    children, 
    className = '', 
    onClick, 
    variant = 'primary', 
    size = 'md',
    disabled = false 
  }, ref) => {
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg'
    }

    const variantStyles = {
      primary: {
        background: 'linear-gradient(135deg, #D4AF37 0%, #E6C659 50%, #D4AF37 100%)',
        color: '#0B0D11',
        border: 'none'
      },
      secondary: {
        background: 'rgba(255, 255, 255, 0.08)',
        color: '#F6F6F4',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      },
      ghost: {
        background: 'transparent',
        color: '#D4AF37',
        border: '1px solid rgba(212, 175, 55, 0.3)'
      }
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative rounded-lg font-medium transition-all duration-200',
          'backdrop-blur-md overflow-hidden',
          'focus:outline-none focus:ring-2 focus:ring-napoleon-gold focus:ring-opacity-50',
          sizeClasses[size],
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        style={variantStyles[variant]}
        onClick={disabled ? undefined : onClick}
        whileHover={!disabled ? {
          scale: 1.05,
          transition: { duration: 0.15 }
        } : undefined}
        whileTap={!disabled ? {
          scale: 0.95,
          transition: { duration: 0.1 }
        } : undefined}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }
        }}
      >
        {/* Shimmer effect for primary buttons */}
        {variant === 'primary' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'linear'
            }}
          />
        )}
        
        <span className="relative z-10">{children}</span>
      </motion.button>
    )
  }
)

GlassButton.displayName = 'GlassButton'

// Luxury header component with glass morphism
export const GlassHeader = ({ 
  title, 
  subtitle, 
  className = '' 
}: { 
  title: string
  subtitle?: string
  className?: string 
}) => (
  <GlassPanel className={cn('text-center', className)} borderGradient>
    <motion.h1 
      className="text-4xl font-bold bg-gradient-to-r from-napoleon-gold to-napoleon-gold-light bg-clip-text text-transparent mb-2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {title}
    </motion.h1>
    {subtitle && (
      <motion.p 
        className="text-napoleon-platinum text-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        {subtitle}
      </motion.p>
    )}
  </GlassPanel>
)