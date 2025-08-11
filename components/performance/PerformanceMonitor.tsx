'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useCachePerformance } from '@/hooks/useMessageQueries'
import { queryMetrics } from '@/lib/react-query-client'
import { Activity, Zap, Database, Clock, Cpu, Memory, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
  
  // Application Performance
  renderTime?: number
  apiResponseTime?: number
  cacheHitRate?: number
  memoryUsage?: number
  
  // Network Performance
  connectionType?: string
  downlink?: number
  rtt?: number
}

interface PerformanceMonitorProps {
  isVisible?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  compact?: boolean
}

export function PerformanceMonitor({ 
  isVisible = true, 
  position = 'bottom-left',
  compact = true 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const [isExpanded, setIsExpanded] = useState(false)
  const [performanceScore, setPerformanceScore] = useState(0)
  
  // Get cache performance from React Query
  const { 
    data: cacheData, 
    isLoading: cacheLoading 
  } = useCachePerformance({ 
    enabled: isVisible 
  })

  // Measure Core Web Vitals
  const measureCoreWebVitals = useCallback(() => {
    if (typeof window === 'undefined') return

    // Get navigation timing
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navTiming) {
      setMetrics(prev => ({
        ...prev,
        ttfb: navTiming.responseStart - navTiming.requestStart,
        fcp: navTiming.loadEventEnd - navTiming.navigationStart,
        renderTime: navTiming.loadEventEnd - navTiming.domContentLoadedEventStart
      }))
    }

    // Measure LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
        })
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        console.warn('LCP measurement not supported')
      }

      // Measure FID (First Input Delay)
      try {
        const observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          entries.forEach(entry => {
            setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }))
          })
        })
        observer.observe({ entryTypes: ['first-input'] })
      } catch (e) {
        console.warn('FID measurement not supported')
      }

      // Measure CLS (Cumulative Layout Shift)
      try {
        let clsValue = 0
        const observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          entries.forEach(entry => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
              setMetrics(prev => ({ ...prev, cls: clsValue }))
            }
          })
        })
        observer.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        console.warn('CLS measurement not supported')
      }
    }
  }, [])

  // Measure memory usage
  const measureMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / 1048576 // Convert to MB
      }))
    }
  }, [])

  // Measure network information
  const measureNetworkInfo = useCallback(() => {
    if (typeof window !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection
      setMetrics(prev => ({
        ...prev,
        connectionType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      }))
    }
  }, [])

  // Calculate performance score
  const calculatePerformanceScore = useCallback(() => {
    let score = 100

    // LCP scoring (0-2.5s = good, 2.5-4s = needs improvement, >4s = poor)
    if (metrics.lcp) {
      if (metrics.lcp > 4000) score -= 30
      else if (metrics.lcp > 2500) score -= 15
    }

    // FID scoring (0-100ms = good, 100-300ms = needs improvement, >300ms = poor)
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 25
      else if (metrics.fid > 100) score -= 10
    }

    // CLS scoring (0-0.1 = good, 0.1-0.25 = needs improvement, >0.25 = poor)
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 25
      else if (metrics.cls > 0.1) score -= 10
    }

    // Cache hit rate scoring
    if (cacheData?.overall?.hitRate) {
      if (cacheData.overall.hitRate < 50) score -= 15
      else if (cacheData.overall.hitRate < 70) score -= 5
    }

    // Memory usage scoring
    if (metrics.memoryUsage && metrics.memoryUsage > 100) {
      score -= 10
    }

    setPerformanceScore(Math.max(0, score))
  }, [metrics, cacheData])

  // Initialize monitoring
  useEffect(() => {
    if (!isVisible) return

    measureCoreWebVitals()
    measureMemoryUsage()
    measureNetworkInfo()

    // Update metrics periodically
    const interval = setInterval(() => {
      measureMemoryUsage()
      measureNetworkInfo()
    }, 5000)

    return () => clearInterval(interval)
  }, [isVisible, measureCoreWebVitals, measureMemoryUsage, measureNetworkInfo])

  // Calculate performance score when metrics change
  useEffect(() => {
    calculatePerformanceScore()
  }, [calculatePerformanceScore])

  // Get React Query metrics
  const reactQueryStats = useMemo(() => {
    try {
      return queryMetrics.getQueryStats()
    } catch {
      return null
    }
  }, [])

  if (!isVisible || (compact && !isExpanded)) {
    return (
      <div
        className={`fixed ${getPositionClasses(position)} z-50 transition-all duration-200`}
        onClick={() => setIsExpanded(true)}
      >
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getScoreColor(performanceScore)}`}></div>
            <span className="text-xs font-medium text-gray-700">{performanceScore}</span>
            <Activity className="w-3 h-3 text-gray-500" />
          </div>
        </div>
      </div>
    )
  }

  if (!isExpanded && compact) return null

  return (
    <div className={`fixed ${getPositionClasses(position)} z-50 transition-all duration-300`}>
      <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-2xl p-4 max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Performance Monitor</h3>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="sr-only">Minimize</span>
            <div className="w-4 h-4">−</div>
          </button>
        </div>

        {/* Overall Score */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{performanceScore}</div>
              <div className="text-sm text-gray-600">Performance Score</div>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreBackground(performanceScore)}`}>
              {performanceScore >= 90 ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : performanceScore >= 70 ? (
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* Core Web Vitals */}
        <div className="space-y-3 mb-4">
          <h4 className="font-medium text-gray-900 text-sm">Core Web Vitals</h4>
          
          {metrics.lcp && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">LCP</span>
              </div>
              <div className={`text-sm font-medium ${getVitalColor(metrics.lcp, 'lcp')}`}>
                {(metrics.lcp / 1000).toFixed(1)}s
              </div>
            </div>
          )}

          {metrics.fid && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">FID</span>
              </div>
              <div className={`text-sm font-medium ${getVitalColor(metrics.fid, 'fid')}`}>
                {metrics.fid.toFixed(0)}ms
              </div>
            </div>
          )}

          {metrics.cls && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">CLS</span>
              </div>
              <div className={`text-sm font-medium ${getVitalColor(metrics.cls, 'cls')}`}>
                {metrics.cls.toFixed(3)}
              </div>
            </div>
          )}
        </div>

        {/* Application Metrics */}
        <div className="space-y-3 mb-4">
          <h4 className="font-medium text-gray-900 text-sm">Application Performance</h4>
          
          {cacheData && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Cache Hit Rate</span>
              </div>
              <div className={`text-sm font-medium ${cacheData.overall.hitRate > 70 ? 'text-green-600' : cacheData.overall.hitRate > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {cacheData.overall.hitRate.toFixed(1)}%
              </div>
            </div>
          )}

          {metrics.memoryUsage && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Memory className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Memory Usage</span>
              </div>
              <div className={`text-sm font-medium ${metrics.memoryUsage < 50 ? 'text-green-600' : metrics.memoryUsage < 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                {metrics.memoryUsage.toFixed(1)}MB
              </div>
            </div>
          )}

          {reactQueryStats && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Active Queries</span>
              </div>
              <div className="text-sm font-medium text-gray-700">
                {reactQueryStats.activeQueries}/{reactQueryStats.totalQueries}
              </div>
            </div>
          )}
        </div>

        {/* Network Information */}
        {metrics.connectionType && (
          <div className="pt-3 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 text-sm mb-2">Network</h4>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{metrics.connectionType?.toUpperCase()}</span>
              {metrics.downlink && <span>{metrics.downlink}Mbps</span>}
              {metrics.rtt && <span>{metrics.rtt}ms RTT</span>}
            </div>
          </div>
        )}

        {/* Development Mode Indicator */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              🔧 Development Mode
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions
function getPositionClasses(position: string): string {
  switch (position) {
    case 'top-right':
      return 'top-4 right-4'
    case 'top-left':
      return 'top-4 left-4'
    case 'bottom-right':
      return 'bottom-4 right-4'
    case 'bottom-left':
      return 'bottom-4 left-4'
    default:
      return 'bottom-4 left-4'
  }
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'bg-green-500'
  if (score >= 70) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getScoreBackground(score: number): string {
  if (score >= 90) return 'bg-green-100'
  if (score >= 70) return 'bg-yellow-100'
  return 'bg-red-100'
}

function getVitalColor(value: number, type: 'lcp' | 'fid' | 'cls'): string {
  switch (type) {
    case 'lcp':
      if (value <= 2500) return 'text-green-600'
      if (value <= 4000) return 'text-yellow-600'
      return 'text-red-600'
    case 'fid':
      if (value <= 100) return 'text-green-600'
      if (value <= 300) return 'text-yellow-600'
      return 'text-red-600'
    case 'cls':
      if (value <= 0.1) return 'text-green-600'
      if (value <= 0.25) return 'text-yellow-600'
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export default PerformanceMonitor