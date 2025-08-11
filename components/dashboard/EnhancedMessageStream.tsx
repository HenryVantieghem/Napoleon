'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { useUnifiedMessages, useRefreshMessages, useSmartInvalidation } from '@/hooks/useMessageQueries'
import { useOptimisticMessages } from '@/hooks/useOptimisticMessages'
import { MessageCard } from './MessageCard'
import { MessageLoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { KeyboardShortcutsHelp } from '@/components/ui/KeyboardShortcutsHelp'
import { useVirtualListHeight } from '@/components/ui/VirtualMessageList'
import { LazyPriorityGroupedVirtualList } from '@/components/ui/LazyVirtualMessageList'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { OptimisticButton } from '@/components/ui/OptimisticButton'
import { OptimisticRefreshFeedback, OptimisticCacheFeedback } from '@/components/ui/OptimisticFeedback'
import { RefreshCw, AlertCircle, Mail, MessageSquare, Filter, Wifi, WifiOff } from 'lucide-react'
import type { Message, ConnectionStatus } from '@/types'

interface EnhancedMessageStreamProps {
  connectionStatus?: ConnectionStatus
}

export function EnhancedMessageStream({ connectionStatus }: EnhancedMessageStreamProps) {
  // React Query integration for advanced caching
  const { 
    data: queryData, 
    isLoading, 
    isError, 
    error: queryError,
    isFetching,
    isRefetching,
    dataUpdatedAt 
  } = useUnifiedMessages({
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes - executive data freshness
    refetchInterval: false, // Manual refresh only for executive control
  })
  
  const refreshMutation = useRefreshMessages()
  const { invalidateMessages } = useSmartInvalidation()

  // Local UI state
  const [filter, setFilter] = useState<'all' | 'urgent' | 'question' | 'gmail' | 'slack'>('all')
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(-1)
  const filterSelectRef = useRef<HTMLSelectElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Derive data from React Query with fallbacks
  const rawMessages = queryData?.messages || []
  const stats = queryData?.stats || null
  const serviceErrors = queryData?.errors || []
  const loading = isLoading
  const refreshing = isRefetching || refreshMutation.isPending
  const error = isError ? (queryError as Error)?.message || 'Failed to load messages' : null
  const lastFetch = dataUpdatedAt ? new Date(dataUpdatedAt) : null
  const cacheHit = queryData?.cached || false

  // Optimistic updates for immediate UI feedback
  const {
    messages,
    isUpdating: isOptimisticUpdating,
    hasOptimisticUpdates
  } = useOptimisticMessages(rawMessages, {
    onOptimisticUpdate: (update) => {
      console.log('🚀 React Query + Optimistic update:', update.type)
    },
    onRollback: (update, error) => {
      console.warn('🔙 Optimistic update rolled back:', update.type, error.message)
    }
  })

  // Virtual scrolling calculation
  const virtualListHeight = useVirtualListHeight(containerRef, 300)
  const useVirtualScrolling = useMemo(() => {
    return messages.length > 50 // Use virtual scrolling for 50+ messages
  }, [messages.length])

  // Enhanced refresh handler with React Query
  const handleRefresh = useCallback(async () => {
    try {
      await refreshMutation.mutateAsync()
      console.log('✅ Messages refreshed with React Query + Server Cache')
    } catch (error) {
      console.error('❌ Failed to refresh messages:', error)
      // React Query automatically handles error states
    }
  }, [refreshMutation])

  // Retry handler for failed queries
  const handleRetry = useCallback(() => {
    invalidateMessages()
  }, [invalidateMessages])

  // Keyboard shortcuts with React Query integration
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

  // Memoized filtered messages for performance
  const filteredMessages = useMemo(() => {
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
  }, [messages, filter])

  // Memoized priority counts for performance
  const priorityCounts = useMemo(() => {
    return stats?.priority || {
      urgent: messages.filter(msg => msg.priority === 'urgent').length,
      question: messages.filter(msg => msg.priority === 'question').length,
      normal: messages.filter(msg => msg.priority === 'normal').length,
      total: messages.length
    }
  }, [stats, messages])

  // Optimized message click handler
  const handleMessageClick = useCallback((message: Message) => {
    console.log('Open message:', message)
    
    const url = message.source === 'gmail' 
      ? `https://mail.google.com/mail/u/0/#inbox/${message.id}`
      : `https://app.slack.com/client/${message.metadata?.teamId || 'T00000000'}/${message.metadata?.channelId || 'C00000000'}/thread/${message.id}`
    
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  // Legacy method for backward compatibility
  const getFilteredMessages = useCallback(() => filteredMessages, [filteredMessages])

  // Show connection prompt if no services connected
  const hasConnections = connectionStatus?.gmail || connectionStatus?.slack
  
  if (!hasConnections) {
    return (
      <div 
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-200 p-12 text-center relative overflow-hidden"
        data-state="welcome"
        data-testid="welcome-state"
      >
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
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <WifiOff className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-amber-900 font-semibold mb-2">Service Connection Issues</h4>
              <div className="space-y-2">
                {serviceErrors.map((err: any, idx) => (
                  <div key={idx} className="bg-white/60 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-amber-900 capitalize flex items-center gap-2">
                        {err.service === 'gmail' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                        {err.service}
                      </span>
                      {err.retryable && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Retryable
                        </span>
                      )}
                    </div>
                    <p className="text-amber-800 text-sm">{err.error}</p>
                    {err.code && (
                      <p className="text-amber-600 text-xs mt-1 font-mono">Code: {err.code}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stream Header with React Query Status */}
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
            {cacheHit && (
              <p className="text-xs text-green-600 font-medium">
                ⚡ Cache Hit
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
          
          {/* Optimistic Refresh Button */}
          <OptimisticButton
            onClick={handleRefresh}
            disabled={refreshing || isOptimisticUpdating}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            loadingText="Refreshing..."
            successText="Updated!"
            errorText="Failed"
            showFeedback={true}
            feedbackDuration={2000}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </OptimisticButton>
        </div>
      </div>

      {/* Enhanced Error State */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-red-900 font-semibold mb-2">Unable to Load Messages</h4>
              <p className="text-red-700 mb-4">{error}</p>
              
              <div className="flex items-center gap-3">
                <OptimisticButton
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  loadingText="Retrying..."
                  successText="Refreshed!"
                  errorText="Failed"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </OptimisticButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && <MessageLoadingSkeleton count={5} />}

      {/* Messages List - Virtual or Standard with React Query */}
      {!loading && filteredMessages.length > 0 && (
        <div ref={containerRef}>
          {useVirtualScrolling ? (
            <LazyPriorityGroupedVirtualList
              messages={filteredMessages}
              height={virtualListHeight}
              onMessageClick={handleMessageClick}
              showPrioritySections={filter === 'all'}
              className="border rounded-lg shadow-sm bg-white"
            />
          ) : (
            <div className="space-y-6">
              {/* Performance indicator */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-400 text-center py-2 border-b">
                  React Query + Server Cache ({filteredMessages.length} messages) • Virtual scrolling at 50+
                </div>
              )}

              {/* Priority sections for standard rendering */}
              {filter === 'all' && (
                <>
                  {/* Urgent Messages */}
                  {filteredMessages.filter(m => m.priority === 'urgent').length > 0 && (
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
                                onClick={() => handleMessageClick(message)}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Questions Section */}
                  {filteredMessages.filter(m => m.priority === 'question').length > 0 && (
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
                                onClick={() => handleMessageClick(message)}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Normal Messages Section */}
                  {filteredMessages.filter(m => m.priority === 'normal').length > 0 && (
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
                                onClick={() => handleMessageClick(message)}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
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
                        onClick={() => handleMessageClick(message)}
                      />
                    </div>
                  ))}
                </div>
              )}
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
            <OptimisticButton 
              onClick={() => setFilter('all')}
              variant="outline"
              size="sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Show All Messages
            </OptimisticButton>
            <OptimisticButton 
              onClick={handleRefresh}
              variant="outline" 
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </OptimisticButton>
          </div>
        </div>
      )}

      {/* No Messages State */}
      {!loading && messages.length === 0 && hasConnections && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-200 p-12 text-center">
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
          <OptimisticButton 
            onClick={handleRefresh}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Check for New Messages
          </OptimisticButton>
        </div>
      )}
      
      {/* React Query + Optimistic Feedback */}
      <OptimisticRefreshFeedback isRefreshing={refreshing || isOptimisticUpdating} />
      <OptimisticCacheFeedback isCacheHit={cacheHit} isFetching={isFetching && !refreshing} />
      
      {/* Optimistic Updates Indicator */}
      {hasOptimisticUpdates && (
        <div className="fixed bottom-4 left-4 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-300">
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">React Query + Optimistic Updates</span>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp />
    </div>
  )
}