"use client";

import { UserButton } from "@clerk/nextjs";
import { EmailList } from "@/components/email";
import { 
  ExecutiveLayout, 
  ExecutiveContentGrid,
  NapoleonTitle,
  ExecutiveSection,
  ExecutiveCard
} from "@/components/luxury-ui";
import { Crown, Mail, TrendingUp, Shield, Zap } from "lucide-react";

export default function DashboardPage() {
  // Mock executive stats - in production, these would come from real data
  const executiveStats = {
    totalEmails: 247,
    priorityEmails: 12,
    responseTime: "< 2h",
    executiveScore: 94
  }

  return (
    <ExecutiveLayout
      title="Napoleon AI"
      subtitle="Executive Intelligence Command Center"
      stats={executiveStats}
    >
      <ExecutiveContentGrid>
        {/* Priority Email List - Left Column */}
        <div className="col-span-4 space-y-4">
          <ExecutiveSection 
            title="Priority Communications"
            titleIcon={<Crown className="w-5 h-5" />}
            subtitle="Gold & Silver tier executives"
          >
            <EmailList maxEmails={20} />
          </ExecutiveSection>
        </div>

        {/* Main Content Area - Center */}
        <div className="col-span-5 space-y-6">
          <ExecutiveSection
            title="Intelligence Overview"
            titleIcon={<TrendingUp className="w-5 h-5" />}
            subtitle="Executive performance dashboard"
          >
            <div className="grid grid-cols-2 gap-4">
              <ExecutiveCard
                title="Response Efficiency"
                description="Average executive response time"
                priority="gold"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-imperial-gold">1.2h</span>
                  <div className="text-emerald-400 text-sm">↑ 23%</div>
                </div>
              </ExecutiveCard>

              <ExecutiveCard
                title="Priority Accuracy"
                description="AI classification precision"
                priority="silver"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-200">94%</span>
                  <div className="text-emerald-400 text-sm">↑ 8%</div>
                </div>
              </ExecutiveCard>
            </div>
          </ExecutiveSection>

          {/* Email Detail View Placeholder */}
          <div className="liquid-glass-strong p-8 rounded-2xl h-96">
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <Mail className="w-16 h-16 text-imperial-gold mx-auto opacity-50" />
                <h3 className="executive-heading text-2xl">Select Communication</h3>
                <p className="ui-text text-gray-400 max-w-md">
                  Choose a priority email to view executive intelligence analysis with 
                  sentiment scoring, key insights, and suggested actions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Actions - Right Sidebar */}
        <div className="col-span-3 space-y-4">
          <ExecutiveSection
            title="Quick Actions"
            titleIcon={<Zap className="w-4 h-4" />}
          >
            <div className="space-y-3">
              <button className="tesla-button-primary w-full">
                <Shield className="w-4 h-4 inline mr-2" />
                Priority Filter
              </button>
              <button className="tesla-button-secondary w-full">
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Refresh Intelligence
              </button>
              <button className="tesla-button-secondary w-full">
                <Crown className="w-4 h-4 inline mr-2" />
                Executive Summary
              </button>
            </div>
          </ExecutiveSection>

          {/* User Profile */}
          <div className="liquid-glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="executive-heading text-lg">Executive Profile</h3>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 border border-imperial-gold/30 shadow-lg",
                    userButtonPopoverCard: "bg-navy-deep/90 backdrop-blur-md border border-glass-white/30 shadow-2xl",
                    userButtonPopoverActionButton: "text-executive-white hover:bg-glass-white-subtle transition-colors"
                  }
                }}
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="ui-text text-sm">Response Rate</span>
                  <span className="ui-text-semibold text-sm">95%</span>
                </div>
                <div className="w-full bg-glass-white-subtle rounded-full h-2">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: '95%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="ui-text text-sm">Priority Accuracy</span>
                  <span className="ui-text-semibold text-sm">88%</span>
                </div>
                <div className="w-full bg-glass-white-subtle rounded-full h-2">
                  <div className="h-2 rounded-full bg-orbital-blue" style={{ width: '88%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="ui-text text-sm">Time Saved</span>
                  <span className="ui-text-semibold text-sm">72%</span>
                </div>
                <div className="w-full bg-glass-white-subtle rounded-full h-2">
                  <div className="h-2 rounded-full bg-amber-500" style={{ width: '72%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ExecutiveContentGrid>
    </ExecutiveLayout>
  );
}