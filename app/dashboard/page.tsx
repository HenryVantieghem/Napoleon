import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { Metadata, Viewport } from 'next'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ConnectAccounts } from '@/components/dashboard/ConnectAccounts'
import { UnifiedFeed } from '@/components/dashboard/UnifiedFeed'
import { PageTransition, StaggeredTransition } from '@/components/ui/PageTransition'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { ApiErrorBoundary } from '@/components/error/ApiErrorBoundary'
import { getUserConnections, isGmailConnected, isSlackConnected } from '@/lib/nango-handlers'

export const metadata: Metadata = {
  title: 'Dashboard - Napoleon AI',
  description: 'Your unified message dashboard showing Gmail and Slack messages with priority sorting',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default async function DashboardPage() {
  const supabase = getSupabaseServerClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Backfill user profile if it doesn't exist
  await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null
    }, {
      onConflict: 'id'
    })

  // Get user's connection status
  const connections = await getUserConnections(user.id)
  const connectionStatus = {
    gmail: isGmailConnected(connections),
    slack: isSlackConnected(connections)
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

            {/* Unified Message Feed with API Error Boundary */}
            <StaggeredTransition delay={200}>
              <ApiErrorBoundary 
                serviceName="Unified Message Feed"
                onRetry={() => window.location.reload()}
              >
                <UnifiedFeed 
                  className="col-span-full"
                  maxHeight="h-[600px]"
                  showStats={true}
                  autoRefresh={true}
                />
              </ApiErrorBoundary>
            </StaggeredTransition>
          </div>
        </PageTransition>
      </DashboardLayout>
    </ErrorBoundary>
  )
}