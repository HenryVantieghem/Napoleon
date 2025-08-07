'use client'
import { useUser } from '@clerk/nextjs'
import { ConnectionStatus } from '@/components/clerk/ConnectionStatus'
import { MessageStream } from '@/components/streaming/MessageStream'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Brain, Shield, Zap, TrendingUp } from 'lucide-react'

export default function PrototypePage() {
  const { user, isLoaded } = useUser()

  // Loading state
  if (!isLoaded) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
          <div>
            <h2 className="text-2xl font-semibold mb-2">Loading Napoleon AI</h2>
            <p className="text-muted-foreground">Initializing streaming prototype...</p>
          </div>
        </div>
      </div>
    )
  }

  // Unauthenticated state
  if (!user) {
    return (
      <div className="container mx-auto py-12 text-center min-h-screen flex items-center justify-center">
        <div className="space-y-8 max-w-lg">
          <div className="p-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 w-fit mx-auto shadow-2xl">
            <Brain className="h-20 w-20 text-white" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Napoleon AI
            </h1>
            <p className="text-2xl text-muted-foreground">Streaming Message Intelligence</p>
          </div>
          
          <Card className="p-8 border-2 border-blue-200">
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Please sign in to access your streaming message dashboard
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-blue-600">
                <div>✓ Gmail integration</div>
                <div>✓ Slack integration</div>
                <div>✓ Smart prioritization</div>
                <div>✓ Real-time streaming</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Main authenticated interface
  return (
    <div className="container mx-auto py-8 space-y-8 max-w-7xl">
      {/* Hero Header */}
      <div className="text-center space-y-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl">
            <Brain className="h-16 w-16 text-white" />
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Napoleon AI
            </h1>
            <p className="text-3xl text-muted-foreground mt-2">Streaming Message Intelligence</p>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="p-8 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-3xl border-2 border-blue-200 shadow-xl">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-3xl font-bold text-blue-800">
                Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0]}!
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 text-blue-700">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <TrendingUp className="h-5 w-5" />
                  Smart Message Streaming
                </div>
                <p className="text-base">
                  Intelligent aggregation of Gmail and Slack messages from the past 7 days with automatic prioritization.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Zap className="h-5 w-5" />
                  Executive Priority System  
                </div>
                <p className="text-base">
                  Messages containing "urgent" or questions (?) are automatically elevated for immediate executive attention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Management Card */}
      <Card className="border-2 border-blue-300 shadow-2xl bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-t-lg">
          <CardTitle className="flex items-center gap-4 text-3xl">
            <Shield className="h-8 w-8 text-blue-600" />
            Account Connections
            <div className="ml-auto">
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Enterprise Secured
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <ConnectionStatus onConnectionChange={() => window.location.reload()} />
        </CardContent>
      </Card>

      {/* Streaming Dashboard Card */}
      <Card className="border-2 border-purple-300 shadow-2xl bg-gradient-to-br from-white to-purple-50">
        <CardContent className="p-8">
          <MessageStream />
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            <span className="text-muted-foreground">Enterprise-grade security</span>
          </div>
          <div className="hidden sm:block text-muted-foreground">•</div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <span className="text-muted-foreground">Real-time message streaming</span>
          </div>
          <div className="hidden sm:block text-muted-foreground">•</div>
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-purple-600" />
            <span className="text-muted-foreground">Smart prioritization</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground max-w-4xl mx-auto">
          <p className="mb-2">
            🔒 All OAuth tokens securely managed by Clerk Social Connections • GDPR compliant • SOC 2 certified infrastructure
          </p>
          <p>
            Messages with "urgent" keyword or questions (?) automatically prioritized • Auto-refresh every 30 seconds • Past 7 days data retention
          </p>
        </div>
      </div>
    </div>
  )
}