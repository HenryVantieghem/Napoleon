'use client'
import { useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, MessageSquare, CheckCircle, XCircle, Loader2, ExternalLink, Shield, AlertCircle, Users, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface ConnectionStatusProps {
  onConnectionChange?: () => void
}

export function ConnectionStatus({ onConnectionChange }: ConnectionStatusProps) {
  const { user } = useUser()
  const [loading, setLoading] = useState({ gmail: false, slack: false })

  // Check Clerk external accounts for connected services
  const gmailAccount = user?.externalAccounts?.find(
    account => account.provider === 'google'
  )
  const slackAccount = user?.externalAccounts?.find(
    account => account.provider === 'slack'
  )

  const handleGmailConnect = async () => {
    setLoading(prev => ({...prev, gmail: true}))
    
    try {
      // Use Clerk's Social Connection OAuth flow
      const baseUrl = window.location.origin
      const redirectUrl = `${baseUrl}/prototype`
      
      // Trigger Clerk Social Connection for Google
      if (user?.createExternalAccount) {
        await user.createExternalAccount({
          strategy: 'oauth_google',
          redirectUrl: redirectUrl,
        })
      } else {
        // Fallback: redirect to Clerk's OAuth endpoint
        window.location.href = `https://clerk.napoleonai.app/v1/oauth/google?redirect_url=${encodeURIComponent(redirectUrl)}`
      }
      
    } catch (error) {
      console.error('Gmail connection failed:', error)
      toast.error('Failed to connect Gmail. Please try again.')
      setLoading(prev => ({...prev, gmail: false}))
    }
  }

  const handleSlackConnect = async () => {
    setLoading(prev => ({...prev, slack: true}))
    
    try {
      // Use Clerk's Social Connection OAuth flow
      const baseUrl = window.location.origin
      const redirectUrl = `${baseUrl}/prototype`
      
      // Trigger Clerk Social Connection for Slack
      if (user?.createExternalAccount) {
        await user.createExternalAccount({
          strategy: 'oauth_slack',
          redirectUrl: redirectUrl,
        })
      } else {
        // Fallback: redirect to Clerk's OAuth endpoint
        window.location.href = `https://clerk.napoleonai.app/v1/oauth/slack?redirect_url=${encodeURIComponent(redirectUrl)}`
      }
      
    } catch (error) {
      console.error('Slack connection failed:', error)
      toast.error('Failed to connect Slack. Please try again.')
      setLoading(prev => ({...prev, slack: false}))
    }
  }

  const handleDisconnect = async (accountId: string, provider: string) => {
    try {
      const account = user?.externalAccounts?.find(acc => acc.id === accountId)
      if (account) {
        await account.destroy()
        toast.success(`${provider} disconnected successfully`)
        onConnectionChange?.()
      }
    } catch (error) {
      console.error(`${provider} disconnection failed:`, error)
      toast.error(`Failed to disconnect ${provider}`)
    }
  }

  const formatConnectionDate = (dateString?: string) => {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get connection date safely
  const getConnectionDate = (account: any) => {
    return account?.createdAt || account?.created_at || new Date().toISOString()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <h3 className="text-2xl font-bold">Account Connections</h3>
        </div>
        <p className="text-muted-foreground text-lg">
          Connect your communication accounts to enable intelligent message streaming
        </p>
      </div>

      {/* Connection Overview */}
      <div className="grid md:grid-cols-2 gap-2 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {(gmailAccount ? 1 : 0) + (slackAccount ? 1 : 0)}/2
          </div>
          <div className="text-sm text-blue-600">Connected Services</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {gmailAccount && slackAccount ? 'Ready' : 'Setup Required'}
          </div>
          <div className="text-sm text-green-600">Streaming Status</div>
        </div>
      </div>

      {/* Connection Cards */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Gmail Connection Card */}
        <Card className={`border-2 transition-all duration-200 ${
          gmailAccount ? 'border-green-300 bg-green-50' : 'border-blue-300 bg-blue-50'
        } hover:shadow-xl`}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold">Gmail Integration</div>
                <div className="text-sm text-muted-foreground">Email intelligence & analysis</div>
              </div>
              {gmailAccount ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-gray-400" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {gmailAccount ? (
              <>
                {/* Connected State */}
                <div className="space-y-4">
                  <Badge className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Connected & Verified
                  </Badge>
                  
                  <div className="p-4 bg-green-100 rounded-xl border border-green-200">
                    <div className="space-y-2">
                      <p className="font-semibold text-green-800 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {gmailAccount.emailAddress}
                      </p>
                      <p className="text-sm text-green-700">
                        ✅ Email streaming enabled • Ready for AI analysis
                      </p>
                      <div className="flex items-center gap-4 text-xs text-green-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Connected {formatConnectionDate(getConnectionDate(gmailAccount))}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          OAuth 2.0 Secured
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">7</div>
                      <div className="text-xs text-blue-600">Days History</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">📧</div>
                      <div className="text-xs text-purple-600">Inbox Access</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">⚡</div>
                      <div className="text-xs text-green-600">Real-time</div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleDisconnect(gmailAccount.id, 'Gmail')}
                    className="w-full text-sm"
                  >
                    Disconnect Gmail
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Not Connected State */}
                <div className="space-y-4">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    <XCircle className="h-4 w-4 mr-2" />
                    Not Connected
                  </Badge>
                  
                  <div className="p-4 bg-blue-100 rounded-xl border border-blue-200">
                    <p className="font-semibold text-blue-800 mb-3">
                      Connect Gmail to unlock:
                    </p>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        AI-powered email insights & summaries
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Communication pattern analysis
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Executive briefing generation
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Urgent message prioritization
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-xs text-amber-800">
                      <p className="font-medium">Secure OAuth 2.0 Connection</p>
                      <p>Napoleon AI never stores your email credentials. All access is managed securely through Clerk Social Connections.</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleGmailConnect}
                    disabled={loading.gmail}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  >
                    {loading.gmail ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting Gmail...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Connect Gmail Account
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Slack Connection Card */}
        <Card className={`border-2 transition-all duration-200 ${
          slackAccount ? 'border-green-300 bg-green-50' : 'border-purple-300 bg-purple-50'
        } hover:shadow-xl`}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold">Slack Integration</div>
                <div className="text-sm text-muted-foreground">Team communication insights</div>
              </div>
              {slackAccount ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-gray-400" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {slackAccount ? (
              <>
                {/* Connected State */}
                <div className="space-y-4">
                  <Badge className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Connected & Verified
                  </Badge>
                  
                  <div className="p-4 bg-green-100 rounded-xl border border-green-200">
                    <div className="space-y-2">
                      <p className="font-semibold text-green-800 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Slack workspace connected
                      </p>
                      <p className="text-sm text-green-700">
                        ✅ Channel access enabled • Ready for team insights
                      </p>
                      <div className="flex items-center gap-4 text-xs text-green-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Connected {formatConnectionDate(getConnectionDate(slackAccount))}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          OAuth 2.0 Secured
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">7</div>
                      <div className="text-xs text-purple-600">Days History</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">💬</div>
                      <div className="text-xs text-blue-600">Channels</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">⚡</div>
                      <div className="text-xs text-green-600">Real-time</div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleDisconnect(slackAccount.id, 'Slack')}
                    className="w-full text-sm"
                  >
                    Disconnect Slack
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Not Connected State */}
                <div className="space-y-4">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    <XCircle className="h-4 w-4 mr-2" />
                    Not Connected
                  </Badge>
                  
                  <div className="p-4 bg-purple-100 rounded-xl border border-purple-200">
                    <p className="font-semibold text-purple-800 mb-3">
                      Connect Slack to unlock:
                    </p>
                    <ul className="space-y-2 text-sm text-purple-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Team communication analysis
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Channel sentiment tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Leadership engagement metrics
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Cross-channel message streaming
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-xs text-amber-800">
                      <p className="font-medium">Enterprise-Grade Permissions</p>
                      <p>Napoleon AI only accesses public channels and respects all Slack privacy settings and permissions.</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleSlackConnect}
                    disabled={loading.slack}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                  >
                    {loading.slack ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting Slack...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Connect Slack Workspace
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Connection Progress */}
      {(!gmailAccount || !slackAccount) && (
        <div className="text-center space-y-4">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-blue-300">
            <h4 className="text-lg font-semibold text-blue-800 mb-2">
              🚀 Next Steps to Complete Setup
            </h4>
            <div className="text-blue-700 space-y-2">
              {!gmailAccount && (
                <p>1. Connect your Gmail account to start streaming email messages</p>
              )}
              {!slackAccount && (
                <p>{!gmailAccount ? '2' : '1'}. Connect your Slack workspace to monitor team communications</p>
              )}
              <p className="text-sm font-medium">
                Once connected, messages will automatically stream with smart prioritization!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {gmailAccount && slackAccount && (
        <div className="text-center space-y-4">
          <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-300">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-green-800 mb-2">
              🎉 Setup Complete!
            </h4>
            <p className="text-green-700">
              Both Gmail and Slack are connected. Your message stream is now active with intelligent prioritization.
            </p>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-green-600">
              <span>✓ 7-day message history</span>
              <span>✓ Urgent detection</span>
              <span>✓ Question prioritization</span>
              <span>✓ Auto-refresh</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}