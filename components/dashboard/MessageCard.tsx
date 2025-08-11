import { formatDistanceToNow } from 'date-fns'
import { Mail, MessageSquare, ExternalLink, Paperclip, Clock } from 'lucide-react'
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

  // Check for attachments
  const hasAttachments = message.metadata?.hasAttachments || false

  return (
    <Card 
      className={`group transition-all duration-200 hover:shadow-lg cursor-pointer border-l-4 ${
        message.priority === 'urgent' 
          ? 'border-l-red-500 hover:border-l-red-600 bg-red-50/30 hover:bg-red-50/50' 
          : message.priority === 'question'
            ? 'border-l-blue-500 hover:border-l-blue-600 bg-blue-50/30 hover:bg-blue-50/50'
            : 'border-l-gray-300 hover:border-l-gray-400 hover:bg-gray-50/50'
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
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 truncate">{displaySender}</p>
                {hasAttachments && (
                  <Paperclip className="w-3 h-3 text-gray-500 flex-shrink-0" />
                )}
              </div>
              {message.senderEmail && message.senderEmail !== displaySender && (
                <p className="text-xs text-gray-500 truncate">{message.senderEmail}</p>
              )}
              {message.channel && (
                <p className="text-xs text-gray-500">#{message.channel}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <PriorityBadge priority={message.priority} size="sm" />
            <div className="hidden sm:flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              {timeAgo.replace(' ago', '')}
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Subject (for Gmail) */}
        {message.subject && (
          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-gray-700 transition-colors">
            {message.subject}
          </h4>
        )}

        {/* Content preview */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {previewContent}
        </p>

        {/* Footer with metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {/* Gmail-specific metadata */}
            {isGmail && message.metadata?.labelIds && message.metadata.labelIds.length > 0 && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                {message.metadata.labelIds.length} label{message.metadata.labelIds.length !== 1 ? 's' : ''}
              </span>
            )}
            
            {/* Thread indicator for Gmail */}
            {isGmail && message.metadata?.threadId && (
              <span className="text-gray-500">Thread</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`capitalize font-medium px-2 py-1 rounded-full ${
              isGmail 
                ? 'bg-red-100 text-red-600' 
                : 'bg-green-100 text-green-600'
            }`}>
              {message.source}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}