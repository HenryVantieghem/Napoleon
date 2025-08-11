'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCard } from './MessageCard'
import { MessageLoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { KeyboardShortcutsHelp } from '@/components/ui/KeyboardShortcutsHelp'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
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

interface UnifiedResponse {
  messages: Message[]
  stats: {
    priority: {
      urgent: number
      question: number
      normal: number
      total: number
    }
    sources: {
      gmail: number
      slack: number
    }
    performance: {
      gmailFetchTime: number
      slackFetchTime: number
      totalFetchTime: number
    }
  }
  connections: {
    gmail: boolean
    slack: boolean
  }
  errors?: Array<{ service: string; error: string }>
  fetchedAt: string
}

export function MessageStream({ connectionStatus }: MessageStreamProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'urgent' | 'question' | 'gmail' | 'slack'>('all')
  const [stats, setStats] = useState<UnifiedResponse['stats'] | null>(null)
  const [serviceErrors, setServiceErrors] = useState<Array<{ service: string; error: string }>>([])
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(-1)
  const filterSelectRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onRefresh: () => {
      if (!refreshing && !loading) {
        handleRefresh()
      }
    },
    onNextMessage: () => {
      const filtered = getFilteredMessages()
      if (filtered.length > 0) {
        setSelectedMessageIndex(prev => 
          prev < filtered.length - 1 ? prev + 1 : 0
        )
      }
    },
    onPrevMessage: () => {
      const filtered = getFilteredMessages()
      if (filtered.length > 0) {
        setSelectedMessageIndex(prev => 
          prev > 0 ? prev - 1 : filtered.length - 1
        )
      }
    },
    onToggleFilter: () => {
      if (filterSelectRef.current) {
        filterSelectRef.current.focus()
      }
    },
    onEscape: () => {
      setSelectedMessageIndex(-1)
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    }
  })

  const fetchMessages = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    
    setError(null)
    setServiceErrors([])

    try {
      // Use the unified endpoint for aggregated messages
      const response = await fetch('/api/messages/unified')
      
      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle no connections error specially
        if (errorData.code === 'NO_CONNECTIONS') {
          setMessages([])
          setStats(null)
          return
        }
        
        throw new Error(errorData.error || 'Failed to fetch messages')
      }
      
      const data: UnifiedResponse = await response.json()
      
      // Update state with unified data
      setMessages(data.messages || [])
      setStats(data.stats)
      setServiceErrors(data.errors || [])
      setLastFetch(new Date(data.fetchedAt))
      
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch messages. Please try again.')
      setMessages([])
      setStats(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
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
  const priorityCounts = stats?.priority || {
    urgent: messages.filter(msg => msg.priority === 'urgent').length,
    question: messages.filter(msg => msg.priority === 'question').length,
    normal: messages.filter(msg => msg.priority === 'normal').length,
    total: messages.length
  }

  // Show connection prompt if no services connected
  const hasConnections = connectionStatus?.gmail || connectionStatus?.slack
  
  if (!hasConnections) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-200 p-12 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20 opacity-50"></div>
        <div className="relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Executive Command Center</h3>
          <p className="text-gray-700 mb-6 max-w-md mx-auto leading-relaxed">
            Connect your Gmail and Slack accounts above to unlock your unified message stream with 
            AI-powered priority detection designed for executives.
          </p>
          <div className="flex justify-center items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span>2-Minute Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Zero Data Storage</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Service Errors Alert */}
      {serviceErrors.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-amber-800 text-sm font-medium">Some services encountered issues</p>
              <ul className="mt-1 text-amber-700 text-xs space-y-0.5">
                {serviceErrors.map((err, idx) => (
                  <li key={idx}>
                    <span className="font-medium capitalize">{err.service}:</span> {err.error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Stream Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Unified Message Stream</h3>
          <div className="flex items-center gap-3 mt-1">
            {lastFetch && (
              <p className="text-sm text-gray-500">
                Last updated {lastFetch.toLocaleTimeString()}
              </p>
            )}
            {stats?.performance && (
              <p className="text-xs text-gray-400">
                Loaded in {(stats.performance.totalFetchTime / 1000).toFixed(1)}s
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Priority Summary */}
          {messages.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600">
              {priorityCounts.urgent > 0 && (
                <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full font-medium">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  {priorityCounts.urgent} urgent
                </span>
              )}
              {priorityCounts.question > 0 && (
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {priorityCounts.question} questions
                </span>
              )}
              {priorityCounts.normal > 0 && (
                <span className="flex items-center gap-1 text-gray-500">
                  {priorityCounts.normal} normal
                </span>
              )}
            </div>
          )}
          
          {/* Filter Dropdown */}
          <select
            ref={filterSelectRef}
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            title="Filter messages (press F to focus)"
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
      {loading && <MessageLoadingSkeleton count={5} />}

      {/* Messages List with Priority Sections */}
      {!loading && filteredMessages.length > 0 && (
        <div className="space-y-6">
          {/* Urgent Messages Section */}
          {filter === 'all' && filteredMessages.filter(m => m.priority === 'urgent').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <h4 className="text-sm font-semibold text-red-900 uppercase tracking-wider">
                  Urgent Messages ({filteredMessages.filter(m => m.priority === 'urgent').length})
                </h4>
              </div>
              <div className="space-y-3">
                {filteredMessages
                  .filter(m => m.priority === 'urgent')
                  .map((message, index) => (
                    <div
                      key={`${message.source}-${message.id}`}
                      className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <MessageCard
                        message={message}
                        onClick={() => {
                          console.log('Open message:', message)
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Questions Section */}
          {filter === 'all' && filteredMessages.filter(m => m.priority === 'question').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-blue-900 uppercase tracking-wider">
                  Questions ({filteredMessages.filter(m => m.priority === 'question').length})
                </h4>
              </div>
              <div className="space-y-3">
                {filteredMessages
                  .filter(m => m.priority === 'question')
                  .map((message, index) => (
                    <div
                      key={`${message.source}-${message.id}`}
                      className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <MessageCard
                        message={message}
                        onClick={() => {
                          console.log('Open message:', message)
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Normal Messages Section */}
          {filter === 'all' && filteredMessages.filter(m => m.priority === 'normal').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Other Messages ({filteredMessages.filter(m => m.priority === 'normal').length})
                </h4>
              </div>
              <div className="space-y-3">
                {filteredMessages
                  .filter(m => m.priority === 'normal')
                  .map((message, index) => (
                    <div
                      key={`${message.source}-${message.id}`}
                      className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <MessageCard
                        message={message}
                        onClick={() => {
                          console.log('Open message:', message)
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Filtered View (non-priority filters) */}
          {filter !== 'all' && (
            <div className="space-y-3">
              {filteredMessages.map((message, index) => (
                <div
                  key={`${message.source}-${message.id}`}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <MessageCard
                    message={message}
                    onClick={() => {
                      console.log('Open message:', message)
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredMessages.length === 0 && messages.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Filter className="w-8 h-8 text-blue-600" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-3">No messages match your filter</h4>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Try selecting a different filter or refresh to see new messages from your connected accounts.
          </p>
          <div className="flex justify-center gap-3">
            <Button 
              onClick={() => setFilter('all')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Show All Messages
            </Button>
            <Button 
              onClick={handleRefresh}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      )}

      {/* No Messages State */}
      {!loading && messages.length === 0 && hasConnections && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-200 p-12 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-100/20 to-emerald-100/20 opacity-50"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">You're All Caught Up!</h4>
            <p className="text-gray-700 mb-6 max-w-md mx-auto leading-relaxed">
              No new messages from the last 7 days. Your connected accounts are monitoring for new communications.
            </p>
            <div className="flex justify-center items-center gap-8 text-sm text-gray-600 mb-6">
              {connectionStatus?.gmail && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <Mail className="w-4 h-4" />
                  <span>Gmail Connected</span>
                </div>
              )}
              {connectionStatus?.slack && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <MessageSquare className="w-4 h-4" />
                  <span>Slack Connected</span>
                </div>
              )}
            </div>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Check for New Messages
            </Button>
          </div>
        </div>
      )}
      
      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp />
    </div>
  )
}