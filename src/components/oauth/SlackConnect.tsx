'use client'
import { useState } from 'react'
import { ExternalLink, MessageSquare } from 'lucide-react'

interface SlackConnectProps {
  isConnected: boolean
  onRefresh?: () => void
}

export function SlackConnect({ isConnected, onRefresh }: SlackConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  
  const handleSlackConnect = async () => {
    setIsConnecting(true)
    
    try {
      console.log('🔍 [SLACK OAUTH] Initiating Slack User OAuth flow...')
      
      // CRITICAL: Direct redirect to Slack OAuth route - no page refresh
      window.location.href = '/auth/slack'
      
    } catch (error) {
      console.error('❌ [SLACK OAUTH] Error:', error)
      setIsConnecting(false)
    }
  }
  
  if (isConnected) {
    return (
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <span className="font-semibold text-gray-900">Slack</span>
          </div>
          <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        </div>
        
        <p className="text-sm mb-3 text-green-700">
          Successfully connected. Workspace messages are being synced.
        </p>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Refresh Messages
          </button>
        )}
      </div>
    )
  }
  
  return (
    <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-purple-600" />
          <span className="font-semibold text-gray-900">Slack</span>
        </div>
        <div className="w-5 h-5 rounded-full border-2 border-amber-600 flex items-center justify-center">
          <span className="text-amber-600 text-xs">!</span>
        </div>
      </div>
      
      <p className="text-sm mb-3 text-amber-700">
        Connect your Slack workspace to access channels, DMs, and group messages directly.
      </p>
      
      <button
        onClick={handleSlackConnect}
        disabled={isConnecting}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
      >
        <ExternalLink className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect Slack Workspace'}
      </button>
    </div>
  )
}