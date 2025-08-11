'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { OAuthConnectionCard } from './OAuthConnectionCard'
import { ConnectionLoadingSkeleton } from '@/components/ui/LoadingSkeleton'

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

export const ConnectAccounts = memo(function ConnectAccounts() {
  const [tokenStatus, setTokenStatus] = useState<TokenStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchTokenStatus()
    
    // Check for OAuth success/error in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const connected = urlParams.get('connected')
    const error = urlParams.get('error')
    
    if (connected) {
      // Refresh token status after successful connection
      setTimeout(() => {
        setRefreshing(true)
        fetchTokenStatus()
      }, 1000)
    }
    
    if (error) {
      console.error('OAuth error:', error)
    }
  }, [])

  const fetchTokenStatus = useCallback(async () => {
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
      setRefreshing(false)
    }
  }, [])

  const handleGmailConnect = useCallback(() => {
    window.location.href = '/api/oauth/gmail/auth'
  }, [])

  const handleSlackConnect = useCallback(() => {
    window.location.href = '/api/oauth/slack/auth'
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="text-center animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
        
        {/* Connection cards skeleton */}
        <ConnectionLoadingSkeleton />
      </div>
    )
  }

  const isGmailConnected = tokenStatus?.connected?.gmail || false
  const isSlackConnected = tokenStatus?.connected?.slack || false
  const gmailExpired = tokenStatus?.details?.gmail?.expired || false

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Accounts</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Secure OAuth integration with enterprise-grade security. Connect your accounts to start 
          receiving prioritized messages in your executive dashboard.
        </p>
      </div>

      {/* Connection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <OAuthConnectionCard
          service="gmail"
          isConnected={isGmailConnected}
          isExpired={gmailExpired}
          connectedAt={tokenStatus?.details?.gmail?.connectedAt}
          onConnect={handleGmailConnect}
          loading={refreshing}
        />

        <OAuthConnectionCard
          service="slack"
          isConnected={isSlackConnected}
          connectedAt={tokenStatus?.details?.slack?.connectedAt}
          teamName={tokenStatus?.details?.slack?.teamName}
          onConnect={handleSlackConnect}
          loading={refreshing}
        />
      </div>

      {/* Security Notice */}
      {(!isGmailConnected || !isSlackConnected) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Enterprise Security Guarantee</h3>
            <p className="text-blue-800 mb-4">
              Napoleon AI uses official OAuth 2.0 flows with bank-grade encryption. Your login credentials 
              are never stored or accessed by our application.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
              <div>✓ Zero-trust architecture</div>
              <div>✓ Encrypted token storage</div>
              <div>✓ SOC2 compliant infrastructure</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})