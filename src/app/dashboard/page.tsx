"use client";

import { useState } from "react";
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
  LinearBadge,
  SuperhumanSplitInbox,
  ExecutiveAIAssistant,
  Fortune500Dashboard,
  TableauExecutiveDashboard
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

  // Phase 3: Superhuman Executive Intelligence Mock Data
  const mockEmails = [
    {
      id: "1",
      subject: "Board Meeting Q4 Strategy Review",
      sender: "Sarah Chen, CEO",
      snippet: "Quarterly review of strategic initiatives and market positioning for Q4 board presentation...",
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      priority: 'vip' as const,
      aiScore: 0.94,
      executiveContext: {
        category: 'board' as const,
        urgency: 'critical' as const,
        actionRequired: true,
        estimatedReadTime: 4,
        keyTopics: ['Strategy', 'Board', 'Q4 Review'],
        suggestedActions: ['Prepare presentation slides', 'Review financial metrics', 'Schedule stakeholder meetings']
      },
      metadata: {
        isRead: false,
        hasAttachments: true,
        threadLength: 3,
        lastReply: new Date(Date.now() - 600000)
      }
    },
    {
      id: "2",
      subject: "Partnership Proposal - Fortune 500 Client",
      sender: "Michael Rodriguez, VP Sales",
      snippet: "Strategic partnership opportunity with major automotive manufacturer...",
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      priority: 'team' as const,
      aiScore: 0.87,
      executiveContext: {
        category: 'strategic' as const,
        urgency: 'high' as const,
        actionRequired: true,
        estimatedReadTime: 6,
        keyTopics: ['Partnership', 'Sales', 'Strategy'],
        suggestedActions: ['Review proposal terms', 'Schedule legal review', 'Analyze market impact']
      },
      metadata: {
        isRead: false,
        hasAttachments: true,
        threadLength: 1
      }
    },
    {
      id: "3",
      subject: "AI Model Performance Report",
      sender: "DataScience Team",
      snippet: "Weekly performance metrics and optimization recommendations...",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      priority: 'tools' as const,
      aiScore: 0.72,
      executiveContext: {
        category: 'operational' as const,
        urgency: 'medium' as const,
        actionRequired: false,
        estimatedReadTime: 3,
        keyTopics: ['AI Performance', 'Analytics'],
        suggestedActions: ['Review metrics', 'Approve optimizations']
      },
      metadata: {
        isRead: true,
        hasAttachments: false,
        threadLength: 1
      }
    }
  ]

  // Phase 4: Fortune 500 Executive Metrics
  const fortune500Metrics = {
    emailVelocity: 42,
    responseTime: 1.2,
    priorityAccuracy: 94,
    teamProductivity: 87,
    decisionSpeed: 92,
    stakeholderSatisfaction: 89
  }

  // Phase 4: Tableau KPI Data
  const tableauKPIs = [
    {
      id: "kpi-1",
      title: "Executive Response Rate",
      value: 94,
      unit: "%",
      change: { value: 12, period: "vs last quarter", direction: 'up' as const },
      target: 95,
      benchmark: 85,
      category: 'performance' as const,
      priority: 'high' as const,
      trend: [78, 82, 85, 89, 91, 94],
      insight: "Response rate improved significantly due to AI prioritization"
    },
    {
      id: "kpi-2", 
      title: "Decision Velocity",
      value: 2.1,
      unit: "days",
      change: { value: 18, period: "faster than target", direction: 'up' as const },
      target: 3.0,
      benchmark: 4.2,
      category: 'efficiency' as const,
      priority: 'critical' as const,
      trend: [4.5, 3.8, 3.2, 2.8, 2.4, 2.1],
      insight: "Executive decision speed outpacing industry benchmarks"
    },
    {
      id: "kpi-3",
      title: "Stakeholder Satisfaction",
      value: 89,
      unit: "%",
      change: { value: 5, period: "vs last survey", direction: 'up' as const },
      target: 90,
      benchmark: 82,
      category: 'quality' as const,
      priority: 'medium' as const,
      trend: [81, 83, 85, 87, 88, 89],
      insight: "Consistent improvement in stakeholder communication quality"
    }
  ]

  // State management for Phase 3 & 4 integration
  const [selectedEmail, setSelectedEmail] = useState(mockEmails[0])
  const [tableauTimeframe, setTableauTimeframe] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month')
  
  const handleEmailSelect = (email: typeof mockEmails[0]) => {
    setSelectedEmail(email)
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
          {/* Phase 4: Tableau Executive Dashboard */}
          <TableauExecutiveDashboard
            kpis={tableauKPIs}
            timeframe={tableauTimeframe}
            onTimeframeChange={(timeframe) => setTableauTimeframe(timeframe as 'day' | 'week' | 'month' | 'quarter' | 'year')}
            className="award-winning-luxury"
          />

          {/* Phase 4: Fortune 500 Executive KPIs */}
          <Fortune500Dashboard
            executiveMetrics={fortune500Metrics}
            className="luxury-glass-depth-2 luxury-micro-hover"
          />

          {/* Phase 2: Stripe-Grade Executive Dashboard */}
          <ExecutiveDashboard
            metrics={executiveMetrics}
            title="Executive Performance Analytics"
            subtitle="Real-time intelligence metrics with enterprise precision"
            refreshable={true}
            onRefresh={() => console.log('Refreshing executive metrics')}
          />

          <ExecutiveContentGrid>
            {/* Phase 3: Superhuman Split Inbox - Left Column */}
            <div className="col-span-4 space-y-4">
              <LinearCard variant="elevated" padding="lg" className="luxury-glass-depth-3">
                <ExecutiveSection 
                  title="Superhuman Intelligence"
                  titleIcon={<Crown className="w-5 h-5" />}
                  subtitle="AI-powered executive email triage"
                >
                  <SuperhumanSplitInbox
                    emails={mockEmails}
                    onEmailSelect={handleEmailSelect}
                    className="executive-email-hover"
                  />
                </ExecutiveSection>
              </LinearCard>
            </div>

            {/* Phase 3: AI Assistant - Center */}
            <div className="col-span-5 space-y-6">
              <ExecutiveAIAssistant
                selectedEmail={selectedEmail}
                className="luxury-glass-depth-2 award-button"
              />

              {/* Executive Communication Interface */}
              <LinearCard variant="elevated" padding="lg" className="h-96 luxury-glass-depth-1">
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-lch-primary-500/10 flex items-center justify-center mx-auto luxury-micro-hover">
                      <Mail className="w-10 h-10 text-lch-primary-400" />
                    </div>
                    <div>
                      <h3 className="executive-heading text-2xl mb-2">Executive Intelligence Active</h3>
                      <p className="ui-text text-text-secondary max-w-md">
                        AI analysis running on {selectedEmail?.subject || 'selected communication'} with 
                        sentiment scoring, key insights, and suggested actions.
                      </p>
                    </div>
                    <LinearButton variant="primary" size="lg" className="award-button">
                      Deep Analysis Complete
                    </LinearButton>
                  </div>
                </div>
              </LinearCard>
            </div>

            {/* Executive Actions - Right Sidebar */}
            <div className="col-span-3 space-y-4">
              {/* Linear Professional Actions */}
              <LinearCard variant="elevated" padding="md" className="luxury-glass-depth-1">
                <ExecutiveSection
                  title="Quick Actions"
                  titleIcon={<Zap className="w-4 h-4" />}
                >
                  <div className="space-y-3">
                    <LinearButton variant="primary" fullWidth leftIcon={<Shield className="w-4 h-4" />} className="award-button">
                      Priority Filter
                    </LinearButton>
                    <LinearButton variant="secondary" fullWidth leftIcon={<TrendingUp className="w-4 h-4" />} className="award-button">
                      Refresh Intelligence
                    </LinearButton>
                    <LinearButton variant="outline" fullWidth leftIcon={<Crown className="w-4 h-4" />} className="award-button">
                      Executive Summary
                    </LinearButton>
                  </div>
                </ExecutiveSection>
              </LinearCard>

              {/* Executive Profile with Linear Components */}
              <LinearCard variant="elevated" padding="md" className="luxury-glass-depth-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="executive-heading text-lg">Executive Profile</h3>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 border border-lch-primary-500/30 shadow-lg luxury-micro-hover",
                        userButtonPopoverCard: "bg-lch-neutral-950/90 backdrop-blur-md border border-lch-neutral-700 shadow-2xl luxury-glass-depth-4",
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
                    className="luxury-micro-hover"
                  />
                  <ExecutiveMetricCard
                    data={{
                      value: 88,
                      label: "Priority Accuracy",
                      format: 'percentage'
                    }}
                    size="sm"
                    variant="primary"
                    className="luxury-micro-hover"
                  />
                  <ExecutiveMetricCard
                    data={{
                      value: 72,
                      label: "Time Saved",
                      format: 'percentage'
                    }}
                    size="sm"
                    variant="warning"
                    className="luxury-micro-hover"
                  />
                </div>
              </LinearCard>

              {/* Executive Activity Feed */}
              <LinearCard variant="elevated" padding="md" className="luxury-glass-depth-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="executive-heading text-lg flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Activity Feed
                  </h3>
                  <LinearBadge variant="primary" size="xs">Live</LinearBadge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-lch-neutral-800/50 executive-email-hover">
                    <div className="w-2 h-2 bg-lch-success-500 rounded-full animate-pulse executive-metric-animation" />
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">High priority email from CEO</p>
                      <p className="text-xs text-text-tertiary flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        2 minutes ago
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-lch-neutral-800/50 executive-email-hover">
                    <div className="w-2 h-2 bg-lch-primary-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">AI analysis completed</p>
                      <p className="text-xs text-text-tertiary flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        5 minutes ago
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-lch-neutral-800/50 executive-email-hover">
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