import { Badge } from '@/components/ui/badge'
import { AlertTriangle, HelpCircle, Mail } from 'lucide-react'
import type { MessagePriority } from '@/types'

interface PriorityBadgeProps {
  priority: MessagePriority
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function PriorityBadge({ priority, size = 'md', showIcon = true }: PriorityBadgeProps) {
  const getPriorityConfig = (priority: MessagePriority) => {
    switch (priority) {
      case 'urgent':
        return {
          variant: 'urgent' as const,
          label: 'Urgent',
          icon: AlertTriangle,
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
        }
      case 'question':
        return {
          variant: 'question' as const,
          label: 'Question',
          icon: HelpCircle,
          className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
        }
      case 'normal':
      default:
        return {
          variant: 'normal' as const,
          label: 'Normal',
          icon: Mail,
          className: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
        }
    }
  }

  const config = getPriorityConfig(priority)
  const Icon = config.icon

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

  return (
    <Badge 
      variant={config.variant}
      className={`inline-flex items-center gap-1 font-medium ${sizeClasses[size]} ${config.className}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  )
}