'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Executive Typography System
 * Implements luxury typography hierarchy for Fortune 500 executives
 * Research-backed font pairings: Playfair Display + Inter Display
 */

interface TypographyProps {
  children: React.ReactNode
  className?: string
  as?: keyof React.JSX.IntrinsicElements
  variant?: TypographyVariant
  weight?: FontWeight
  animate?: boolean
}

type TypographyVariant = 
  | 'napoleon-title'      // Playfair Display - Brand titles
  | 'executive-hero'      // Inter Display - Hero headings  
  | 'executive-heading'   // Inter Display - Section headings
  | 'executive-subhead'   // Inter Display - Subheadings
  | 'ui-large'           // Inter - Large UI text
  | 'ui-body'            // Inter - Body text
  | 'ui-small'           // Inter - Small text
  | 'ui-caption'         // Inter - Captions/labels

type FontWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'black'

/**
 * Executive Typography Component
 * Implements research-backed typography hierarchy
 */
export function ExecutiveText({ 
  children, 
  className = "", 
  as = "p",
  variant = "ui-body",
  weight,
  animate = false 
}: TypographyProps) {
  const Component = (motion as Record<string, React.ComponentType<React.ComponentProps<any>>>)[as] || motion.p

  const variantStyles = {
    'napoleon-title': 'napoleon-branding text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight',
    'executive-hero': 'executive-heading text-3xl md:text-4xl lg:text-5xl leading-[1.2] tracking-tight',
    'executive-heading': 'executive-heading text-2xl md:text-3xl leading-[1.3] tracking-tight',
    'executive-subhead': 'executive-heading text-xl md:text-2xl leading-[1.4]',
    'ui-large': 'ui-text-semibold text-lg md:text-xl leading-[1.5]',
    'ui-body': 'ui-text text-base leading-[1.6]',
    'ui-small': 'ui-text text-sm leading-[1.5]',
    'ui-caption': 'ui-text text-xs uppercase tracking-wider leading-[1.4]'
  }

  const weightStyles = weight ? {
    'light': 'font-light',
    'regular': 'font-normal',
    'medium': 'font-medium',
    'semibold': 'font-semibold', 
    'bold': 'font-bold',
    'black': 'font-black'
  }[weight] : ''

  const combinedClassName = cn(
    variantStyles[variant],
    weightStyles,
    className
  )

  if (animate) {
    return (
      <Component
        className={combinedClassName}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </Component>
    )
  }

  const StaticComponent = as as React.ElementType
  return React.createElement(StaticComponent, { className: combinedClassName }, children)
}

/**
 * Specialized Typography Components
 * Pre-configured for common executive use cases
 */

export function NapoleonTitle({ children, className = "", animate = true }: Omit<TypographyProps, 'variant' | 'as'>) {
  return (
    <ExecutiveText 
      as="h1" 
      variant="napoleon-title" 
      className={cn("text-imperial-gold", className)}
      animate={animate}
    >
      {children}
    </ExecutiveText>
  )
}

export function ExecutiveHero({ children, className = "", animate = true }: Omit<TypographyProps, 'variant' | 'as'>) {
  return (
    <ExecutiveText 
      as="h1" 
      variant="executive-hero" 
      className={cn("text-executive-white", className)}
      animate={animate}
    >
      {children}
    </ExecutiveText>
  )
}

export function ExecutiveHeading({ children, className = "", animate = false, level = 2 }: Omit<TypographyProps, 'variant' | 'as'> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  return (
    <ExecutiveText 
      as={`h${level}` as keyof React.JSX.IntrinsicElements} 
      variant="executive-heading" 
      className={cn("text-executive-white", className)}
      animate={animate}
    >
      {children}
    </ExecutiveText>
  )
}

export function ExecutiveSubhead({ children, className = "", animate = false }: Omit<TypographyProps, 'variant' | 'as'>) {
  return (
    <ExecutiveText 
      as="h3" 
      variant="executive-subhead" 
      className={cn("text-gray-200", className)}
      animate={animate}
    >
      {children}
    </ExecutiveText>
  )
}

export function UILarge({ children, className = "", animate = false }: Omit<TypographyProps, 'variant' | 'as'>) {
  return (
    <ExecutiveText 
      variant="ui-large" 
      className={cn("text-executive-white", className)}
      animate={animate}
    >
      {children}
    </ExecutiveText>
  )
}

