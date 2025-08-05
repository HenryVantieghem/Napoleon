'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Clock, Target,
  Mail, Zap, Crown, Shield, Globe, Calendar, Briefcase,
  ArrowUpRight, ArrowDownRight, Minus, RefreshCw, Download,
  Filter, Eye, MoreHorizontal, ChevronDown, ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LinearButton, LinearCard, LinearBadge } from './LinearComponents'

/**
 * Tableau-Inspired Executive Dashboard
 * Fortune 500 KPI visualization with enterprise analytics
 * Research-backed executive decision support metrics
 */

interface ExecutiveKPI {
  id: string
  title: string
  value: number | string
  unit?: string
  change: {
    value: number
    period: string
    direction: 'up' | 'down' | 'neutral'
  }
  target?: number
  benchmark?: number
  category: 'performance' | 'efficiency' | 'quality' | 'strategic'
  priority: 'critical' | 'high' | 'medium' | 'low'
  trend: number[] // Historical data points
  insight?: string
}

interface TableauDashboardProps {
  kpis: ExecutiveKPI[]
  timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year'
  onTimeframeChange: (timeframe: string) => void
  className?: string
}

export function TableauExecutiveDashboard({ 
  kpis, 
  timeframe, 
  onTimeframeChange, 
  className 
}: TableauDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [expandedKPI, setExpandedKPI] = useState<string | null>(null)

  const categories = [
    { key: 'all', label: 'All Metrics', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'performance', label: 'Performance', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'efficiency', label: 'Efficiency', icon: <Zap className="w-4 h-4" /> },
    { key: 'quality', label: 'Quality', icon: <Shield className="w-4 h-4" /> },
    { key: 'strategic', label: 'Strategic', icon: <Target className="w-4 h-4" /> }
  ]

  const timeframes = [
    { key: 'day', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'quarter', label: 'This Quarter' },
    { key: 'year', label: 'This Year' }
  ]

  const filteredKPIs = selectedCategory === 'all' 
    ? kpis 
    : kpis.filter(kpi => kpi.category === selectedCategory)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  const criticalKPIs = kpis.filter(kpi => kpi.priority === 'critical')
  const averagePerformance = kpis.reduce((acc, kpi) => {
    if (typeof kpi.value === 'number' && kpi.target) {
      return acc + (kpi.value / kpi.target) * 100
    }
    return acc
  }, 0) / kpis.filter(kpi => typeof kpi.value === 'number' && kpi.target).length

  return (
    <div className={cn('tableau-dashboard space-y-8', className)}>
      {/* Executive Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="executive-heading text-3xl mb-2">Executive Command Center</h1>
          <p className="text-text-secondary">
            Real-time Fortune 500 performance analytics • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Timeframe Selector */}
          <div className="flex items-center space-x-2">
            {timeframes.map((tf) => (
              <LinearButton
                key={tf.key}
                variant={timeframe === tf.key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onTimeframeChange(tf.key)}
              >
                {tf.label}
              </LinearButton>
            ))}
          </div>
          
          {/* Dashboard Actions */}
          <div className="flex items-center space-x-2">
            <LinearButton
              variant="ghost"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
            >
              Filter
            </LinearButton>
            <LinearButton
              variant="ghost"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export
            </LinearButton>
            <LinearButton
              variant="secondary"
              size="sm"
              loading={isRefreshing}
              onClick={handleRefresh}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </LinearButton>
          </div>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        <ExecutiveSummaryCard
          title="Overall Performance"
          value={`${Math.round(averagePerformance)}%`}
          change={{ value: 12, direction: 'up', period: 'vs last period' }}
          icon={<TrendingUp className="w-6 h-6" />}
          color="lch-success-500"
        />
        <ExecutiveSummaryCard
          title="Critical Alerts"
          value={criticalKPIs.length.toString()}
          change={{ value: 2, direction: 'down', period: 'vs yesterday' }}
          icon={<Shield className="w-6 h-6" />}
          color="lch-warning-500"
        />
        <ExecutiveSummaryCard
          title="Response Time"
          value="1.2h"
          change={{ value: 15, direction: 'up', period: 'improvement' }}
          icon={<Clock className="w-6 h-6" />}
          color="lch-primary-500"
        />
        <ExecutiveSummaryCard
          title="Team Velocity"
          value="94%"
          change={{ value: 8, direction: 'up', period: 'efficiency gain' }}
          icon={<Users className="w-6 h-6" />}
          color="lch-gold-500"
        />
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-2">
        {categories.map((category) => (
          <LinearButton
            key={category.key}
            variant={selectedCategory === category.key ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory(category.key)}
            leftIcon={category.icon}
          >
            {category.label}
          </LinearButton>
        ))}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {filteredKPIs.map((kpi, index) => (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <TableauKPICard
                kpi={kpi}
                isExpanded={expandedKPI === kpi.id}
                onToggleExpand={() => setExpandedKPI(
                  expandedKPI === kpi.id ? null : kpi.id
                )}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Executive Insights Panel */}
      <ExecutiveInsightsPanel kpis={filteredKPIs} />
    </div>
  )
}

/**
 * Executive Summary Card Component
 */
interface ExecutiveSummaryCardProps {
  title: string
  value: string
  change: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    period: string
  }
  icon: React.ReactNode
  color: string
}

function ExecutiveSummaryCard({ title, value, change, icon, color }: ExecutiveSummaryCardProps) {
  return (
    <LinearCard variant="elevated" padding="md" className="luxury-micro-hover">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center`}
             style={{ backgroundColor: `var(--${color})/0.15` }}>
          <span style={{ color: `var(--${color})` }}>
            {icon}
          </span>
        </div>
        <MoreHorizontal className="w-4 h-4 text-text-tertiary" />
      </div>
      
      <div className="space-y-2">
        <h3 className="executive-heading text-2xl">{value}</h3>
        <p className="text-text-secondary text-sm font-medium">{title}</p>
        
        <div className={cn(
          'flex items-center space-x-1 text-xs',
          change.direction === 'up' ? 'text-lch-success-500' : 
          change.direction === 'down' ? 'text-lch-danger-500' : 'text-text-tertiary'
        )}>
          {change.direction === 'up' && <ArrowUpRight className="w-3 h-3" />}
          {change.direction === 'down' && <ArrowDownRight className="w-3 h-3" />}
          {change.direction === 'neutral' && <Minus className="w-3 h-3" />}
          <span>{change.value}% {change.period}</span>
        </div>
      </div>
    </LinearCard>
  )
}

/**
 * Tableau-Style KPI Card
 */
interface TableauKPICardProps {
  kpi: ExecutiveKPI
  isExpanded: boolean
  onToggleExpand: () => void
}

function TableauKPICard({ kpi, isExpanded, onToggleExpand }: TableauKPICardProps) {
  const priorityColors = {
    critical: 'border-l-lch-danger-500 bg-lch-danger-500/5',
    high: 'border-l-lch-warning-500 bg-lch-warning-500/5',
    medium: 'border-l-lch-primary-500 bg-lch-primary-500/5',
    low: 'border-l-lch-neutral-500 bg-lch-neutral-500/5'
  }

  const categoryIcons = {
    performance: <TrendingUp className="w-4 h-4" />,
    efficiency: <Zap className="w-4 h-4" />,
    quality: <Shield className="w-4 h-4" />,
    strategic: <Target className="w-4 h-4" />
  }

  // Calculate performance vs target
  const performancePercentage = kpi.target && typeof kpi.value === 'number' 
    ? (kpi.value / kpi.target) * 100 
    : null

  return (
    <LinearCard 
      variant="elevated" 
      padding="md" 
      className={cn(
        'border-l-4 luxury-micro-hover cursor-pointer',
        priorityColors[kpi.priority]
      )}
      onClick={onToggleExpand}
    >
      <div className="space-y-4">
        {/* KPI Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {categoryIcons[kpi.category]}
            <div>
              <h3 className="executive-heading text-lg">{kpi.title}</h3>
              <LinearBadge variant="ghost" size="xs">
                {kpi.category}
              </LinearBadge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <LinearBadge 
              variant={kpi.priority === 'critical' ? 'destructive' : 'secondary'} 
              size="xs"
            >
              {kpi.priority}
            </LinearBadge>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {/* KPI Value */}
        <div className="space-y-2">
          <div className="flex items-end space-x-2">
            <span className="executive-heading text-3xl">
              {kpi.value}
            </span>
            {kpi.unit && (
              <span className="text-text-secondary text-sm pb-1">{kpi.unit}</span>
            )}
          </div>
          
          {/* Change Indicator */}
          <div className={cn(
            'flex items-center space-x-1 text-sm',
            kpi.change.direction === 'up' ? 'text-lch-success-500' : 
            kpi.change.direction === 'down' ? 'text-lch-danger-500' : 'text-text-tertiary'
          )}>
            {kpi.change.direction === 'up' && <TrendingUp className="w-4 h-4" />}
            {kpi.change.direction === 'down' && <TrendingDown className="w-4 h-4" />}
            {kpi.change.direction === 'neutral' && <Minus className="w-4 h-4" />}
            <span>{kpi.change.value}% {kpi.change.period}</span>
          </div>
        </div>

        {/* Performance Bar */}
        {performancePercentage && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <span>vs Target</span>
              <span>{Math.round(performancePercentage)}%</span>
            </div>
            <div className="w-full bg-lch-neutral-700 rounded-full h-2">
              <motion.div
                className={cn(
                  'h-2 rounded-full',
                  performancePercentage >= 100 ? 'bg-lch-success-500' :
                  performancePercentage >= 80 ? 'bg-lch-warning-500' : 'bg-lch-danger-500'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(performancePercentage, 100)}%` }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
        )}

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 pt-4 border-t border-lch-neutral-700"
            >
              {/* Mini Trend Chart */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-text-primary">Trend Analysis</h4>
                <TrendChart data={kpi.trend} />
              </div>

              {/* Benchmark Comparison */}
              {kpi.benchmark && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-text-primary">Benchmark</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Industry Average</span>
                    <span className="text-text-primary font-medium">{kpi.benchmark}{kpi.unit}</span>
                  </div>
                </div>
              )}

              {/* Executive Insight */}
              {kpi.insight && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-text-primary">Executive Insight</h4>
                  <p className="text-sm text-text-secondary">{kpi.insight}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LinearCard>
  )
}

