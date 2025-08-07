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
    <div className="space-y-6">
      {/* Connection Overview */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {(gmailAccount ? 1 : 0) + (slackAccount ? 1 : 0)}/2
          </div>
          <div className="text-sm text-gray-400">Connected Services</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">
            {gmailAccount && slackAccount ? 'Ready' : 'Setup Required'}
          </div>
          <div className="text-sm text-gray-400">Streaming Status</div>
        </div>
      </div>

      {/* Connection Cards */}
      <div className="space-y-4">
        {/* Gmail Connection Card */}
        <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all duration-200 ${
          gmailAccount ? 'border-green-500/30' : 'border-blue-500/30'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Gmail Integration</h3>
                <p className="text-sm text-gray-400">Email intelligence & analysis</p>
              </div>
            </div>
            {gmailAccount ? (
              <CheckCircle className="h-6 w-6 text-green-400" />
            ) : (
              <XCircle className="h-6 w-6 text-gray-500" />
            )}
          </div>

          {gmailAccount ? (
            <div className="space-y-3">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected & Verified
              </Badge>
              
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <p className="font-medium text-white flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {gmailAccount.emailAddress}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  ✅ Email streaming enabled • Ready for AI analysis
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
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
              
              <Button
                variant="outline"
                onClick={() => handleDisconnect(gmailAccount.id, 'Gmail')}
                className="w-full border-white/20 text-white hover:bg-white/10"
                size="sm"
              >
                Disconnect Gmail
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Badge variant="outline" className="border-white/20 text-gray-400">
                <XCircle className="h-3 w-3 mr-1" />
                Not Connected
              </Badge>
              
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <p className="font-medium text-white mb-2">
                  Connect Gmail to unlock:
                </p>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    AI-powered email insights
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    Urgent message prioritization
                  </li>
                </ul>
              </div>
              
              <Button
                onClick={handleGmailConnect}
                disabled={loading.gmail}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                size="sm"
              >
                {loading.gmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Connect Gmail
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Slack Connection Card */}
        <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all duration-200 ${
          slackAccount ? 'border-green-500/30' : 'border-purple-500/30'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Slack Integration</h3>
                <p className="text-sm text-gray-400">Team communication insights</p>
              </div>
            </div>
            {slackAccount ? (
              <CheckCircle className="h-6 w-6 text-green-400" />
            ) : (
              <XCircle className="h-6 w-6 text-gray-500" />
            )}
          </div>

          {slackAccount ? (
            <div className="space-y-3">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected & Verified
              </Badge>
              
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <p className="font-medium text-white flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Slack workspace connected
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  ✅ Channel access enabled • Ready for team insights
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
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
              
              <Button
                variant="outline"
                onClick={() => handleDisconnect(slackAccount.id, 'Slack')}
                className="w-full border-white/20 text-white hover:bg-white/10"
                size="sm"
              >
                Disconnect Slack
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Badge variant="outline" className="border-white/20 text-gray-400">
                <XCircle className="h-3 w-3 mr-1" />
                Not Connected
              </Badge>
              
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <p className="font-medium text-white mb-2">
                  Connect Slack to unlock:
                </p>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    Team communication analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    Channel sentiment tracking
                  </li>
                </ul>
              </div>
              
              <Button
                onClick={handleSlackConnect}
                disabled={loading.slack}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                size="sm"
              >
                {loading.slack ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Connect Slack
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Success State */}
      {gmailAccount && slackAccount && (
        <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-400" />
            <div>
              <h4 className="font-semibold text-white">🎉 Setup Complete!</h4>
              <p className="text-sm text-gray-400">
                Both accounts connected. Message streaming is now active.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      {(!gmailAccount || !slackAccount) && (
        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-1">Complete Your Setup</h4>
              <div className="text-sm text-gray-400 space-y-1">
                {!gmailAccount && <p>• Connect Gmail for email intelligence</p>}
                {!slackAccount && <p>• Connect Slack for team insights</p>}
                <p className="text-xs text-gray-500 mt-2">
                  All connections use secure OAuth 2.0 • No credentials stored
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}