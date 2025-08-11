import { memo, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Zap, HelpCircle, Mail } from 'lucide-react'
import type { MessagePriority } from '@/types'

interface PriorityBadgeProps {
  priority: MessagePriority
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  animated?: boolean
}

export const PriorityBadge = memo<PriorityBadgeProps>(function PriorityBadge({ priority, size = 'md', showIcon = true, animated = true }) {
  // Memoize priority configuration
  const config = useMemo(() => {
    switch (priority) {
      case 'urgent':
        return {
          variant: 'urgent' as const,
          label: 'Urgent',
          icon: Zap,
          className: `bg-red-100 text-red-800 border-red-200 hover:bg-red-200 transition-all duration-200 ${animated ? 'shadow-red-100 shadow-lg hover:shadow-red-200' : ''}`,
          tooltip: '🚨 Requires immediate attention'
        }
      case 'question':
        return {
          variant: 'question' as const,
          label: 'Question',
          icon: HelpCircle,
          className: `bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 transition-all duration-200 ${animated ? 'shadow-blue-100 shadow-lg hover:shadow-blue-200' : ''}`,
          tooltip: '❓ Awaiting your response'
        }
      case 'normal':
      default:
        return {
          variant: 'normal' as const,
          label: 'Normal',
          icon: Mail,
          className: `bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 transition-all duration-200 ${animated ? 'hover:shadow-gray-200' : ''}`,
          tooltip: '📧 Standard message'
        }
    }
  }, [priority, animated])

  // Memoize size and icon classes
  const { sizeClass, iconClass } = useMemo(() => {
    const sizeClasses = {
      sm: 'text-xs px-1.5 py-0.5',
      md: 'text-xs px-2 py-1',
      lg: 'text-sm px-2.5 py-1.5'
    }

    const iconSizes = {
      sm: 'w-3 h-3',
      md: 'w-3 h-3',
      lg: 'w-4 h-4'
    }

    return {
      sizeClass: sizeClasses[size],
      iconClass: `${iconSizes[size]} ${priority === 'urgent' && animated ? 'animate-pulse' : ''}`
    }
  }, [size, priority, animated])

  const Icon = config.icon

  return (
    <div className="relative group/badge">
      <Badge 
        variant={config.variant}
        className={`inline-flex items-center gap-1 font-medium border ${sizeClass} ${config.className} cursor-default`}
        title={`${config.label} priority message`}
      >
        {showIcon && (
          <Icon className={iconClass} />
        )}
        {config.label}
      </Badge>
      
      {/* Enhanced tooltip */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/badge:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {config.tooltip}
      </div>
    </div>
  )
})