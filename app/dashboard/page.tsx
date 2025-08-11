import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
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
    <DashboardLayout activeTab="dashboard">
      <div className="space-y-8">
        {/* Connection Cards */}
        <ConnectAccounts />

        {/* Live Message Stream */}
        <MessageStream connectionStatus={connectionStatus} />
      </div>
    </DashboardLayout>
  )
}