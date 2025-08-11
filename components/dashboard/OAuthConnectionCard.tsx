'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Loader2,
  Clock,
  Shield,
  Users
} from 'lucide-react'

interface OAuthConnectionCardProps {
  service: 'gmail' | 'slack'
  isConnected: boolean
  isExpired?: boolean
  connectedAt?: number | null
  teamName?: string | null
  onConnect: () => void
  loading?: boolean
}

export function OAuthConnectionCard({
  service,
  isConnected,
  isExpired = false,
  connectedAt,
  teamName,
  onConnect,
  loading = false
}: OAuthConnectionCardProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Handle OAuth flow completion from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const connected = urlParams.get('connected')
    const error = urlParams.get('error')
    
    if (connected === service) {
      // Show success state briefly
      setIsConnecting(false)
      
      // Clean up URL
      const url = new URL(window.location.href)
      url.searchParams.delete('connected')
      url.searchParams.delete('error')
      window.history.replaceState({}, document.title, url.pathname)
    }
    
    if (error && error.includes(service)) {
      setIsConnecting(false)
      console.error(`${service} OAuth error:`, error)
    }
  }, [service])

  const handleConnect = () => {
    setIsConnecting(true)
    onConnect()
  }

  const config = {
    gmail: {
      name: 'Gmail',
      icon: Mail,
      color: 'red',
      description: 'Connect your Gmail account to see priority emails',
      benefits: [
        'Last 7 days of emails',
        'Priority detection for urgent messages',
        'Board & investor communications highlighted',
        'Automatic VIP sender identification'
      ],
      connectUrl: '/api/oauth/gmail/auth'
    },
    slack: {
      name: 'Slack',
      icon: MessageSquare,
      color: 'green',
      description: 'Connect your Slack workspace for team communications',
      benefits: [
        'All channels and direct messages',
        'Real-time team communication updates',
        'Question detection and prioritization',
        'Cross-workspace message aggregation'
      ],
      connectUrl: '/api/oauth/slack/auth'
    }
  } as const

  const serviceConfig = config[service]
  const Icon = serviceConfig.icon

  const getConnectionStatus = () => {
    if (isConnecting || loading) {
      return { variant: 'secondary' as const, text: 'Connecting...', icon: Loader2 }
    }
    if (isConnected && !isExpired) {
      return { variant: 'default' as const, text: 'Connected', icon: CheckCircle }
    }
    if (isConnected && isExpired) {
      return { variant: 'destructive' as const, text: 'Expired', icon: AlertCircle }
    }
    return { variant: 'outline' as const, text: 'Not Connected', icon: AlertCircle }
  }

  const status = getConnectionStatus()
  const StatusIcon = status.icon

  return (
    <div className={`group bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
      isConnected && !isExpired 
        ? 'border-green-200 bg-green-50/30' 
        : isExpired 
          ? 'border-orange-200 bg-orange-50/30'
          : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              service === 'gmail' ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <Icon className={`w-6 h-6 ${
                service === 'gmail' ? 'text-red-600' : 'text-green-600'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{serviceConfig.name}</h3>
              <p className="text-sm text-gray-500">{serviceConfig.description}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <Badge 
              variant={status.variant}
              className="flex items-center gap-1.5"
            >
              <StatusIcon className={`w-3 h-3 ${isConnecting || loading ? 'animate-spin' : ''}`} />
              {status.text}
            </Badge>
            
            {/* Connection Details */}
            {(isConnected || teamName) && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                Details
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Connection Details */}
        {showDetails && (isConnected || teamName) && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
            {teamName && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Workspace:</span>
                <span className="font-medium text-gray-900">{teamName}</span>
              </div>
            )}
            {connectedAt && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Connected:</span>
                <span className="text-gray-700">
                  {new Date(connectedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Security:</span>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-500" />
                <span className="text-green-600 font-medium">OAuth 2.0 Secured</span>
              </div>
            </div>
          </div>
        )}

        {/* Benefits */}
        {!isConnected && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Executive Benefits:</h4>
            <ul className="space-y-2">
              {serviceConfig.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Expired Token Warning */}
        {isConnected && isExpired && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-800">Connection Expired</p>
                <p className="text-orange-700">
                  Your {serviceConfig.name} access token has expired. Reconnect to continue receiving messages.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {isConnected && !isExpired && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Successfully Connected</p>
                <p className="text-green-700">
                  Your {serviceConfig.name} messages will appear in your unified dashboard with priority sorting.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleConnect}
          disabled={isConnecting || loading}
          className={`w-full font-semibold transition-all duration-200 ${
            isConnected && !isExpired
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : isExpired
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : service === 'gmail'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isConnecting || loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting to {serviceConfig.name}...
            </>
          ) : isConnected && !isExpired ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Reconnect {serviceConfig.name}
            </>
          ) : isExpired ? (
            <>
              <Clock className="w-4 h-4 mr-2" />
              Refresh Connection
            </>
          ) : (
            <>
              <Icon className="w-4 h-4 mr-2" />
              Connect {serviceConfig.name}
            </>
          )}
        </Button>

        {/* Security Notice */}
        <p className="text-xs text-gray-500 mt-3 flex items-center justify-center">
          <Shield className="w-3 h-3 mr-1" />
          Enterprise-grade security • Your credentials never stored
        </p>
      </div>
    </div>
  )
}