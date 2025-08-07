'use client'

import { useAuth, useUser, UserButton } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { ConnectionStatus } from '@/components/clerk/ConnectionStatus'
import { MessageStream } from '@/components/streaming/MessageStream'
import { Brain, Loader2, Menu, X, Settings, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrototypePage() {
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Napoleon AI
                </h1>
                <p className="text-xs text-gray-400">Intelligence Dashboard</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {user?.emailAddresses?.[0]?.emailAddress || 'user@example.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Connection Status */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span>Connection Status</span>
                </h2>
                <ConnectionStatus />
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Live</span>
              </div>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 border-2 border-white/20 rounded-lg shadow-lg",
                    userButtonPopoverCard: "bg-slate-800/95 backdrop-blur-md border border-white/10 shadow-2xl",
                    userButtonPopoverActionButton: "text-white hover:bg-white/10 transition-colors"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-80">
        {/* Top Header */}
        <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white hover:bg-white/10"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Streaming Message Intelligence
                </h1>
                <p className="text-sm text-gray-400">Real-time communication analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Connected</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Dashboard */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Welcome back, {user?.firstName || 'Commander'}!
                    </h2>
                    <p className="text-gray-300">
                      Your intelligent message stream is ready. Monitor communications across Gmail and Slack with AI-powered insights.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Stream */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Live Message Stream</h2>
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
        </main>
      </div>

      {/* Footer */}
      <footer className="lg:ml-80 border-t border-white/10 py-6">
        <div className="px-6">
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