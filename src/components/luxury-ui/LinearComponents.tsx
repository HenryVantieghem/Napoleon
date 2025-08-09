'use client'

import React, { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2, Check, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Linear Professional Component System
 * Modular, scalable components with executive precision
 * Based on Linear's design system principles
 */

// ===== CORE COMPONENT TYPES =====
type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type ComponentVariant = 'default' | 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive'
type ComponentState = 'default' | 'loading' | 'success' | 'error' | 'warning' | 'info'

// ===== LINEAR BUTTON SYSTEM =====
interface LinearButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  variant?: ComponentVariant
  size?: ComponentSize
  state?: ComponentState
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
}

export const LinearButton = forwardRef<HTMLButtonElement, LinearButtonProps>(
  ({ 
    variant = 'default',
    size = 'md',
    state = 'default',
    fullWidth = false,
    leftIcon,
    rightIcon,
    loading = false,
    loadingText,
    children,
    className,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading

    const sizeStyles = {
      xs: 'px-2 py-1 text-xs h-6',
      sm: 'px-3 py-1.5 text-sm h-8',
      md: 'px-4 py-2 text-sm h-10',
      lg: 'px-6 py-3 text-base h-12',
      xl: 'px-8 py-4 text-lg h-14'
    }

    const variantStyles = {
      default: 'linear-button-secondary',
      primary: 'linear-button-primary',
      secondary: 'linear-button-secondary',
      ghost: 'bg-transparent border-transparent text-text-secondary hover:bg-interactive-hover hover:text-text-primary',
      outline: 'bg-transparent border-border-primary text-text-primary hover:bg-interactive-hover',
      destructive: 'bg-lch-danger-500 border-lch-danger-400 text-lch-neutral-50 hover:bg-lch-danger-600'
    }

    const stateStyles = {
      default: '',
      loading: 'cursor-wait',
      success: 'border-lch-success-500 bg-lch-success-500/10',
      error: 'border-lch-danger-500 bg-lch-danger-500/10',
      warning: 'border-lch-warning-500 bg-lch-warning-500/10',
      info: 'border-lch-primary-500 bg-lch-primary-500/10'
    }

    const stateIcons = {
      default: null,
      loading: <Loader2 className="w-4 h-4 animate-spin" />,
      success: <Check className="w-4 h-4" />,
      error: <AlertCircle className="w-4 h-4" />,
      warning: <AlertCircle className="w-4 h-4" />,
      info: <Info className="w-4 h-4" />
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          // Base styles
          'linear-touch-target inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lch-primary-500 focus:ring-offset-2 focus:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed',
          // Size styles
          sizeStyles[size],
          // Variant styles
          variantStyles[variant],
          // State styles
          stateStyles[state],
          // Full width
          fullWidth && 'w-full',
          className
        )}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        {...props}
      >
        {/* Left icon or state icon */}
        {(leftIcon || stateIcons[state]) && (
          <span className="mr-2 flex-shrink-0">
            {stateIcons[state] || leftIcon}
          </span>
        )}
        
        {/* Button content */}
        <span className="flex-1">
          {loading && loadingText ? loadingText : children}
        </span>
        
        {/* Right icon */}
        {rightIcon && !stateIcons[state] && (
          <span className="ml-2 flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </motion.button>
    )
  }
)

LinearButton.displayName = 'LinearButton'

// ===== LINEAR INPUT SYSTEM =====
interface LinearInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  state?: ComponentState
}

export const LinearInput = forwardRef<HTMLInputElement, LinearInputProps>(
  ({
    label,
    helperText,
    error,
    success,
    leftIcon,
    rightIcon,
    state = 'default',
    className,
    ...props
  }, ref) => {
    const inputState = error ? 'error' : success ? 'success' : state

    const stateStyles = {
      default: 'linear-input',
      loading: 'linear-input animate-pulse',
      success: 'linear-input border-lch-success-500 focus:border-lch-success-500',
      error: 'linear-input border-lch-danger-500 focus:border-lch-danger-500',
      warning: 'linear-input border-lch-warning-500 focus:border-lch-warning-500',
      info: 'linear-input border-lch-primary-500 focus:border-lch-primary-500'
    }

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              stateStyles[inputState],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(helperText || error || success) && (
          <div className="flex items-center space-x-1 text-sm">
            {error && (
              <>
                <AlertCircle className="w-4 h-4 text-lch-danger-500" />
                <span className="text-lch-danger-500">{error}</span>
              </>
            )}
            {success && !error && (
              <>
                <Check className="w-4 h-4 text-lch-success-500" />
                <span className="text-lch-success-500">{success}</span>
              </>
            )}
            {helperText && !error && !success && (
              <span className="text-text-tertiary">{helperText}</span>
            )}
          </div>
        )}
      </div>
    )
  }
)

LinearInput.displayName = 'LinearInput'

// ===== LINEAR CARD SYSTEM =====
interface LinearCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost'
  padding?: ComponentSize
  children: React.ReactNode
}

