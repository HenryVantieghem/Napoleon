import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { MessageSquare, Settings, Shield } from 'lucide-react'
import { ConnectAccounts } from '@/components/dashboard/ConnectAccounts'
import { MessageStream } from '@/components/dashboard/MessageStream'
import { getUserTokens, isGmailConnected, isSlackConnected } from '@/lib/oauth-handlers'

export const metadata: Metadata = {
  title: 'Dashboard - Napoleon AI',
  description: 'Your unified message dashboard showing Gmail and Slack messages with priority sorting',
}

export default async function DashboardPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  // Get user's connection status
  const tokens = await getUserTokens(user.id)
  const connectionStatus = {
    gmail: tokens ? isGmailConnected(tokens) : false,
    slack: tokens ? isSlackConnected(tokens) : false
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Napoleon AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to your Dashboard</h2>
          <p className="text-gray-600">Connect your accounts to start viewing unified messages</p>
        </div>

        {/* Connection Cards */}
        <div className="mb-8">
          <ConnectAccounts />
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Secure OAuth Integration</h4>
              <p className="text-blue-800 mb-2">
                Napoleon AI uses official OAuth flows to securely access your accounts. Your login credentials 
                are never stored or accessed by our application.
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Tokens are encrypted and stored securely</li>
                <li>• Only read access to your messages</li>
                <li>• You can revoke access at any time</li>
                <li>• No data is permanently stored</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Live Message Stream */}
        <div className="mt-8">
          <MessageStream connectionStatus={connectionStatus} />
        </div>
      </div>
    </div>
  )
}