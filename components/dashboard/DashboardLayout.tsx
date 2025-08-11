'use client'

import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import { 
  MessageSquare, 
  Mail, 
  Settings, 
  BarChart3, 
  Shield,
  Menu,
  X,
  Home,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardLayoutProps {
  children: React.ReactNode
  activeTab?: 'dashboard' | 'messages' | 'analytics' | 'settings'
}

export function DashboardLayout({ children, activeTab = 'dashboard' }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home, 
      current: activeTab === 'dashboard',
      description: 'Executive overview'
    },
    { 
      name: 'Messages', 
      href: '/dashboard/messages', 
      icon: MessageSquare, 
      current: activeTab === 'messages',
      description: 'Unified message stream'
    },
    { 
      name: 'Analytics', 
      href: '/dashboard/analytics', 
      icon: BarChart3, 
      current: activeTab === 'analytics',
      description: 'Communication insights'
    },
    { 
      name: 'Settings', 
      href: '/dashboard/settings', 
      icon: Settings, 
      current: activeTab === 'settings',
      description: 'Account & preferences'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-6 bg-gray-900">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Napoleon AI</h1>
            </div>
            <button
              type="button"
              className="text-gray-300 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    item.current ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  <div>
                    <div>{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </a>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto bg-white border-r border-gray-200 shadow-sm">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 bg-gray-900">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Napoleon AI</h1>
            </div>
          </div>

          {/* Executive Status Card */}
          <div className="mx-4 my-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Executive Account</div>
                <div className="text-xs text-gray-500">Premium Features Active</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Communication Health</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-600 font-medium">Excellent</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 pb-6">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-4 h-5 w-5 flex-shrink-0 ${
                    item.current ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-75 mt-0.5">{item.description}</div>
                  </div>
                </a>
              )
            })}
          </nav>

          {/* Quick Stats */}
          <div className="px-4 pb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">Today's Summary</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-bold text-gray-900">0</div>
                  <div className="text-gray-500">Urgent</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900">0</div>
                  <div className="text-gray-500">Questions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="lg:hidden">
          <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Napoleon AI</h1>
            </div>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
              afterSignOutUrl="/"
            />
          </div>
        </div>

        {/* Desktop header */}
        <header className="hidden lg:block bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Executive Command Center</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Unified communications with intelligent priority detection
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Performance indicator */}
                <div className="hidden xl:flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">System Status:</span>
                    <span className="text-green-600 font-medium">Optimal</span>
                  </div>
                </div>
                
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                  afterSignOutUrl="/"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}