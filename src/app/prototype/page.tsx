'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { ConnectionStatus } from '@/components/clerk/ConnectionStatus'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Mail, MessageSquare, Brain, RefreshCw, TrendingUp, Shield, Zap, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ConnectionData {
  gmail?: {
    connected: boolean
    messageCount?: number
    error?: string
    user?: { email: string; provider: string; verified?: boolean; connectedAt?: string }
    requiresConnection?: boolean
  }
  slack?: {
    connected: boolean
    channelCount?: number  
    error?: string
    user?: { provider: string; team?: string; connectedAt?: string }
    requiresConnection?: boolean
  }
}

export default function PrototypePage() {
  const { user, isLoaded } = useUser()
  const [connectionData, setConnectionData] = useState<ConnectionData>({})
  const [loading, setLoading] = useState(false)

  const fetchConnectionData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Fetch Gmail connection status
      const gmailResponse = await fetch('/api/clerk/gmail')
      const gmailData = await gmailResponse.json()
      
      // Fetch Slack connection status
      const slackResponse = await fetch('/api/clerk/slack')
      const slackData = await slackResponse.json()

      setConnectionData({
        gmail: {
          connected: gmailData.success || false,
          messageCount: gmailData.messageCount || 0,
          error: gmailData.error,
          user: gmailData.user,
          requiresConnection: gmailData.requiresConnection
        },
        slack: {
          connected: slackData.success || false,
          channelCount: slackData.channelCount || 0,
          error: slackData.error,
          user: slackData.user,
          requiresConnection: slackData.requiresConnection
        }
      })
    } catch (error) {
      console.error('Failed to fetch connection data:', error)
      toast.error('Failed to load connection status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && isLoaded) {
      fetchConnectionData()
    }
  }, [user, isLoaded])

  if (!isLoaded) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-lg text-muted-foreground">Loading Napoleon AI...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 text-center min-h-screen flex items-center justify-center">
        <div className="space-y-6 max-w-md">
          <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 w-fit mx-auto">
            <Brain className="h-12 w-12 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Napoleon AI
            </h1>
            <p className="text-muted-foreground">Enterprise Intelligence Platform</p>
          </div>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              Please sign in to access your dashboard and connect your accounts
            </p>
          </Card>
        </div>
      </div>
    )
  }

  const connectedServices = [
    connectionData.gmail?.connected && 'Gmail',
    connectionData.slack?.connected && 'Slack'
  ].filter(Boolean).length

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Napoleon AI
            </h1>
            <p className="text-xl text-muted-foreground">Enterprise Intelligence Platform</p>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-semibold text-blue-800">
                Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0]}!
              </span>
            </div>
            <p className="text-blue-700">
              Your enterprise intelligence dashboard is powered by Clerk Social Connections. 
              Connect your communication channels to unlock AI-driven insights and executive briefings.
            </p>
          </div>
        </div>
      </div>

      {/* Connection Status Dashboard */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span>Account Connections</span>
            </div>
            <Badge variant="outline" className="ml-auto">
              {connectedServices}/2 Connected
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ConnectionStatus onConnectionChange={fetchConnectionData} />
        </CardContent>
      </Card>

      {/* Intelligence Dashboard */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gmail Intelligence */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-blue-600" />
              Email Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : connectionData.gmail?.connected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <Badge variant="outline">
                    {connectionData.gmail.messageCount} Messages
                  </Badge>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">
                    📧 {connectionData.gmail.user?.email}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Email analysis ready • {connectionData.gmail.messageCount} recent messages indexed
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {connectionData.gmail.messageCount}
                    </div>
                    <div className="text-xs text-blue-600">Recent Messages</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <div className="text-xl font-bold text-purple-600">
                      <Zap className="h-5 w-5 mx-auto" />
                    </div>
                    <div className="text-xs text-purple-600">AI Ready</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Badge variant="secondary">
                  Not Connected
                </Badge>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800">
                    {connectionData.gmail?.error || 'Connect Gmail to unlock email intelligence, communication pattern analysis, and executive briefing summaries.'}
                  </p>
                </div>
                <div className="text-center py-2">
                  <p className="text-xs text-muted-foreground">
                    🔗 Use the "Connect Gmail" button above
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Slack Intelligence */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              Team Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : connectionData.slack?.connected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <Badge variant="outline">
                    {connectionData.slack.channelCount} Channels
                  </Badge>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">
                    💬 {connectionData.slack.user?.team || 'Slack Workspace'}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Team insights ready • {connectionData.slack.channelCount} channels accessible
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {connectionData.slack.channelCount}
                    </div>
                    <div className="text-xs text-purple-600">Channels</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <div className="text-xl font-bold text-blue-600">
                      <Zap className="h-5 w-5 mx-auto" />
                    </div>
                    <div className="text-xs text-blue-600">AI Ready</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Badge variant="secondary">
                  Not Connected
                </Badge>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800">
                    {connectionData.slack?.error || 'Connect Slack to unlock team communication analysis, sentiment tracking, and leadership engagement metrics.'}
                  </p>
                </div>
                <div className="text-center py-2">
                  <p className="text-xs text-muted-foreground">
                    🔗 Use the "Connect Slack" button above
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Analysis Center */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-green-600" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {connectedServices > 0 ? (
                <>
                  <Badge className="bg-green-500 text-white">
                    <Zap className="h-3 w-3 mr-1" />
                    Ready for Analysis
                  </Badge>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800">
                      🧠 AI Engine Active
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {connectedServices} service{connectedServices > 1 ? 's' : ''} connected • Intelligence analysis available
                    </p>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    onClick={() => toast.success('Advanced AI analysis coming soon!')}
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Intelligence Report
                  </Button>
                </>
              ) : (
                <>
                  <Badge variant="secondary">
                    Awaiting Connections
                  </Badge>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      Connect your accounts to unlock:
                    </p>
                    <ul className="text-xs text-blue-700 mt-2 space-y-1">
                      <li>• Executive intelligence briefings</li>
                      <li>• Communication pattern analysis</li>
                      <li>• Sentiment and engagement tracking</li>
                      <li>• Strategic insights and recommendations</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Center */}
      <Card className="border-2 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={fetchConnectionData} 
              disabled={loading}
              variant="outline"
              className="min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing Status...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Connection Status
                </>
              )}
            </Button>
            
            {connectedServices > 0 && (
              <Button 
                className="min-w-[200px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => toast.success('Advanced analytics dashboard coming soon!')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Footer */}
      <div className="text-center py-4 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-4 w-4 text-green-600" />
          <p className="text-sm text-muted-foreground">
            🔒 Enterprise-grade security powered by Clerk Social Connections
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          All OAuth tokens securely managed • GDPR compliant • SOC 2 certified infrastructure
        </p>
      </div>
    </div>
  )
}