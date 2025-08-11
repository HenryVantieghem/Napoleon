'use client'

import { useState, useEffect } from 'react'
import { MessageCard } from './MessageCard'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle, Mail, MessageSquare, Filter } from 'lucide-react'
import type { Message, ConnectionStatus } from '@/types'

interface MessageStreamProps {
  connectionStatus?: ConnectionStatus
}

interface MessageResponse {
  messages: Message[]
  totalCount: number
  source: string
  fetchedAt: string
  error?: string
  code?: string
}

export function MessageStream({ connectionStatus }: MessageStreamProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'urgent' | 'question' | 'gmail' | 'slack'>('all')

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    
    setError(null)

    try {
      const allMessages: Message[] = []
      
      // Fetch Gmail messages if connected
      if (connectionStatus?.gmail) {
        try {
          const gmailResponse = await fetch('/api/messages/gmail')
          if (gmailResponse.ok) {
            const gmailData: MessageResponse = await gmailResponse.json()
            allMessages.push(...gmailData.messages)
          } else {
            const errorData = await gmailResponse.json()
            console.warn('Gmail fetch failed:', errorData.error)
          }
        } catch (gmailError) {
          console.warn('Gmail fetch error:', gmailError)
        }
      }

      // Fetch Slack messages if connected (placeholder for now)
      if (connectionStatus?.slack) {
        try {
          const slackResponse = await fetch('/api/messages/slack')
          if (slackResponse.ok) {
            const slackData: MessageResponse = await slackResponse.json()
            allMessages.push(...slackData.messages)
          } else {
            const errorData = await slackResponse.json()
            console.warn('Slack fetch failed:', errorData.error)
          }
        } catch (slackError) {
          console.warn('Slack fetch error:', slackError)
        }
      }

      // Sort all messages by priority and timestamp
      const sortedMessages = sortMessagesByPriority(allMessages)
      
      setMessages(sortedMessages)
      setLastFetch(new Date())
      
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Failed to fetch messages. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const sortMessagesByPriority = (messages: Message[]): Message[] => {
    return messages.sort((a, b) => {
      // Priority order: urgent > question > normal
      const priorityOrder = { urgent: 3, question: 2, normal: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      
      if (priorityDiff !== 0) {
        return priorityDiff
      }
      
      // If same priority, sort by timestamp (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
  }

  const handleRefresh = () => {
    fetchMessages(true)
  }

  const getFilteredMessages = () => {
    switch (filter) {
      case 'urgent':
        return messages.filter(msg => msg.priority === 'urgent')
      case 'question':
        return messages.filter(msg => msg.priority === 'question')
      case 'gmail':
        return messages.filter(msg => msg.source === 'gmail')
      case 'slack':
        return messages.filter(msg => msg.source === 'slack')
      default:
        return messages
    }
  }

  const filteredMessages = getFilteredMessages()
  const priorityCounts = {
    urgent: messages.filter(msg => msg.priority === 'urgent').length,
    question: messages.filter(msg => msg.priority === 'question').length,
    normal: messages.filter(msg => msg.priority === 'normal').length
  }

  // Show connection prompt if no services connected
  const hasConnections = connectionStatus?.gmail || connectionStatus?.slack
  
  if (!hasConnections) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Accounts</h3>
        <p className="text-gray-600 mb-4">
          Connect Gmail and Slack above to see your unified message stream with intelligent priority sorting.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stream Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Message Stream</h3>
          {lastFetch && (
            <p className="text-sm text-gray-500">
              Last updated {lastFetch.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Priority Summary */}
          {messages.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {priorityCounts.urgent} urgent
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                {priorityCounts.question} questions
              </span>
            </div>
          )}
          
          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white"
          >
            <option value="all">All Messages ({messages.length})</option>
            <option value="urgent">Urgent ({priorityCounts.urgent})</option>
            <option value="question">Questions ({priorityCounts.question})</option>
            {connectionStatus?.gmail && (
              <option value="gmail">Gmail ({messages.filter(m => m.source === 'gmail').length})</option>
            )}
            {connectionStatus?.slack && (
              <option value="slack">Slack ({messages.filter(m => m.source === 'slack').length})</option>
            )}
          </select>
          
          {/* Refresh Button */}
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error loading messages</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="ml-auto">
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Messages List */}
      {!loading && filteredMessages.length > 0 && (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <MessageCard
              key={`${message.source}-${message.id}`}
              message={message}
              onClick={() => {
                // TODO: Open message in modal or external client
                console.log('Open message:', message)
              }}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredMessages.length === 0 && messages.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No messages match your filter</h4>
          <p className="text-gray-600">
            Try selecting a different filter or refresh to see new messages.
          </p>
        </div>
      )}

      {/* No Messages State */}
      {!loading && messages.length === 0 && hasConnections && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No messages found</h4>
          <p className="text-gray-600">
            No messages from the last 7 days. Try refreshing or check your connection status above.
          </p>
        </div>
      )}
    </div>
  )
}