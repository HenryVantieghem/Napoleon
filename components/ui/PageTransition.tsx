'use client'

import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <div 
      className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}
      style={{ animationFillMode: 'backwards' }}
    >
      {children}
    </div>
  )
}

export function StaggeredTransition({ 
  children, 
  delay = 0,
  className = '' 
}: { 
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <div 
      className={`animate-in fade-in slide-in-from-bottom-2 duration-300 ${className}`}
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: 'backwards'
      }}
    >
      {children}
    </div>
  )
}