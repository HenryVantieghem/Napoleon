'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { RefreshCw, AlertCircle, Mail, MessageSquare, Filter, Wifi, WifiOff } from 'lucide-react'
import type { NormalizedMessage } from '@/lib/normalize'

interface ConnectionStatus {
  gmail: boolean
  slack: boolean
}

interface MessageStreamProps {
  connectionStatus?: ConnectionStatus
}

interface SSEMessage {
  type: 'initial' | 'update' | 'heartbeat' | 'error'
  messages?: NormalizedMessage[]
  count?: number
  timestamp: string
  message?: string
}

function MessageCard({ message }: { message: NormalizedMessage }) {
  const priorityColor = message.priority_score >= 60 ? 'border-red-200 bg-red-50' :
                       message.priority_score >= 20 ? 'border-yellow-200 bg-yellow-50' :
                       'border-gray-200 bg-white'

  const providerIcon = message.provider === 'google' ? 
    <Mail className="w-4 h-4 text-blue-600" /> : 
    <MessageSquare className="w-4 h-4 text-purple-600" />

  return (
    <div className={`border rounded-lg p-4 ${priorityColor}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {providerIcon}
          <span className="text-sm font-medium text-gray-900">{message.sender}</span>
          <span className="text-xs text-gray-500">
            Score: {message.priority_score}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(message.received_at).toLocaleTimeString()}
        </span>
      </div>
      <h3 className="font-medium text-gray-900 mb-1">{message.subject}</h3>
      <p className="text-sm text-gray-600 line-clamp-2">{message.snippet}</p>
    </div>
  )
}

export function MessageStream({ connectionStatus }: MessageStreamProps) {
  const [messages, setMessages] = useState<NormalizedMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'urgent' | 'normal'>('all')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const connectToStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    console.log('Connecting to SSE stream...')
    setError(null)
    setLoading(true)

    const eventSource = new EventSource('/api/messages/unified/stream')
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('SSE connection opened')
      setIsConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      try {
        const data: SSEMessage = JSON.parse(event.data)
        console.log('SSE message received:', data.type, data.count || 0)
        
        switch (data.type) {
          case 'initial':
            if (data.messages) {
              setMessages(data.messages)
              setLoading(false)
              setLastUpdate(new Date(data.timestamp))
            }
            break
            
          case 'update':
            if (data.messages) {
              setMessages(prev => {
                // Merge new messages with existing ones, removing duplicates
                const existingIds = new Set(prev.map(m => m.id))
                const newMessages = data.messages!.filter(m => !existingIds.has(m.id))
                const updated = [...newMessages, ...prev]
                
                // Sort by priority score and timestamp
                return updated.sort((a, b) => {
                  if (a.priority_score !== b.priority_score) {
                    return b.priority_score - a.priority_score
                  }
                  return new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
                })
              })
              setLastUpdate(new Date(data.timestamp))
            }
            break
            
          case 'heartbeat':
            // Just update the last update time to show connection is alive
            setLastUpdate(new Date(data.timestamp))
            break
            
          case 'error':
            console.error('SSE error message:', data.message)
            setError(data.message || 'Stream error')
            break
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err)
        setError('Failed to parse stream data')
      }
    }

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err)
      setIsConnected(false)
      setError('Connection lost. Retrying...')
      
      // Retry connection after a delay
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          connectToStream()
        }
      }, 5000)
    }
  }, [])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsConnected(false)
  }, [])

  const refreshStream = useCallback(() => {
    disconnect()
    connectToStream()
  }, [disconnect, connectToStream])

  useEffect(() => {
    connectToStream()
    
    return () => {
      disconnect()
    }
  }, [connectToStream, disconnect])

  // Filter messages based on selected filter
  const filteredMessages = messages.filter(message => {
    switch (filter) {
      case 'urgent':
        return message.priority_score >= 60
      case 'normal':
        return message.priority_score < 60
      default:
        return true
    }
  })

  // Calculate stats
  const stats = {
    total: messages.length,
    urgent: messages.filter(m => m.priority_score >= 60).length,
    question: messages.filter(m => m.priority_score >= 20 && m.priority_score < 60).length,
    normal: messages.filter(m => m.priority_score < 20).length,
    gmail: messages.filter(m => m.provider === 'google').length,
    slack: messages.filter(m => m.provider === 'slack').length
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with stats and controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Live Message Feed</h2>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Messages ({stats.total})</option>
            <option value="urgent">Urgent ({stats.urgent})</option>
            <option value="normal">Normal ({stats.normal})</option>
          </select>
          
          <button
            onClick={refreshStream}
            className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600">{stats.urgent}</div>
          <div className="text-sm text-gray-500">Urgent</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-yellow-600">{stats.question}</div>
          <div className="text-sm text-gray-500">Questions</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">{stats.gmail}</div>
          <div className="text-sm text-gray-500">Gmail</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-purple-600">{stats.slack}</div>
          <div className="text-sm text-gray-500">Slack</div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Last update timestamp */}
      {lastUpdate && (
        <div className="text-xs text-gray-500 text-center">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {/* Messages list */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-500">
              {messages.length === 0 
                ? "Connect your Gmail and Slack accounts to see messages here"
                : "No messages match the current filter"}
            </p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))
        )}
      </div>
    </div>
  )
}