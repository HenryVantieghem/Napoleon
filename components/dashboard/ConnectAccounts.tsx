'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, MessageSquare, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface ConnectionStatus {
  gmail: boolean
  slack: boolean
}

interface TokenDetails {
  gmail: {
    connected: boolean
    expired: boolean | null
    connectedAt: number | null
  }
  slack: {
    connected: boolean
    teamName: string | null
    connectedAt: number | null
  }
}

interface TokenStatusResponse {
  connected: ConnectionStatus
  expires: {
    gmail: number | null
    slack: number | null
  }
  status: string
  details: TokenDetails
}

export function ConnectAccounts() {
  const [tokenStatus, setTokenStatus] = useState<TokenStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<{ gmail: boolean, slack: boolean }>({
    gmail: false,
    slack: false
  })

  useEffect(() => {
    fetchTokenStatus()
    
    // Check for OAuth success/error in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const connected = urlParams.get('connected')
    const error = urlParams.get('error')
    
    if (connected) {
      // Refresh token status after successful connection
      setTimeout(fetchTokenStatus, 1000)
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    
    if (error) {
      console.error('OAuth error:', error)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const fetchTokenStatus = async () => {
    try {
      const response = await fetch('/api/user/tokens')
      if (response.ok) {
        const data = await response.json()
        setTokenStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch token status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGmailConnect = async () => {
    setConnecting(prev => ({ ...prev, gmail: true }))
    window.location.href = '/api/oauth/gmail/auth'
  }

  const handleSlackConnect = async () => {
    setConnecting(prev => ({ ...prev, slack: true }))
    window.location.href = '/api/oauth/slack/auth'
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  const isGmailConnected = tokenStatus?.connected?.gmail || false
  const isSlackConnected = tokenStatus?.connected?.slack || false
  const gmailExpired = tokenStatus?.details?.gmail?.expired || false

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Gmail Connection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gmail</h3>
              <p className="text-sm text-gray-500">Connect your Gmail account</p>
            </div>
          </div>
          
          {isGmailConnected ? (
            <div className="flex flex-col items-end space-y-1">
              <Badge variant={gmailExpired ? "destructive" : "default"} className="flex items-center gap-1">
                {gmailExpired ? (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    Token Expired
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    Connected
                  </>
                )}
              </Badge>
              {tokenStatus?.details?.gmail?.connectedAt && (
                <p className="text-xs text-gray-400">
                  Connected {new Date(tokenStatus.details.gmail.connectedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <Badge variant="outline">Not Connected</Badge>
          )}
        </div>
        
        <p className="text-gray-600 mb-4">
          Access your Gmail messages from the last 7 days with secure OAuth authentication.
          {gmailExpired && (
            <span className="block text-red-600 text-sm mt-1">
              Your Gmail token has expired. Please reconnect to continue accessing messages.
            </span>
          )}
        </p>
        
        <Button 
          onClick={handleGmailConnect} 
          disabled={connecting.gmail}
          className={`w-full transition-colors ${
            isGmailConnected && !gmailExpired 
              ? 'bg-green-600 hover:bg-green-700' 
              : gmailExpired 
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {connecting.gmail ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : isGmailConnected && !gmailExpired ? (
            'Reconnect Gmail'
          ) : gmailExpired ? (
            'Refresh Connection'
          ) : (
            'Connect Gmail'
          )}
        </Button>
      </div>

      {/* Slack Connection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Slack</h3>
              <p className="text-sm text-gray-500">Connect your Slack workspace</p>
            </div>
          </div>
          
          {isSlackConnected ? (
            <div className="flex flex-col items-end space-y-1">
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Connected
              </Badge>
              {tokenStatus?.details?.slack?.teamName && (
                <p className="text-xs text-gray-500">
                  {tokenStatus.details.slack.teamName}
                </p>
              )}
              {tokenStatus?.details?.slack?.connectedAt && (
                <p className="text-xs text-gray-400">
                  Connected {new Date(tokenStatus.details.slack.connectedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <Badge variant="outline">Not Connected</Badge>
          )}
        </div>
        
        <p className="text-gray-600 mb-4">
          View messages from your Slack channels and direct messages in one place.
          {isSlackConnected && tokenStatus?.details?.slack?.teamName && (
            <span className="block text-green-600 text-sm mt-1">
              Connected to {tokenStatus.details.slack.teamName} workspace.
            </span>
          )}
        </p>
        
        <Button 
          onClick={handleSlackConnect} 
          disabled={connecting.slack}
          className={`w-full transition-colors ${
            isSlackConnected 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {connecting.slack ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : isSlackConnected ? (
            'Reconnect Slack'
          ) : (
            'Connect Slack'
          )}
        </Button>
      </div>
    </div>
  )
}