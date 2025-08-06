'use client'
import { useState } from 'react'
import { ExternalLink, Mail } from 'lucide-react'

interface GmailConnectProps {
  isConnected: boolean
  onRefresh?: () => void
}

export function GmailConnect({ isConnected, onRefresh }: GmailConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  
  const handleGmailConnect = async () => {
    setIsConnecting(true)
    
    try {
      console.log('🔍 [GMAIL OAUTH] Button clicked - starting OAuth flow...')
      console.log('🔍 [GMAIL OAUTH] Environment check:', {
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
        hasClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      })
      
      // Add a small delay to ensure state is set
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('🔍 [GMAIL OAUTH] Redirecting to /auth/gmail route...')
      
      // CRITICAL: Direct redirect to Gmail OAuth route - no page refresh
      window.location.href = '/auth/gmail'
      
    } catch (error) {
      console.error('❌ [GMAIL OAUTH] Error:', error)
      setIsConnecting(false)
      alert('OAuth Error: ' + error.message)
    }
  }
  
  if (isConnected) {
    return (
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-red-600" />
            <span className="font-semibold text-gray-900">Gmail</span>
          </div>
          <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        </div>
        
        <p className="text-sm mb-3 text-green-700">
          Successfully connected. Messages are being synced.
        </p>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Refresh Messages
          </button>
        )}
      </div>
    )
  }
  
  return (
    <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-red-600" />
          <span className="font-semibold text-gray-900">Gmail</span>
        </div>
        <div className="w-5 h-5 rounded-full border-2 border-red-600 flex items-center justify-center">
          <span className="text-red-600 text-xs">✗</span>
        </div>
      </div>
      
      <p className="text-sm mb-3 text-red-700">
        Not connected. Click below to authorize Gmail access with offline refresh tokens.
      </p>
      
      <button
        onClick={handleGmailConnect}
        disabled={isConnecting}
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        <ExternalLink className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect Gmail'}
      </button>
    </div>
  )
}