import { formatDistanceToNow } from 'date-fns'
import { Mail, MessageSquare, ExternalLink } from 'lucide-react'
import { PriorityBadge } from './PriorityBadge'
import { Card, CardContent } from '@/components/ui/card'
import type { Message } from '@/types'

interface MessageCardProps {
  message: Message
  onClick?: () => void
}

export function MessageCard({ message, onClick }: MessageCardProps) {
  const isGmail = message.source === 'gmail'
  const SourceIcon = isGmail ? Mail : MessageSquare
  
  // Format timestamp
  const timeAgo = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })
  
  // Truncate content for preview
  const previewContent = message.content.length > 150 
    ? `${message.content.substring(0, 150)}...`
    : message.content

  // Extract sender name (remove email if present)
  const displaySender = message.sender.includes('<') 
    ? message.sender.split('<')[0].trim().replace(/"/g, '')
    : message.sender

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md cursor-pointer border-l-4 ${
        message.priority === 'urgent' 
          ? 'border-l-red-500 hover:border-l-red-600' 
          : message.priority === 'question'
            ? 'border-l-yellow-500 hover:border-l-yellow-600'
            : 'border-l-gray-300 hover:border-l-gray-400'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header with source, sender, and priority */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              isGmail ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <SourceIcon className={`w-3 h-3 ${
                isGmail ? 'text-red-600' : 'text-green-600'
              }`} />
            </div>
            
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">{displaySender}</p>
              {message.channel && (
                <p className="text-xs text-gray-500">#{message.channel}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <PriorityBadge priority={message.priority} size="sm" />
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Subject (for Gmail) */}
        {message.subject && (
          <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {message.subject}
          </h4>
        )}

        {/* Content preview */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
          {previewContent}
        </p>

        {/* Footer with timestamp and metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <time dateTime={message.timestamp}>
              {timeAgo}
            </time>
          </span>
          
          {/* Additional metadata */}
          <div className="flex items-center gap-2">
            {message.metadata?.labelIds && message.metadata.labelIds.length > 0 && (
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
                {message.metadata.labelIds.length} label{message.metadata.labelIds.length !== 1 ? 's' : ''}
              </span>
            )}
            <span className="capitalize font-medium">
              {message.source}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}