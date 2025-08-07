'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, MessageSquare, Clock, AlertTriangle, RefreshCw, Loader2, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  sender: string
  timestamp: string
  source: 'gmail' | 'slack'
  isUrgent: boolean
  hasQuestion: boolean
  snippet: string
  subject?: string
  channel?: string
  threadId?: string
}

interface StreamStats {
  totalMessages: number
  gmailCount: number
  slackCount: number
  urgentCount: number
  questionCount: number
  lastUpdate: Date
}

export function MessageStream() {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState<StreamStats>({
    totalMessages: 0,
    gmailCount: 0,
    slackCount: 0,
    urgentCount: 0,
    questionCount: 0,
    lastUpdate: new Date()
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchMessages = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('Fetching messages for streaming dashboard...')
      
      // Fetch Gmail messages (last 7 days)
      const gmailResponse = await fetch('/api/clerk/gmail/messages', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const gmailData = await gmailResponse.json()
      console.log('Gmail response:', gmailData)
      
      // Fetch Slack messages (last 7 days)
      const slackResponse = await fetch('/api/clerk/slack/messages', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const slackData = await slackResponse.json()
      console.log('Slack response:', slackData)
      
      // Process and combine messages
      const allMessages: Message[] = []
      
      // Process Gmail messages
      if (gmailData.success && gmailData.messages) {
        gmailData.messages.forEach((msg: any) => {
          const content = msg.snippet || msg.subject || 'No preview available'
          const fullContent = `${msg.subject || ''} ${content}`.toLowerCase()
          const isUrgent = fullContent.includes('urgent') || fullContent.includes('asap') || fullContent.includes('priority')
          const hasQuestion = content.includes('?') || msg.subject?.includes('?')
          
          allMessages.push({
            id: `gmail-${msg.id}`,
            content,
            sender: msg.from?.replace(/<.*?>/g, '').trim() || 'Unknown',
            timestamp: msg.internalDate || Date.now().toString(),
            source: 'gmail',
            isUrgent,
            hasQuestion,
            snippet: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
            subject: msg.subject,
            threadId: msg.threadId
          })
        })
      } else if (gmailData.error && !gmailData.requiresConnection) {
        console.error('Gmail API error:', gmailData.error)
      }
      
      // Process Slack messages
      if (slackData.success && slackData.messages) {
        slackData.messages.forEach((msg: any) => {
          const content = msg.text || 'No text available'
          const isUrgent = content.toLowerCase().includes('urgent') || content.toLowerCase().includes('asap') || content.toLowerCase().includes('priority')
          const hasQuestion = content.includes('?')
          
          allMessages.push({
            id: `slack-${msg.ts}`,
            content,
            sender: msg.user || 'Unknown User',
            timestamp: (parseFloat(msg.ts || '0') * 1000).toString(),
            source: 'slack',
            isUrgent,
            hasQuestion,
            snippet: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
            channel: msg.channel
          })
        })
      } else if (slackData.error && !slackData.requiresConnection) {
        console.error('Slack API error:', slackData.error)
      }
      
      // Sort messages: urgent first, then questions, then by timestamp (newest first)
      const sortedMessages = allMessages.sort((a, b) => {
        // Priority 1: Urgent messages
        if (a.isUrgent && !b.isUrgent) return -1
        if (!a.isUrgent && b.isUrgent) return 1
        
        // Priority 2: Question messages
        if (a.hasQuestion && !b.hasQuestion) return -1
        if (!a.hasQuestion && b.hasQuestion) return 1
        
        // Priority 3: Most recent first
        const aTime = new Date(parseInt(a.timestamp)).getTime()
        const bTime = new Date(parseInt(b.timestamp)).getTime()
        return bTime - aTime
      })
      
      setMessages(sortedMessages)
      setStats({
        totalMessages: sortedMessages.length,
        gmailCount: sortedMessages.filter(m => m.source === 'gmail').length,
        slackCount: sortedMessages.filter(m => m.source === 'slack').length,
        urgentCount: sortedMessages.filter(m => m.isUrgent).length,
        questionCount: sortedMessages.filter(m => m.hasQuestion).length,
        lastUpdate: new Date()
      })
      
      if (sortedMessages.length === 0) {
        setError('No messages found. Make sure your Gmail and Slack accounts are connected above.')
      }
      
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      setError('Failed to load messages. Please try again.')
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (user) {
      fetchMessages()
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchMessages, 30000)
      return () => clearInterval(interval)
    }
  }, [user])
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp))
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`
    if (diffDays < 7) return `${Math.floor(diffDays)}d ago`
    return date.toLocaleDateString()
  }
  
  const formatUpdateTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit' 
    })
  }
  
  return (
    <div className="space-y-6">
      {/* Header with Live Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Live Message Stream
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Past 7 days • {stats.totalMessages} messages • Updated {formatUpdateTime(stats.lastUpdate)}
          </p>
        </div>
        
        <Button 
          onClick={fetchMessages} 
          disabled={loading} 
          variant="outline" 
          size="lg"
          className="min-w-[180px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Streaming...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Stream
            </>
          )}
        </Button>
      </div>
      
      {/* Live Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalMessages}</div>
            <div className="text-sm text-blue-600 font-medium">Total Messages</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-indigo-200 bg-indigo-50/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600">{stats.gmailCount}</div>
            <div className="text-sm text-indigo-600 font-medium">Gmail</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-200 bg-purple-50/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.slackCount}</div>
            <div className="text-sm text-purple-600 font-medium">Slack</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-200 bg-red-50/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{stats.urgentCount}</div>
            <div className="text-sm text-red-600 font-medium">Urgent</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-orange-200 bg-orange-50/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.questionCount}</div>
            <div className="text-sm text-orange-600 font-medium">Questions</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Message Stream */}
      <div className="space-y-4">
        {loading && messages.length === 0 ? (
          <div className="text-center py-16">
            <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-2">Loading Message Stream</h3>
            <p className="text-muted-foreground text-lg">
              Fetching Gmail and Slack messages from the past 7 days...
            </p>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>Connecting to Gmail</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-600" />
                <span>Connecting to Slack</span>
              </div>
            </div>
          </div>
        ) : error ? (
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="p-12 text-center space-y-4">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
              <div>
                <h3 className="text-2xl font-bold text-red-800 mb-2">Unable to Load Messages</h3>
                <p className="text-red-700 text-lg">{error}</p>
              </div>
              <Button onClick={fetchMessages} variant="destructive" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : messages.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-16 text-center space-y-6">
              <div className="p-8 rounded-full bg-blue-50 w-fit mx-auto">
                <Mail className="h-16 w-16 text-blue-600" />
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-3">No Messages Found</h3>
                <p className="text-muted-foreground text-xl mb-4">
                  Connect your Gmail and Slack accounts above to start streaming messages
                </p>
                <p className="text-sm text-muted-foreground">
                  Once connected, you'll see messages from the past 7 days with smart prioritization
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Priority Messages Notice */}
            {(stats.urgentCount > 0 || stats.questionCount > 0) && (
              <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl">
                <p className="text-center text-red-800 font-medium">
                  🚨 {stats.urgentCount + stats.questionCount} priority messages detected and shown first
                </p>
              </div>
            )}
            
            {/* Message Cards */}
            {messages.map((message, index) => (
              <Card 
                key={message.id} 
                className={`border-2 transition-all duration-200 hover:shadow-xl ${
                  message.isUrgent 
                    ? 'border-red-300 bg-red-50 shadow-red-100' 
                    : message.hasQuestion 
                    ? 'border-orange-300 bg-orange-50 shadow-orange-100' 
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-blue-100'
                }`}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Message Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-wrap min-w-0 flex-1">
                        {message.source === 'gmail' ? (
                          <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        ) : (
                          <MessageSquare className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        )}
                        
                        <span className="font-semibold text-base truncate">{message.sender}</span>
                        
                        <Badge 
                          variant={message.source === 'gmail' ? 'default' : 'secondary'} 
                          className="text-xs flex-shrink-0"
                        >
                          {message.source.toUpperCase()}
                        </Badge>
                        
                        {message.channel && (
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            #{message.channel}
                          </Badge>
                        )}
                        
                        {message.isUrgent && (
                          <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs flex-shrink-0">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            URGENT
                          </Badge>
                        )}
                        
                        {message.hasQuestion && (
                          <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs flex-shrink-0">
                            ❓ Question
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                        <Clock className="h-4 w-4" />
                        <span className="whitespace-nowrap">{formatTimestamp(message.timestamp)}</span>
                      </div>
                    </div>
                    
                    {/* Subject Line (Gmail) */}
                    {message.subject && (
                      <div className="pl-8">
                        <p className="font-semibold text-gray-900 text-base leading-tight">
                          {message.subject}
                        </p>
                      </div>
                    )}
                    
                    {/* Message Content */}
                    <div className="pl-8">
                      <p className="text-gray-700 leading-relaxed">
                        {message.snippet}
                      </p>
                    </div>
                    
                    {/* Message Separator Line */}
                    <div className="border-b border-gray-200 mt-4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Auto-refresh Notice */}
      {messages.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            🔄 Stream auto-refreshes every 30 seconds • Last update: {formatUpdateTime(stats.lastUpdate)}
          </p>
        </div>
      )}
    </div>
  )
}
