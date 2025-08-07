'use client'
import { useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, MessageSquare, CheckCircle, XCircle, Loader2, ExternalLink, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface ConnectionStatusProps {
  onConnectionChange?: () => void
}

export function ConnectionStatus({ onConnectionChange }: ConnectionStatusProps) {
  const { user } = useUser()
  const [loading, setLoading] = useState({ gmail: false, slack: false })

  // Check Clerk external accounts for connected services
  const gmailAccount = user?.externalAccounts?.find(
    account => account.provider === 'google' || account.provider === 'oauth_google'
  )
  const slackAccount = user?.externalAccounts?.find(
    account => account.provider === 'slack' || account.provider === 'oauth_slack'  
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <p className="text-sm text-muted-foreground">
            Secured by Clerk Social Connections • Enterprise-grade OAuth
          </p>
        </div>
      </div>

      {/* Connection Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gmail Connection Card */}
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">Gmail Integration</div>
                <div className="text-sm text-muted-foreground">Email intelligence & analysis</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Connection Status:</span>
              {gmailAccount ? (
                <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Connected
                </Badge>
              )}
            </div>
            
            {gmailAccount ? (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">
                    ✅ {gmailAccount.emailAddress}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Gmail access enabled • Ready for AI analysis
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect(gmailAccount.id, 'Gmail')}
                  className="w-full"
                >
                  Disconnect Gmail
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">
                    Connect Gmail to unlock:
                  </p>
                  <ul className="text-xs text-blue-700 mt-1 space-y-1">
                    <li>• AI-powered email insights</li>
                    <li>• Communication pattern analysis</li>
                    <li>• Executive briefing summaries</li>
                  </ul>
                </div>
                <Button
                  onClick={handleGmailConnect}
                  disabled={loading.gmail}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading.gmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting Gmail...
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
          </CardContent>
        </Card>

        {/* Slack Connection Card */}
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">Slack Integration</div>
                <div className="text-sm text-muted-foreground">Team communication insights</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Connection Status:</span>
              {slackAccount ? (
                <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Connected
                </Badge>
              )}
            </div>
            
            {slackAccount ? (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">
                    ✅ Slack workspace connected
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Channel access enabled • Ready for team insights
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect(slackAccount.id, 'Slack')}
                  className="w-full"
                >
                  Disconnect Slack
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-800 font-medium">
                    Connect Slack to unlock:
                  </p>
                  <ul className="text-xs text-purple-700 mt-1 space-y-1">
                    <li>• Team communication analysis</li>
                    <li>• Channel sentiment tracking</li>
                    <li>• Leadership engagement metrics</li>
                  </ul>
                </div>
                <Button
                  onClick={handleSlackConnect}
                  disabled={loading.slack}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading.slack ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting Slack...
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}