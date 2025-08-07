'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, MessageCircle, AlertTriangle, RefreshCw, Loader2, Clock, User, Hash, Zap, Brain } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  sender: string
  timestamp: string
  source: 'gmail' | 'slack'
  snippet?: string
  subject?: string
  channel?: string
  threadId?: string
  isUrgent: boolean
  hasQuestion: boolean
}

interface StreamStats {
  total: number
  gmail: number
  slack: number
  urgent: number
  questions: number
}

export function MessageStream() {
  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState<StreamStats>({
    total: 0,
    gmail: 0,
    slack: 0,
    urgent: 0,
    questions: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch Gmail messages
      const gmailResponse = await fetch('/api/clerk/gmail/messages')
      const gmailData = await gmailResponse.json()

      // Fetch Slack messages
      const slackResponse = await fetch('/api/clerk/slack/messages')
      const slackData = await slackResponse.json()

      const allMessages: Message[] = []

      // Process Gmail messages
      if (gmailData.success && gmailData.messages) {
        gmailData.messages.forEach((msg: any) => {
          const content = msg.snippet || msg.subject || 'No content'
          const isUrgent = content.toLowerCase().includes('urgent') || 
                          content.toLowerCase().includes('asap') || 
                          content.toLowerCase().includes('priority')
          const hasQuestion = content.includes('?')

          allMessages.push({
            id: msg.id,
            content: content,
            sender: msg.from || 'Unknown',
            timestamp: msg.internalDate,
            source: 'gmail' as const,
            snippet: msg.snippet,
            subject: msg.subject,
            threadId: msg.threadId,
            isUrgent,
            hasQuestion
          })
        })
      }

      // Process Slack messages
      if (slackData.success && slackData.messages) {
        slackData.messages.forEach((msg: any) => {
          const content = msg.text || 'No content'
          const isUrgent = content.toLowerCase().includes('urgent') || 
                          content.toLowerCase().includes('asap') || 
                          content.toLowerCase().includes('priority')
          const hasQuestion = content.includes('?')

          allMessages.push({
            id: msg.ts,
            content: content,
            sender: msg.user || 'Unknown',
            timestamp: msg.ts,
            source: 'slack' as const,
            channel: msg.channel,
            isUrgent,
            hasQuestion
          })
        })
      }

      // Sort messages: urgent first, then questions, then by timestamp (newest first)
      allMessages.sort((a, b) => {
        if (a.isUrgent && !b.isUrgent) return -1
        if (!a.isUrgent && b.isUrgent) return 1
        if (a.hasQuestion && !b.hasQuestion) return -1
        if (!a.hasQuestion && b.hasQuestion) return 1
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })

      // Calculate stats
      const stats: StreamStats = {
        total: allMessages.length,
        gmail: allMessages.filter(m => m.source === 'gmail').length,
        slack: allMessages.filter(m => m.source === 'slack').length,
        urgent: allMessages.filter(m => m.isUrgent).length,
        questions: allMessages.filter(m => m.hasQuestion).length
      }

      setMessages(allMessages)
      setStats(stats)
      setLastUpdate(new Date())

      if (allMessages.length === 0) {
        setError('No messages found. Make sure your Gmail and Slack accounts are connected above.')
      }

    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Failed to load messages. Please try again.')
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMessages, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSourceIcon = (source: 'gmail' | 'slack') => {
    return source === 'gmail' ? (
      <Mail className="w-4 h-4 text-blue-400" />
    ) : (
      <MessageCircle className="w-4 h-4 text-purple-400" />
    )
  }

  const getPriorityBadge = (message: Message) => {
    if (message.isUrgent) {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          <Zap className="w-3 h-3 mr-1" />
          Urgent
        </Badge>
      )
    }
    if (message.hasQuestion) {
      return (
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          <Brain className="w-3 h-3 mr-1" />
          Question
        </Badge>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-sm text-blue-300">Total Messages</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.gmail}</div>
          <div className="text-sm text-blue-300">Gmail</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-400">{stats.slack}</div>
          <div className="text-sm text-purple-300">Slack</div>
        </div>
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-red-400">{stats.urgent}</div>
          <div className="text-sm text-red-300">Urgent</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-orange-400">{stats.questions}</div>
          <div className="text-sm text-orange-300">Questions</div>
        </div>
      </div>

      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>
        <Button
          onClick={fetchMessages}
          disabled={loading}
          variant="outline"
          size="sm"
          className="border-white/20 text-white hover:bg-white/10"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {/* Messages */}
      {loading && messages.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-gray-400">Loading messages...</p>
          </div>
        </div>
      ) : error && messages.length === 0 ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Unable to Load Messages</h3>
          <p className="text-red-300 mb-4">{error}</p>
          <Button
            onClick={fetchMessages}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Try Again
          </Button>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">No Messages Found</h3>
          <p className="text-gray-400">Connect your accounts to start streaming messages.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message, index) => (
            <Card key={message.id} className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getSourceIcon(message.source)}
                      <span className="text-sm font-medium text-gray-300">
                        {message.source === 'gmail' ? 'Gmail' : 'Slack'}
                      </span>
                    </div>
                    {message.channel && (
                      <div className="flex items-center space-x-1">
                        <Hash className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">{message.channel}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(message)}
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(message.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-300">{message.sender}</span>
                  </div>
                  
                  {message.subject && (
                    <div>
                      <h4 className="font-semibold text-white mb-2">{message.subject}</h4>
                    </div>
                  )}
                  
                  <p className="text-gray-300 leading-relaxed">
                    {message.content.length > 200 
                      ? `${message.content.substring(0, 200)}...` 
                      : message.content
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-white/10 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Enterprise-grade security</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Real-time message streaming</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Smart prioritization</span>
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>All OAuth tokens securely managed by Clerk Social Connections • GDPR compliant • SOC 2 certified infrastructure</p>
          <p>Messages with "urgent" keyword or questions (?) automatically prioritized • Auto-refresh every 30 seconds • Past 7 days data retention</p>
        </div>
      </div>
    </div>
  )
}
