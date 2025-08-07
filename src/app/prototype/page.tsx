'use client'

import { useAuth } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { ConnectionStatus } from '@/components/clerk/ConnectionStatus'
import { MessageStream } from '@/components/streaming/MessageStream'
import { Brain, Loader2, UserButton } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrototypePage() {
  const { isSignedIn, isLoaded, user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      setLoading(false)
    }
  }, [isLoaded])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center text-white">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 relative z-10" />
          </div>
          <p className="text-lg font-medium">Loading Napoleon AI...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center text-white max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-400 mb-8">
            Please sign in to access your streaming message dashboard.
          </p>
          <Button 
            onClick={() => window.location.href = '/sign-in'}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold"
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Napoleon AI
                </h1>
                <p className="text-sm text-gray-400">Streaming Message Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">Welcome back, {user?.firstName || 'User'}!</p>
                <p className="text-xs text-gray-400">Ready to stream your messages</p>
              </div>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 border-2 border-white/20 rounded-xl shadow-lg",
                    userButtonPopoverCard: "bg-slate-800/95 backdrop-blur-md border border-white/10 shadow-2xl",
                    userButtonPopoverActionButton: "text-white hover:bg-white/10 transition-colors"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Connection Status */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-6 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Connection Status</span>
              </h2>
              <ConnectionStatus />
            </div>
          </div>

          {/* Main Content - Message Stream */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Live Message Stream</h2>
                  <p className="text-gray-400">Real-time intelligence from your connected accounts</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-400">Live</span>
                </div>
              </div>
              <MessageStream />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-400">
                Napoleon AI • Enterprise Intelligence Platform
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Real-time Processing</span>
              <span>•</span>
              <span>AI-Powered</span>
              <span>•</span>
              <span>Enterprise Secure</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}