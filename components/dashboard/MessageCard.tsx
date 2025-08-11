import { formatDistanceToNow } from 'date-fns'
import { Mail, MessageSquare, ExternalLink, Paperclip, Clock, Zap, HelpCircle } from 'lucide-react'
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

  // Get priority icon
  const PriorityIcon = message.priority === 'urgent' 
    ? Zap 
    : message.priority === 'question' 
      ? HelpCircle 
      : null

  return (
    <Card 
      className={`group transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.01] cursor-pointer border-l-4 ${
        message.priority === 'urgent' 
          ? 'border-l-red-500 hover:border-l-red-600 bg-gradient-to-r from-red-50/40 to-transparent hover:from-red-50/70' 
          : message.priority === 'question'
            ? 'border-l-blue-500 hover:border-l-blue-600 bg-gradient-to-r from-blue-50/40 to-transparent hover:from-blue-50/70'
            : 'border-l-gray-300 hover:border-l-gray-400 bg-gradient-to-r from-gray-50/30 to-transparent hover:from-gray-50/60'
      } hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0`}
      onClick={onClick}
      title={`${message.priority === 'urgent' ? '🚨 ' : message.priority === 'question' ? '❓ ' : ''}Click to open in ${message.source === 'gmail' ? 'Gmail' : 'Slack'}`}
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
                {PriorityIcon && (
                  <div title={`${message.priority} priority`}>
                    <PriorityIcon className={`w-3 h-3 flex-shrink-0 ${
                      message.priority === 'urgent' 
                        ? 'text-red-500 animate-pulse' 
                        : 'text-blue-500'
                    }`} />
                  </div>
                )}
                <p className="font-medium text-gray-900 truncate group-hover:text-gray-700 transition-colors">{displaySender}</p>
                {hasAttachments && (
                  <div className="relative">
                    <Paperclip className="w-3 h-3 text-gray-500 flex-shrink-0 group-hover:text-gray-600 transition-colors" />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                      Has attachments
                    </div>
                  </div>
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
            <div className="relative">
              <PriorityBadge priority={message.priority} size="sm" />
            </div>
            <div className="hidden sm:flex items-center text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
              <Clock className="w-3 h-3 mr-1" />
              <span title={new Date(message.timestamp).toLocaleString()}>
                {timeAgo.replace(' ago', '')}
              </span>
            </div>
            <div className="relative">
              <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:text-gray-600 group-hover:scale-110" />
              <div className="absolute -top-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Open in {message.source === 'gmail' ? 'Gmail' : 'Slack'}
              </div>
            </div>
          </div>
        </div>

        {/* Subject (for Gmail) */}
        {message.subject && (
          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-gray-700 transition-colors duration-200" title={message.subject}>
            {message.subject}
          </h4>
        )}

        {/* Content preview */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed group-hover:text-gray-700 transition-colors duration-200" title={message.content.length > 150 ? message.content : undefined}>
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
            <div className="relative group/source">
              <span className={`capitalize font-medium px-2 py-1 rounded-full transition-all duration-200 ${
                isGmail 
                  ? 'bg-red-100 text-red-600 group-hover:bg-red-200 group-hover:text-red-700' 
                  : 'bg-green-100 text-green-600 group-hover:bg-green-200 group-hover:text-green-700'
              }`}>
                {message.source}
              </span>
              <div className="absolute -top-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/source:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                From {message.source === 'gmail' ? 'Gmail' : 'Slack'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}