export const LinearCard = forwardRef<HTMLDivElement, LinearCardProps>(
  ({ variant = 'default', padding = 'md', children, className, ...props }, ref) => {
    const paddingStyles = {
      xs: 'p-2',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    }

    const variantStyles = {
      default: 'linear-card',
      elevated: 'linear-card shadow-2xl',
      outlined: 'bg-transparent border border-border-primary rounded-12',
      ghost: 'bg-transparent'
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          variantStyles[variant],
          paddingStyles[padding],
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

LinearCard.displayName = 'LinearCard'

// ===== LINEAR BADGE SYSTEM =====
interface LinearBadgeProps {
  variant?: ComponentVariant
  size?: Exclude<ComponentSize, 'xl'>
  children: React.ReactNode
  className?: string
}

export function LinearBadge({ 
  variant = 'default', 
  size = 'sm', 
  children, 
  className 
}: LinearBadgeProps) {
  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm'
  }

  const variantStyles = {
    default: 'bg-lch-neutral-700 text-text-secondary',
    primary: 'bg-lch-primary-500/20 text-lch-primary-300 border border-lch-primary-500/30',
    secondary: 'bg-lch-neutral-600 text-text-primary',
    ghost: 'bg-transparent text-text-tertiary',
    outline: 'bg-transparent border border-border-primary text-text-secondary',
    destructive: 'bg-lch-danger-500/20 text-lch-danger-300 border border-lch-danger-500/30'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full transition-colors',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// ===== LINEAR MODAL SYSTEM =====
interface LinearModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
}

export function LinearModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}: LinearModalProps) {
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <motion.div
        className={cn(
          'relative w-full linear-card max-h-[90vh] overflow-hidden',
          sizeStyles[size]
        )}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-border-primary">
            {title && (
              <h2 className="executive-heading text-xl">{title}</h2>
            )}
            {showCloseButton && (
              <LinearButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-auto"
              >
                <X className="w-4 h-4" />
              </LinearButton>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ===== LINEAR NAVIGATION SYSTEM =====
interface LinearNavItem {
  id: string
  label: string
  icon?: React.ReactNode
  href?: string
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  count?: number
}

interface LinearNavigationProps {
  items: LinearNavItem[]
  orientation?: 'vertical' | 'horizontal'
  className?: string
}

export function LinearNavigation({ 
  items = [], 
  orientation = 'vertical', 
  className 
}: LinearNavigationProps) {
  const containerStyles = {
    vertical: 'linear-nav flex flex-col space-y-1',
    horizontal: 'flex space-x-1 p-4 border-b border-border-primary'
  }

  return (
    <nav className={cn(containerStyles[orientation], className)}>
      {items.map((item) => (
        <motion.a
          key={item.id}
          href={item.href}
          onClick={item.onClick}
          className={cn(
            'linear-nav-item',
            item.active && 'active',
            item.disabled && 'opacity-50 cursor-not-allowed',
            orientation === 'horizontal' && 'border-l-0 border-b-3 border-b-transparent hover:border-b-lch-primary-500'
          )}
          whileHover={!item.disabled ? { x: orientation === 'vertical' ? 4 : 0, y: orientation === 'horizontal' ? -2 : 0 } : undefined}
          transition={{ duration: 0.2 }}
        >
          {item.icon && (
            <span className="linear-nav-item-icon">
              {item.icon}
            </span>
          )}
          
          <span className="flex-1">{item.label}</span>
          
          {item.count !== undefined && (
            <LinearBadge variant="primary" size="xs">
              {item.count}
            </LinearBadge>
          )}
        </motion.a>
      ))}
    </nav>
  )
}

// ===== LINEAR TOAST SYSTEM =====
interface LinearToastProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
  autoClose?: boolean
  duration?: number
}

export function LinearToast({
  type,
  title,
  description,
  action,
  onClose,
  autoClose = true,
  duration = 5000
}: LinearToastProps) {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onClose])

  const typeStyles = {
    success: 'border-lch-success-500 bg-lch-success-500/10',
    error: 'border-lch-danger-500 bg-lch-danger-500/10',
    warning: 'border-lch-warning-500 bg-lch-warning-500/10',
    info: 'border-lch-primary-500 bg-lch-primary-500/10'
  }

  const typeIcons = {
    success: <Check className="w-5 h-5 text-lch-success-500" />,
    error: <AlertCircle className="w-5 h-5 text-lch-danger-500" />,
    warning: <AlertCircle className="w-5 h-5 text-lch-warning-500" />,
    info: <Info className="w-5 h-5 text-lch-primary-500" />
  }

  return (
    <motion.div
      className={cn(
        'linear-card p-4 border-l-4 max-w-md',
        typeStyles[type]
      )}
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {typeIcons[type]}
        </div>
        
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-text-primary">
            {title}
          </h4>
          
          {description && (
            <p className="mt-1 text-sm text-text-secondary">
              {description}
            </p>
          )}
          
          {action && (
            <div className="mt-3">
              <LinearButton
                variant="ghost"
                size="sm"
                onClick={action.onClick}
              >
                {action.label}
              </LinearButton>
            </div>
          )}
        </div>
        
        {onClose && (
          <div className="ml-3 flex-shrink-0">
            <LinearButton
              variant="ghost"
              size="xs"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </LinearButton>
          </div>
        )}
      </div>
    </motion.div>
  )
}