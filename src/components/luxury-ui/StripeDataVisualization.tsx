'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, BarChart3, PieChart, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Stripe-Grade Data Visualization Components
 * Enterprise-reliability metrics with luxury presentation
 * Payment-grade precision and real-time updates
 */

interface MetricData {
  value: number | string
  label: string
  change?: {
    value: number
    period: string
    direction: 'up' | 'down' | 'neutral'
  }
  format?: 'number' | 'currency' | 'percentage' | 'time'
  precision?: number
}

interface ChartDataPoint {
  timestamp: number
  value: number
  label?: string
}

interface ExecutiveMetricCardProps {
  data: MetricData
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  loading?: boolean
  className?: string
}

/**
 * Executive Metric Card - Stripe-inspired precision
 */
export function ExecutiveMetricCard({
  data,
  variant = 'default',
  size = 'md',
  animated = true,
  loading = false,
  className = ''
}: ExecutiveMetricCardProps) {
  const [displayValue, setDisplayValue] = useState<string>('')
  
  useEffect(() => {
    if (loading) return
    
    const formattedValue = formatMetricValue(data.value, data.format, data.precision)
    
    if (animated) {
      // Animate number counting for impressive executive presentation
      animateValue(displayValue, formattedValue, setDisplayValue)
    } else {
      setDisplayValue(formattedValue)
    }
  }, [data.value, data.format, data.precision, loading, animated])

  const sizeStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const variantStyles = {
    default: 'stripe-metric-card',
    primary: 'stripe-metric-card border-lch-primary-500/30 bg-gradient-to-br from-lch-primary-950/50 to-transparent',
    success: 'stripe-metric-card border-lch-success-500/30 bg-gradient-to-br from-lch-success-950/50 to-transparent',
    warning: 'stripe-metric-card border-lch-warning-500/30 bg-gradient-to-br from-lch-warning-950/50 to-transparent',
    danger: 'stripe-metric-card border-lch-danger-500/30 bg-gradient-to-br from-lch-danger-950/50 to-transparent'
  }

  const valueSize = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  }

  return (
    <motion.div
      className={cn(variantStyles[variant], sizeStyles[size], className)}
      initial={animated ? { opacity: 0, y: 20 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      {loading ? (
        <ExecutiveMetricSkeleton size={size} />
      ) : (
        <>
          <div className={cn('stripe-metric-value', valueSize[size])}>
            {displayValue}
          </div>
          
          <div className="stripe-metric-label">
            {data.label}
          </div>
          
          {data.change && (
            <motion.div 
              className={cn(
                'stripe-metric-change',
                data.change.direction === 'up' && 'positive',
                data.change.direction === 'down' && 'negative',
                data.change.direction === 'neutral' && 'neutral'
              )}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              {data.change.direction === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
              {data.change.direction === 'down' && <TrendingDown className="w-4 h-4 mr-1" />}
              {data.change.direction === 'neutral' && <Minus className="w-4 h-4 mr-1" />}
              
              <span>
                {data.change.direction !== 'neutral' && (
                  <>
                    {Math.abs(data.change.value)}%
                  </>
                )}
                <span className="text-text-tertiary ml-1">
                  {data.change.period}
                </span>
              </span>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}

/**
 * Executive Dashboard Grid - Stripe-grade layout
 */
interface ExecutiveDashboardProps {
  metrics: MetricData[]
  title?: string
  subtitle?: string
  refreshable?: boolean
  onRefresh?: () => void
  loading?: boolean
  className?: string
}

export function ExecutiveDashboard({
  metrics,
  title = "Executive Metrics",
  subtitle,
  refreshable = true,
  onRefresh,
  loading = false,
  className = ''
}: ExecutiveDashboardProps) {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
      setLastRefresh(new Date())
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="executive-heading text-2xl">{title}</h2>
          {subtitle && (
            <p className="ui-text text-text-secondary mt-1">{subtitle}</p>
          )}
        </div>
        
        {refreshable && (
          <motion.button
            onClick={handleRefresh}
            className="linear-button-secondary flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            <Activity className={cn('w-4 h-4', loading && 'animate-spin')} />
            <span>Refresh</span>
          </motion.button>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="wait">
          {metrics.map((metric, index) => (
            <motion.div
              key={`${metric.label}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <ExecutiveMetricCard
                data={metric}
                loading={loading}
                variant={getMetricVariant(metric)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Last Updated */}
      <div className="flex justify-end">
        <p className="ui-text text-xs text-text-muted">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}

/**
 * Executive Chart Component - Real-time visualization
 */
interface ExecutiveChartProps {
  data: ChartDataPoint[]
  title: string
  type: 'line' | 'bar' | 'area'
  height?: number
  animated?: boolean
  showGrid?: boolean
  className?: string
}

export function ExecutiveChart({
  data,
  title,
  type = 'line',
  height = 300,
  animated = true,
  showGrid = true,
  className = ''
}: ExecutiveChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    if (animated) {
      // Animate chart data loading
      const timer = setTimeout(() => {
        setChartData(data)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setChartData(data)
    }
  }, [data, animated])

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue

  return (
    <div className={cn('linear-card', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="executive-heading text-lg">{title}</h3>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-text-tertiary" />
          <PieChart className="w-4 h-4 text-text-tertiary" />
        </div>
      </div>

      <div className="relative" style={{ height }}>
        {/* Chart implementation would go here */}
        {/* This is a simplified representation - in production, use a library like Recharts or D3 */}
        <svg
          width="100%"
          height="100%"
          className="overflow-visible"
        >
          {showGrid && (
            <g className="opacity-20">
              {/* Grid lines */}
              {[...Array(5)].map((_, i) => (
                <line
                  key={`grid-${i}`}
                  x1="0"
                  y1={`${(i / 4) * 100}%`}
                  x2="100%"
                  y2={`${(i / 4) * 100}%`}
                  stroke="currentColor"
                  strokeWidth="1"
                />
              ))}
            </g>
          )}
          
          {/* Chart visualization */}
          {type === 'line' && (
            <motion.path
              d={generateLinePath(chartData, maxValue, minValue)}
              stroke="var(--lch-primary-500)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
            />
          )}
        </svg>

        {/* Data points overlay */}
        <div className="absolute inset-0 flex items-end justify-between px-2">
          {chartData.map((point, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center"
              initial={animated ? { opacity: 0, y: 10 } : undefined}
              animate={animated ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <div className="w-2 h-2 bg-lch-primary-500 rounded-full mb-1" />
              <span className="text-xs text-text-tertiary">
                {point.value}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Loading Skeleton for Metrics
 */
function ExecutiveMetricSkeleton({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const skeletonHeight = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10'
  }

  return (
    <div className="animate-pulse space-y-3">
      <div className={cn('bg-lch-neutral-700 rounded', skeletonHeight[size])} />
      <div className="h-4 bg-lch-neutral-700 rounded w-3/4" />
      <div className="h-3 bg-lch-neutral-700 rounded w-1/2" />
    </div>
  )
}

/**
 * Utility Functions
 */
function formatMetricValue(
  value: number | string, 
  format: MetricData['format'] = 'number', 
  precision: number = 0
): string {
  if (typeof value === 'string') return value

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
      }).format(value)
    
    case 'percentage':
      return `${value.toFixed(precision)}%`
    
    case 'time':
      return `${value}${precision === 0 ? 's' : 'ms'}`
    
    default:
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
      }).format(value)
  }
}

function animateValue(
  start: string, 
  end: string, 
  setter: (value: string) => void,
  duration: number = 1000
) {
  const startNum = parseFloat(start.replace(/[^0-9.-]/g, '')) || 0
  const endNum = parseFloat(end.replace(/[^0-9.-]/g, ''))
  
  if (isNaN(endNum)) {
    setter(end)
    return
  }

  const startTime = Date.now()
  const updateValue = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Easing function for smooth animation
    const easedProgress = 1 - Math.pow(1 - progress, 3)
    const currentValue = startNum + (endNum - startNum) * easedProgress
    
    setter(formatMetricValue(currentValue, 'number', 0))
    
    if (progress < 1) {
      requestAnimationFrame(updateValue)
    } else {
      setter(end)
    }
  }
  
  requestAnimationFrame(updateValue)
}

function getMetricVariant(metric: MetricData): ExecutiveMetricCardProps['variant'] {
  if (!metric.change) return 'default'
  
  if (metric.change.direction === 'up') return 'success'
  if (metric.change.direction === 'down') return 'danger'
  return 'default'
}

function generateLinePath(
  data: ChartDataPoint[], 
  max: number, 
  min: number
): string {
  if (data.length === 0) return ''
  
  const range = max - min || 1
  const width = 100 / (data.length - 1 || 1)
  
  return data
    .map((point, index) => {
      const x = index * width
      const y = 100 - ((point.value - min) / range) * 100
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}