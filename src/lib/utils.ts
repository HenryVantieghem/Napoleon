import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Luxury animation timing functions
export const luxuryEasing = {
  spring: [0.68, -0.55, 0.265, 1.55],
  smooth: [0.4, 0, 0.2, 1],
  gentle: [0.25, 0.46, 0.45, 0.94],
  dramatic: [0.68, -0.55, 0.265, 1.55]
} as const

// Executive timing constants
export const timing = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  luxury: 800
} as const

// Priority tier colors and styling
export const priorityStyles = {
  gold: {
    color: '#D4AF37',
    background: 'rgba(212, 175, 55, 0.1)',
    border: 'rgba(212, 175, 55, 0.3)',
    glow: 'rgba(212, 175, 55, 0.4)',
    icon: '👑',
    name: 'Gold Priority'
  },
  silver: {
    color: '#C7CAD1',
    background: 'rgba(199, 202, 209, 0.1)',
    border: 'rgba(199, 202, 209, 0.3)',
    glow: 'rgba(199, 202, 209, 0.3)',
    icon: '⭐',
    name: 'Silver Priority'
  },
  bronze: {
    color: '#CD7F32',
    background: 'rgba(205, 127, 50, 0.1)',
    border: 'rgba(205, 127, 50, 0.3)',
    glow: 'rgba(205, 127, 50, 0.3)',
    icon: '📋',
    name: 'Bronze Priority'
  },
  standard: {
    color: '#6B7280',
    background: 'rgba(107, 114, 128, 0.05)',
    border: 'rgba(107, 114, 128, 0.2)',
    glow: 'rgba(107, 114, 128, 0.2)',
    icon: '📄',
    name: 'Standard Priority'
  }
} as const

// Format date for executive display
export function formatExecutiveDate(date: Date): string {
  const now = new Date()
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60)
    return `${minutes}m ago`
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours)
    return `${hours}h ago`
  } else if (diffInHours < 48) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }
}

// Truncate text elegantly
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  
  // Find the last complete word within the limit
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}

// Extract initials from name or email
export function getInitials(name: string): string {
  if (!name) return 'U'
  
  // If it's an email, use the part before @
  if (name.includes('@')) {
    name = name.split('@')[0]
  }
  
  // Split by common separators and take first letters
  const parts = name.split(/[\s\-_.]+/)
  
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  
  return parts[0].substring(0, 2).toUpperCase()
}

// Generate executive avatar colors
export function getAvatarColor(name: string): string {
  const colors = [
    'from-napoleon-gold to-napoleon-gold-light',
    'from-napoleon-platinum to-napoleon-platinum-light',
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-green-400 to-green-600',
    'from-red-400 to-red-600',
    'from-indigo-400 to-indigo-600',
    'from-pink-400 to-pink-600'
  ]
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

// Debounce function for search and performance
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Check if user is C-level executive
export function isCLevelParticipant(email: string): boolean {
  const cLevelKeywords = [
    'ceo', 'cto', 'cfo', 'coo', 'cmo', 'chief', 
    'president', 'vp', 'board', 'director', 'executive'
  ]
  
  const emailLower = email.toLowerCase()
  return cLevelKeywords.some(keyword => emailLower.includes(keyword))
}

// Generate glass morphism CSS properties
export function getGlassMorphismStyles(opacity: number = 0.08, blur: number = 24) {
  return {
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `1px solid rgba(255, 255, 255, ${opacity * 1.5})`
  }
}