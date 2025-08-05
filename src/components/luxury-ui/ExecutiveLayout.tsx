'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Crown, Shield, Zap, TrendingUp } from 'lucide-react'

interface ExecutiveLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  stats?: {
    totalEmails: number
    priorityEmails: number
    responseTime: string
    executiveScore: number
  }
}

/**
 * Tesla-Inspired Executive Layout Component
 * Implements 17" touchscreen approach with executive hierarchy
 * F-pattern layout optimized for C-suite attention patterns
 */
export function ExecutiveLayout({ 
  children, 
  title = "Napoleon AI", 
  subtitle = "Executive Intelligence Command Center",
  stats 
}: ExecutiveLayoutProps) {
  return (
    <div className="tesla-touchscreen min-h-screen bg-gradient-to-b from-navy-deep to-slate-900">
      {/* Executive Command Header - High-Value Real Estate */}
      <motion.header 
        className="executive-priority-zone border-b border-glass-white-subtle"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="flex items-center justify-between w-full">
          {/* Executive Branding - Left Side (F-Pattern Start) */}
          <div className="flex items-center space-x-6">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <Crown className="w-8 h-8 text-imperial-gold" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orbital-blue rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="napoleon-branding text-2xl">{title}</h1>
                <p className="ui-text text-sm text-gray-300">{subtitle}</p>
              </div>
            </motion.div>
          </div>

          {/* Executive Stats Dashboard - Right Side (F-Pattern Scan) */}
          {stats && (
            <motion.div 
              className="flex items-center space-x-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <StatCard
                icon={<Shield className="w-5 h-5" />}
                label="Total"
                value={stats.totalEmails.toString()}
                color="text-gray-300"
              />
              <StatCard
                icon={<Crown className="w-5 h-5" />}
                label="Priority"
                value={stats.priorityEmails.toString()}
                color="text-imperial-gold"
              />
              <StatCard
                icon={<Zap className="w-5 h-5" />}
                label="Response"
                value={stats.responseTime}
                color="text-orbital-blue"
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Score"
                value={`${stats.executiveScore}%`}
                color="text-emerald-400"
              />
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Main Executive Content Area - F-Pattern Layout */}
      <motion.main 
        className="f-pattern-layout p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {children}
      </motion.main>
    </div>
  )
}

/**
 * Executive Stat Card Component
 * Tesla minimalist approach with luxury materials
 */
function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <motion.div 
      className="liquid-glass-subtle p-4 rounded-xl executive-touch min-w-[80px]"
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 8px 32px rgba(255, 255, 255, 0.1)"
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center space-x-2 mb-1">
        <span className={color}>{icon}</span>
        <span className="ui-text-medium text-xs text-gray-400 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className={`executive-heading text-lg ${color}`}>
        {value}
      </div>
    </motion.div>
  )
}

/**
 * Executive Content Grid
 * Implements F-pattern with priority zones
 */
export function ExecutiveContentGrid({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={`grid grid-cols-12 gap-6 h-full ${className}`}>
      {/* Priority Email List - Left Column (F-Pattern First Scan) */}
      <motion.div 
        className="col-span-4 space-y-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="liquid-glass p-6 rounded-2xl h-full">
          <h2 className="executive-heading text-xl mb-4 flex items-center space-x-2">
            <Crown className="w-5 h-5 text-imperial-gold" />
            <span>Priority Communications</span>
          </h2>
          <div className="space-y-3">
            {/* Priority content will be injected here */}
            {children}
          </div>
        </div>
      </motion.div>

      {/* Main Content Area - Center (F-Pattern Deep Read) */}
      <motion.div 
        className="col-span-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <div className="liquid-glass-strong p-8 rounded-2xl h-full">
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <Crown className="w-16 h-16 text-imperial-gold mx-auto opacity-50" />
              <h3 className="executive-heading text-2xl">Select Communication</h3>
              <p className="ui-text text-gray-400">
                Choose a priority email to view executive intelligence analysis
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Executive Actions - Right Sidebar (F-Pattern Quick Actions) */}
      <motion.div 
        className="col-span-3 space-y-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <div className="liquid-glass p-6 rounded-2xl">
          <h3 className="executive-heading text-lg mb-4 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-orbital-blue" />
            <span>Quick Actions</span>
          </h3>
          <div className="space-y-3">
            <ExecutiveActionButton 
              icon={<Shield className="w-4 h-4" />}
              label="Priority Filter"
              description="Gold/Silver only"
            />
            <ExecutiveActionButton 
              icon={<TrendingUp className="w-4 h-4" />}
              label="Intelligence Refresh"
              description="Update analysis"
            />
            <ExecutiveActionButton 
              icon={<Crown className="w-4 h-4" />}
              label="Executive Summary"
              description="Daily briefing"
            />
          </div>
        </div>

        {/* Executive Performance Metrics */}
        <div className="liquid-glass p-6 rounded-2xl">
          <h3 className="executive-heading text-lg mb-4">Performance</h3>
          <div className="space-y-4">
            <MetricBar label="Response Rate" value={95} color="emerald" />
            <MetricBar label="Priority Accuracy" value={88} color="blue" />
            <MetricBar label="Time Saved" value={72} color="amber" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Executive Action Button
 * Tesla two-button philosophy with luxury materials
 */
function ExecutiveActionButton({ 
  icon, 
  label, 
  description,
  onClick 
}: {
  icon: React.ReactNode
  label: string
  description: string
  onClick?: () => void
}) {
  return (
    <motion.button
      className="tesla-button-secondary w-full p-3 text-left group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <span className="text-orbital-blue group-hover:text-white transition-colors">
          {icon}
        </span>
        <div>
          <div className="ui-text-semibold text-sm">{label}</div>
          <div className="ui-text text-xs text-gray-400">{description}</div>
        </div>
      </div>
    </motion.button>
  )
}

/**
 * Executive Metric Bar
 * Visual performance indicators with luxury styling
 */
function MetricBar({ 
  label, 
  value, 
  color 
}: {
  label: string
  value: number
  color: 'emerald' | 'blue' | 'amber'
}) {
  const colorClasses = {
    emerald: 'bg-emerald-500',
    blue: 'bg-orbital-blue', 
    amber: 'bg-amber-500'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="ui-text text-sm">{label}</span>
        <span className="ui-text-semibold text-sm">{value}%</span>
      </div>
      <div className="w-full bg-glass-white-subtle rounded-full h-2">
        <motion.div 
          className={`h-2 rounded-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  )
}