export function UIBody({ children, className = "", animate = false }: Omit<TypographyProps, 'variant' | 'as'>) {
  return (
    <ExecutiveText 
      variant="ui-body" 
      className={cn("text-gray-300", className)}
      animate={animate}
    >
      {children}
    </ExecutiveText>
  )
}

export function UISmall({ children, className = "", animate = false }: Omit<TypographyProps, 'variant' | 'as'>) {
  return (
    <ExecutiveText 
      variant="ui-small" 
      className={cn("text-gray-400", className)}
      animate={animate}
    >
      {children}
    </ExecutiveText>
  )
}

export function UICaption({ children, className = "", animate = false }: Omit<TypographyProps, 'variant' | 'as'>) {
  return (
    <ExecutiveText 
      variant="ui-caption" 
      className={cn("text-gray-500", className)}
      animate={animate}
    >
      {children}
    </ExecutiveText>
  )
}

/**
 * Executive Content Blocks
 * Composite components for common content patterns
 */

export function ExecutiveSection({ 
  title, 
  subtitle, 
  children, 
  className = "",
  titleIcon 
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  titleIcon?: React.ReactNode
}) {
  return (
    <motion.section 
      className={cn("space-y-6", className)}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="space-y-2">
        <ExecutiveHeading className="flex items-center space-x-3">
          {titleIcon && <span className="text-imperial-gold">{titleIcon}</span>}
          <span>{title}</span>
        </ExecutiveHeading>
        {subtitle && (
          <ExecutiveSubhead>{subtitle}</ExecutiveSubhead>
        )}
      </div>
      <div>{children}</div>
    </motion.section>
  )
}

export function ExecutiveCard({ 
  title, 
  description, 
  children, 
  className = "",
  priority = "standard"
}: {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
  priority?: 'gold' | 'silver' | 'bronze' | 'standard'
}) {
  const priorityStyles = {
    gold: 'glass-priority-gold border-l-4 border-l-priority-gold',
    silver: 'glass-priority-silver border-l-4 border-l-priority-silver', 
    bronze: 'glass-priority-bronze border-l-4 border-l-priority-bronze',
    standard: 'liquid-glass'
  }

  return (
    <motion.div 
      className={cn(
        "p-6 rounded-2xl space-y-4 executive-touch",
        priorityStyles[priority],
        className
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-2">
        <ExecutiveHeading level={3} className="text-xl">
          {title}
        </ExecutiveHeading>
        {description && (
          <UIBody className="text-gray-400">{description}</UIBody>
        )}
      </div>
      {children && <div>{children}</div>}
    </motion.div>
  )
}

/**
 * Responsive Typography Utilities
 * Adaptive sizing based on screen size and context
 */

export function ResponsiveText({ 
  children, 
  mobile, 
  tablet, 
  desktop,
  className = "" 
}: {
  children: React.ReactNode
  mobile: TypographyVariant
  tablet?: TypographyVariant
  desktop?: TypographyVariant
  className?: string
}) {
  return (
    <div className={cn(
      // Mobile first
      variantToTailwind(mobile),
      // Tablet
      tablet && `md:${variantToTailwind(tablet).replace(/^text-/, 'text-')}`,
      // Desktop
      desktop && `lg:${variantToTailwind(desktop).replace(/^text-/, 'text-')}`,
      className
    )}>
      {children}
    </div>
  )
}

function variantToTailwind(variant: TypographyVariant): string {
  const mapping = {
    'napoleon-title': 'text-4xl font-bold',
    'executive-hero': 'text-3xl font-semibold',
    'executive-heading': 'text-2xl font-semibold',
    'executive-subhead': 'text-xl font-medium',
    'ui-large': 'text-lg font-medium',
    'ui-body': 'text-base font-normal',
    'ui-small': 'text-sm font-normal',
    'ui-caption': 'text-xs font-medium uppercase'
  }
  return mapping[variant]
}

/**
 * Typography Scale Reference
 * For design system documentation
 */
export const TypographyScale = {
  napoleon: {
    family: 'Playfair Display',
    weight: '700',
    usage: 'Brand titles, luxury messaging'
  },
  executive: {
    family: 'Inter Display', 
    weights: ['400', '500', '600', '700'],
    usage: 'Headings, important UI text'
  },
  ui: {
    family: 'Inter',
    weights: ['400', '500', '600'],
    usage: 'Body text, UI elements, data'
  }
} as const