'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  User, 
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Filter,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NormalizedMessage } from '@/lib/normalize'

interface ConnectionStatus {
  gmail: boolean
  slack: boolean
}

interface FeedStats {
  totalMessages: number
  urgentCount: number
  questionsCount: number
  lastUpdate: string
}

interface UnifiedFeedProps {
  className?: string
  maxHeight?: string
  showStats?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

const UnifiedFeed = memo<UnifiedFeedProps>(function UnifiedFeed({ 
  className = '',
  maxHeight = 'h-96',
  showStats = true,
  autoRefresh = true,
  refreshInterval = 30000,
}) {
  const [messages, setMessages] = useState<NormalizedMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [connections, setConnections] = useState<ConnectionStatus>({ gmail: false, slack: false })
  const [stats, setStats] = useState<FeedStats>({
    totalMessages: 0,
    urgentCount: 0,
    questionsCount: 0,
    lastUpdate: new Date().toISOString(),
  })
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'urgent'>('all')
  const [retryCount, setRetryCount] = useState(0)

  // Filter messages based on search and priority
  const filteredMessages = messages.filter(message => {
    const matchesSearch = !searchTerm || 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.preview.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPriority = filterPriority === 'all' || 
      (filterPriority === 'urgent' && message.priority >= 80) ||
      (filterPriority === 'high' && message.priority >= 60)

    return matchesSearch && matchesPriority
  })

  // Connect to SSE stream
  const connectStream = useCallback(() => {
    setError(null)
    setRetryCount(prev => prev + 1)

    const eventSource = new EventSource('/api/messages/unified/stream')

    eventSource.onopen = () => {
      console.log('📡 UnifiedFeed: SSE connection opened')
      setConnected(true)
      setLoading(false)
      setRetryCount(0)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'feed_update') {
          console.log('📥 UnifiedFeed: Received feed update', {
            messageCount: data.messages?.length,
            connections: data.connections
          })
          
          setMessages(data.messages || [])
          setConnections(data.connections || { gmail: false, slack: false })
          
          // Update stats
          const urgentCount = (data.messages || []).filter((m: NormalizedMessage) => m.priority >= 80).length
          const questionsCount = (data.messages || []).filter((m: NormalizedMessage) => 
            m.subject.includes('?') || m.preview.includes('?')
          ).length
          
          setStats({
            totalMessages: data.messages?.length || 0,
            urgentCount,
            questionsCount,
            lastUpdate: new Date().toISOString(),
          })
        } else if (data.type === 'heartbeat') {
          console.log('💓 UnifiedFeed: Heartbeat received')
        } else if (data.type === 'error') {
          console.error('❌ UnifiedFeed: Stream error:', data.error)
          setError(data.error)
        }
      } catch (err) {
        console.error('❌ UnifiedFeed: Failed to parse SSE data:', err)
      }
    }

    eventSource.onerror = (event) => {
      console.error('❌ UnifiedFeed: SSE connection error:', event)
      setConnected(false)
      setError('Connection lost. Attempting to reconnect...')
      
      eventSource.close()
      
      // Exponential backoff retry
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)
      setTimeout(() => {
        if (retryCount < 5) {
          connectStream()
        } else {
          setError('Failed to connect after multiple attempts. Please refresh the page.')
          setLoading(false)
        }
      }, delay)
    }

    return eventSource
  }, [retryCount])

  // Initialize connection
  useEffect(() => {
    const eventSource = connectStream()
    return () => {
      eventSource.close()
    }
  }, [connectStream])

  // Manual refresh
  const handleRefresh = useCallback(() => {
    setLoading(true)
    setError(null)
    connectStream()
  }, [connectStream])

  // Clear search and filters
  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setFilterPriority('all')
  }, [])

  // Get priority color and icon
  const getPriorityIndicator = (priority: number) => {
    if (priority >= 80) {
      return { color: 'bg-red-500', icon: AlertCircle, label: 'Urgent' }
    } else if (priority >= 60) {
      return { color: 'bg-orange-500', icon: TrendingUp, label: 'High' }
    } else if (priority >= 40) {
      return { color: 'bg-yellow-500', icon: Clock, label: 'Medium' }
    } else {
      return { color: 'bg-green-500', icon: CheckCircle, label: 'Normal' }
    }
  }

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    } else if (isYesterday(date)) {
      return 'Yesterday'
    } else {
      return format(date, 'MMM d')
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header with stats and controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Unified Message Feed</h3>
            <div className="flex items-center space-x-2">
              {connected ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <Wifi className="w-4 h-4" />
                  <span className="text-xs font-medium">Live</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-600">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-xs font-medium">Offline</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Stats display */}
        {showStats && (
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalMessages}</div>
              <div className="text-xs text-gray-500">Total Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.urgentCount}</div>
              <div className="text-xs text-gray-500">Urgent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.questionsCount}</div>
              <div className="text-xs text-gray-500">Questions</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Badge variant={connections.gmail ? 'default' : 'secondary'} className="text-xs">
                  Gmail
                </Badge>
                <Badge variant={connections.slack ? 'default' : 'secondary'} className="text-xs">
                  Slack
                </Badge>
              </div>
              <div className="text-xs text-gray-500">Connected</div>
            </div>
          </div>
        )}

        {/* Search and filters */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as 'all' | 'high' | 'urgent')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent Only</option>
          </select>
          
          {(searchTerm || filterPriority !== 'all') && (
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Message list */}
      <div className={`${maxHeight} overflow-y-auto`}>
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : error && messages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-600 mb-2">{error}</p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                Retry Connection
              </Button>
            </div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">
                {searchTerm || filterPriority !== 'all' 
                  ? 'No messages match your filters' 
                  : 'No messages found'}
              </p>
              {(searchTerm || filterPriority !== 'all') && (
                <Button onClick={clearFilters} variant="outline" size="sm" className="mt-2">
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMessages.map((message) => {
              const priorityInfo = getPriorityIndicator(message.priority)
              const PriorityIcon = priorityInfo.icon
              
              return (
                <div
                  key={`${message.provider}-${message.id}`}
                  className="p-4 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-start space-x-3">
                    {/* Provider icon */}
                    <div className="flex-shrink-0 mt-1">
                      {message.provider === 'gmail' ? (
                        <Mail className="w-5 h-5 text-red-500" />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-purple-500" />
                      )}
                    </div>

                    {/* Message content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {message.sender}
                        </p>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${priorityInfo.color}`} />
                          <span className="text-xs text-gray-500">{priorityInfo.label}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(message.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-800 mb-1 line-clamp-1">
                        {message.subject}
                      </p>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {message.preview}
                      </p>
                      
                      {message.url && (
                        <a
                          href={message.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
                        >
                          <span>Open in {message.provider === 'gmail' ? 'Gmail' : 'Slack'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Priority indicator */}
                    <div className="flex-shrink-0">
                      <PriorityIcon className={`w-4 h-4 ${
                        message.priority >= 80 ? 'text-red-500' :
                        message.priority >= 60 ? 'text-orange-500' :
                        message.priority >= 40 ? 'text-yellow-500' :
                        'text-green-500'
                      }`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer with last update time */}
      {stats.lastUpdate && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Last updated: {format(new Date(stats.lastUpdate), 'HH:mm:ss')}
            {error && (
              <span className="text-red-500 ml-2">• {error}</span>
            )}
          </p>
        </div>
      )}
    </div>
  )
})

export { UnifiedFeed }