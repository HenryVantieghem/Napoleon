"use client";

import { UserButton } from "@clerk/nextjs";
import { EmailList } from "@/components/email";
import { 
  ExecutiveLayout, 
  ExecutiveContentGrid,
  ExecutiveSection,
  ExecutiveCard,
  ExecutiveDashboard,
  ExecutiveMetricCard,
  LinearButton,
  LinearCard,
  LinearBadge
} from "@/components/luxury-ui";
import { Crown, Mail, TrendingUp, Shield, Zap, Activity, BarChart3, Users, Clock } from "lucide-react";

export default function DashboardPage() {
  // Mock executive stats - Phase 2 enhanced with Stripe-grade precision
  const executiveStats = {
    totalEmails: 247,
    priorityEmails: 12,
    responseTime: "< 2h",
    executiveScore: 94
  }

  // Stripe-grade executive metrics
  const executiveMetrics = [
    {
      value: 247,
      label: "Total Communications",
      format: 'number' as const,
      change: { value: 12, period: "vs last week", direction: 'up' as const }
    },
    {
      value: 12,
      label: "Priority Threads",
      format: 'number' as const,
      change: { value: 8, period: "vs last week", direction: 'up' as const }
    },
    {
      value: 1.2,
      label: "Avg Response Time",
      format: 'time' as const,
      precision: 1,
      change: { value: 23, period: "improvement", direction: 'up' as const }
    },
    {
      value: 94,
      label: "AI Accuracy Score",
      format: 'percentage' as const,
      change: { value: 8, period: "vs last month", direction: 'up' as const }
    },
    {
      value: 142000,
      label: "Time Saved",
      format: 'currency' as const,
      change: { value: 15, period: "value generated", direction: 'up' as const }
    },
    {
      value: 89,
      label: "Executive Satisfaction",
      format: 'percentage' as const,
      change: { value: 5, period: "vs benchmark", direction: 'up' as const }
    }
  ]

  return (
    <div className="linear-professional min-h-screen">
      <ExecutiveLayout
        title="Napoleon AI"
        subtitle="Executive Intelligence Command Center"
        stats={executiveStats}
      >
        <div className="space-y-8">
          {/* Phase 2: Stripe-Grade Executive Dashboard */}
          <ExecutiveDashboard
            metrics={executiveMetrics}
            title="Executive Performance Analytics"
            subtitle="Real-time intelligence metrics with enterprise precision"
            refreshable={true}
            onRefresh={() => console.log('Refreshing executive metrics')}
          />

          <ExecutiveContentGrid>
            {/* Priority Email List - Left Column */}
            <div className="col-span-4 space-y-4">
              <LinearCard variant="elevated" padding="lg">
                <ExecutiveSection 
                  title="Priority Communications"
                  titleIcon={<Crown className="w-5 h-5" />}
                  subtitle="Gold & Silver tier executives"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      <LinearBadge variant="primary">Gold: 3</LinearBadge>
                      <LinearBadge variant="secondary">Silver: 9</LinearBadge>
                    </div>
                    <LinearButton variant="ghost" size="sm">
                      <Activity className="w-4 h-4" />
                    </LinearButton>
                  </div>
                  <EmailList maxEmails={20} />
                </ExecutiveSection>
              </LinearCard>
            </div>

            {/* Main Content Area - Center */}
            <div className="col-span-5 space-y-6">
              {/* Stripe-Grade Intelligence Overview */}
              <LinearCard variant="elevated" padding="lg">
                <ExecutiveSection
                  title="Intelligence Overview"
                  titleIcon={<BarChart3 className="w-5 h-5" />}
                  subtitle="AI-powered executive insights"
                >
                  <div className="grid grid-cols-2 gap-6">
                    <ExecutiveMetricCard
                      data={{
                        value: "1.2h",
                        label: "Response Efficiency",
                        change: { value: 23, period: "vs last week", direction: 'up' }
                      }}
                      variant="success"
                      animated={true}
                    />
                    <ExecutiveMetricCard
                      data={{
                        value: "94%",
                        label: "Priority Accuracy",
                        change: { value: 8, period: "improvement", direction: 'up' }
                      }}
                      variant="primary"
                      animated={true}
                    />
                  </div>
                </ExecutiveSection>
              </LinearCard>

              {/* Executive Communication Interface */}
              <LinearCard variant="elevated" padding="lg" className="h-96">
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-lch-primary-500/10 flex items-center justify-center mx-auto">
                      <Mail className="w-10 h-10 text-lch-primary-400" />
                    </div>
                    <div>
                      <h3 className="executive-heading text-2xl mb-2">Select Communication</h3>
                      <p className="ui-text text-text-secondary max-w-md">
                        Choose a priority email to view executive intelligence analysis with 
                        sentiment scoring, key insights, and suggested actions.
                      </p>
                    </div>
                    <LinearButton variant="primary" size="lg">
                      Launch AI Analysis
                    </LinearButton>
                  </div>
                </div>
              </LinearCard>
            </div>

            {/* Executive Actions - Right Sidebar */}
            <div className="col-span-3 space-y-4">
              {/* Linear Professional Actions */}
              <LinearCard variant="elevated" padding="md">
                <ExecutiveSection
                  title="Quick Actions"
                  titleIcon={<Zap className="w-4 h-4" />}
                >
                  <div className="space-y-3">
                    <LinearButton variant="primary" fullWidth leftIcon={<Shield className="w-4 h-4" />}>
                      Priority Filter
                    </LinearButton>
                    <LinearButton variant="secondary" fullWidth leftIcon={<TrendingUp className="w-4 h-4" />}>
                      Refresh Intelligence
                    </LinearButton>
                    <LinearButton variant="outline" fullWidth leftIcon={<Crown className="w-4 h-4" />}>
                      Executive Summary
                    </LinearButton>
                  </div>
                </ExecutiveSection>
              </LinearCard>

              {/* Executive Profile with Linear Components */}
              <LinearCard variant="elevated" padding="md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="executive-heading text-lg">Executive Profile</h3>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 border border-lch-primary-500/30 shadow-lg",
                        userButtonPopoverCard: "bg-lch-neutral-950/90 backdrop-blur-md border border-lch-neutral-700 shadow-2xl",
                        userButtonPopoverActionButton: "text-lch-neutral-50 hover:bg-lch-neutral-800 transition-colors"
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-4">
                  <ExecutiveMetricCard
                    data={{
                      value: 95,
                      label: "Response Rate",
                      format: 'percentage'
                    }}
                    size="sm"
                    variant="success"
                  />
                  <ExecutiveMetricCard
                    data={{
                      value: 88,
                      label: "Priority Accuracy",
                      format: 'percentage'
                    }}
                    size="sm"
                    variant="primary"
                  />
                  <ExecutiveMetricCard
                    data={{
                      value: 72,
                      label: "Time Saved",
                      format: 'percentage'
                    }}
                    size="sm"
                    variant="warning"
                  />
                </div>
              </LinearCard>

              {/* Executive Activity Feed */}
              <LinearCard variant="elevated" padding="md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="executive-heading text-lg flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Activity Feed
                  </h3>
                  <LinearBadge variant="primary" size="xs">Live</LinearBadge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-lch-neutral-800/50">
                    <div className="w-2 h-2 bg-lch-success-500 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">High priority email from CEO</p>
                      <p className="text-xs text-text-tertiary flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        2 minutes ago
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-lch-neutral-800/50">
                    <div className="w-2 h-2 bg-lch-primary-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">AI analysis completed</p>
                      <p className="text-xs text-text-tertiary flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        5 minutes ago
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-lch-neutral-800/50">
                    <div className="w-2 h-2 bg-lch-warning-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">Weekly report generated</p>
                      <p className="text-xs text-text-tertiary flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        1 hour ago
                      </p>
                    </div>
                  </div>
                </div>
              </LinearCard>
            </div>
          </ExecutiveContentGrid>
        </div>
      </ExecutiveLayout>
    </div>
  );
}