import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Metadata, Viewport } from 'next'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ConnectAccounts } from '@/components/dashboard/ConnectAccounts'
import { MessageStream } from '@/components/dashboard/MessageStream'
import { PageTransition, StaggeredTransition } from '@/components/ui/PageTransition'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { ApiErrorBoundary } from '@/components/error/ApiErrorBoundary'
import { getUserTokens, isGmailConnected, isSlackConnected } from '@/lib/oauth-handlers'

export const metadata: Metadata = {
  title: 'Dashboard - Napoleon AI',
  description: 'Your unified message dashboard showing Gmail and Slack messages with priority sorting',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
    <ErrorBoundary>
      <DashboardLayout activeTab="dashboard">
        <PageTransition>
          <div className="space-y-8">
            {/* Connection Cards with Error Boundary */}
            <StaggeredTransition delay={0}>
              <ErrorBoundary>
                <ConnectAccounts />
              </ErrorBoundary>
            </StaggeredTransition>

            {/* Live Message Stream with API Error Boundary */}
            <StaggeredTransition delay={200}>
              <ApiErrorBoundary 
                serviceName="Message Stream"
                onRetry={() => window.location.reload()}
              >
                <MessageStream connectionStatus={connectionStatus} />
              </ApiErrorBoundary>
            </StaggeredTransition>
          </div>
        </PageTransition>
      </DashboardLayout>
    </ErrorBoundary>
  )
}