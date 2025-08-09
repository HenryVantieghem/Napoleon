'use client'

import { motion } from 'framer-motion'
import { forwardRef, type ReactNode } from 'react'

// Luxury animation variants with private jet smoothness
export const luxuryVariants = {
  // Executive-level fade in
  fadeIn: {
    initial: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95 
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  },

  // Glass panel elevation
  glassElevate: {
    initial: { 
      opacity: 0, 
      y: 40, 
      rotateX: -15,
      transformPerspective: 1000
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: [0.68, -0.55, 0.265, 1.55]
      }
    }
  },

  // Luxury card hover
  luxuryHover: {
    initial: { 
      scale: 1, 
      y: 0,
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)'
    },
    hover: { 
      scale: 1.02, 
      y: -8,
      boxShadow: '0 16px 32px rgba(212, 175, 55, 0.2)',
      transition: {
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  },

  // Executive slide in
  slideInLeft: {
    initial: { 
      opacity: 0, 
      x: -60,
      filter: 'blur(8px)'
    },
    animate: { 
      opacity: 1, 
      x: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  },

  slideInRight: {
    initial: { 
      opacity: 0, 
      x: 60,
      filter: 'blur(8px)'
    },
    animate: { 
      opacity: 1, 
      x: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  },

  // Staggered container for email lists
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },

  // Individual stagger item
  staggerItem: {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.9
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  },

  // Gold shimmer effect
  goldShimmer: {
    initial: { 
      backgroundPosition: '-200% 0' 
    },
    animate: { 
      backgroundPosition: '200% 0',
      transition: {
        duration: 2,
        ease: 'linear',
        repeat: Infinity,
        repeatDelay: 1
      }
    }
  },

  // Priority badge animation
  priorityBadge: {
    initial: { 
      scale: 0,
      rotate: -180,
      opacity: 0
    },
    animate: { 
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: 0.2
      }
    }
  }
} as const

interface LuxuryMotionProps {
  children: ReactNode
  variant?: keyof typeof luxuryVariants
  className?: string
  delay?: number
  duration?: number
}

// Main luxury motion component
export const LuxuryMotion = forwardRef<HTMLDivElement, LuxuryMotionProps>(
  ({ children, variant = 'fadeIn', className }, ref) => {
    const variantConfig = luxuryVariants[variant]
    
    // Use variant config directly for now - can enhance later
    const finalVariant = variantConfig

    return (
      <motion.div
        ref={ref}
        className={className}
        variants={finalVariant}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover={variant === 'luxuryHover' ? 'hover' : undefined}
      >
        {children}
      </motion.div>
    )
  }
)

LuxuryMotion.displayName = 'LuxuryMotion'

// Specialized components for common use cases
export const LuxuryCard = forwardRef<HTMLDivElement, LuxuryMotionProps>(
  ({ children, className = '', ...props }, ref) => (
    <LuxuryMotion
      ref={ref}
      variant="luxuryHover"
      className={`glass-card ${className}`}
      {...props}
    >
      {children}
    </LuxuryMotion>
  )
)

LuxuryCard.displayName = 'LuxuryCard'

export const LuxuryButton = motion.button
export const LuxuryDiv = motion.div
export const LuxurySection = motion.section
export const LuxuryHeader = motion.header

// Executive page transitions
export const pageTransition = {
  initial: { 
    opacity: 0, 
    x: 20,
    filter: 'blur(10px)'
  },
  animate: { 
    opacity: 1, 
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    filter: 'blur(10px)',
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

// Loading spinner with luxury aesthetics
export const LuxurySpinner = ({ className = '' }: { className?: string }) => (
  <motion.div
    className={`w-8 h-8 border-2 border-napoleon-gold border-t-transparent rounded-full ${className}`}
    animate={{ rotate: 360 }}
    transition={{
      duration: 1,
      ease: 'linear',
      repeat: Infinity
    }}
  />
)

// Floating particles background
export const FloatingParticles = ({ count = 50 }: { count?: number }) => {
  // Use CSS animations instead of window-dependent JS
  const particles = Array.from({ length: count }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 bg-napoleon-gold rounded-full opacity-20"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1, 0],
        opacity: [0, 0.3, 0],
        x: [0, Math.random() * 100 - 50],
        y: [0, Math.random() * 100 - 50]
      }}
      transition={{
        duration: Math.random() * 8 + 5,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  ))

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {particles}
    </div>
  )
}

// Luxury text shimmer effect
export const ShimmerText = ({ 
  children, 
  className = '' 
}: { 
  children: ReactNode
  className?: string 
}) => (
  <motion.span
    className={`bg-gradient-to-r from-napoleon-gold via-napoleon-gold-light to-napoleon-gold bg-size-200 bg-pos-0 bg-clip-text text-transparent ${className}`}
    variants={luxuryVariants.goldShimmer}
    initial="initial"
    animate="animate"
  >
    {children}
  </motion.span>
)

// Priority tier animation wrapper
export const PriorityAnimation = ({ 
  tier, 
  children,
  className = ''
}: { 
  tier: 'gold' | 'silver' | 'bronze' | 'standard'
  children: ReactNode
  className?: string
}) => {
  const glowColor = {
    gold: 'rgba(212, 175, 55, 0.4)',
    silver: 'rgba(199, 202, 209, 0.3)',
    bronze: 'rgba(205, 127, 50, 0.3)',
    standard: 'rgba(107, 114, 128, 0.2)'
  }[tier]

  return (
    <motion.div
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{
        scale: 1.05,
        boxShadow: `0 8px 32px ${glowColor}`,
        transition: { duration: 0.2 }
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25
      }}
    >
      {children}
    </motion.div>
  )
}