/**
 * Mini Trend Chart Component
 */
function TrendChart({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - ((value - min) / range) * 100
  }))

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  return (
    <div className="w-full h-12 bg-lch-neutral-800 rounded-lg p-2">
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible">
        <motion.path
          d={pathData}
          stroke="var(--lch-primary-500)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
        />
        {points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="1.5"
            fill="var(--lch-primary-400)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          />
        ))}
      </svg>
    </div>
  )
}

/**
 * Executive Insights Panel
 */
function ExecutiveInsightsPanel({ kpis }: { kpis: ExecutiveKPI[] }) {
  const criticalKPIs = kpis.filter(kpi => kpi.priority === 'critical')
  const improvingKPIs = kpis.filter(kpi => kpi.change.direction === 'up')
  const decliningKPIs = kpis.filter(kpi => kpi.change.direction === 'down')

  return (
    <LinearCard variant="elevated" padding="lg" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="executive-heading text-xl">Executive Insights</h2>
        <LinearBadge variant="primary">AI-Powered</LinearBadge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Critical Items */}
        <div className="space-y-3">
          <h3 className="font-semibold text-text-primary flex items-center space-x-2">
            <Shield className="w-4 h-4 text-lch-danger-500" />
            <span>Critical Attention ({criticalKPIs.length})</span>
          </h3>
          <div className="space-y-2">
            {criticalKPIs.slice(0, 3).map((kpi) => (
              <div key={kpi.id} className="p-2 bg-lch-danger-500/10 rounded-lg border border-lch-danger-500/20">
                <p className="text-sm font-medium text-text-primary">{kpi.title}</p>
                <p className="text-xs text-text-secondary">{kpi.insight || 'Requires immediate attention'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Improving Metrics */}
        <div className="space-y-3">
          <h3 className="font-semibold text-text-primary flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-lch-success-500" />
            <span>Improving Trends ({improvingKPIs.length})</span>
          </h3>
          <div className="space-y-2">
            {improvingKPIs.slice(0, 3).map((kpi) => (
              <div key={kpi.id} className="p-2 bg-lch-success-500/10 rounded-lg border border-lch-success-500/20">
                <p className="text-sm font-medium text-text-primary">{kpi.title}</p>
                <p className="text-xs text-text-secondary">
                  +{kpi.change.value}% {kpi.change.period}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Declining Metrics */}
        <div className="space-y-3">
          <h3 className="font-semibold text-text-primary flex items-center space-x-2">
            <TrendingDown className="w-4 h-4 text-lch-warning-500" />
            <span>Watch Areas ({decliningKPIs.length})</span>
          </h3>
          <div className="space-y-2">
            {decliningKPIs.slice(0, 3).map((kpi) => (
              <div key={kpi.id} className="p-2 bg-lch-warning-500/10 rounded-lg border border-lch-warning-500/20">
                <p className="text-sm font-medium text-text-primary">{kpi.title}</p>
                <p className="text-xs text-text-secondary">
                  -{kpi.change.value}% {kpi.change.period}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LinearCard>
  )
}