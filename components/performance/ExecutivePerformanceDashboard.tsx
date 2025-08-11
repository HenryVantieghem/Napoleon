'use client'

import { useState, useEffect, useMemo } from 'react'
import { useCachePerformance } from '@/hooks/useMessageQueries'
import { queryMetrics } from '@/lib/react-query-client'
import { BarChart3, Clock, Database, Zap, TrendingUp, Users, Activity, CheckCircle, AlertTriangle, Target } from 'lucide-react'

interface PerformanceKPI {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  status: 'excellent' | 'good' | 'needs-attention' | 'critical'
  target?: string | number
  description: string
}

export function ExecutivePerformanceDashboard() {
  const [isVisible, setIsVisible] = useState(false)
  const { data: cacheData, isLoading } = useCachePerformance({ enabled: true })
  
  // Calculate KPIs for executive reporting
  const performanceKPIs = useMemo((): PerformanceKPI[] => {
    if (!cacheData) return []

    const kpis: PerformanceKPI[] = [
      // User Experience Metrics
      {
        label: 'System Response Time',
        value: cacheData.overall.averageResponseTime || 0,
        unit: 'ms',
        trend: cacheData.overall.averageResponseTime <= 100 ? 'stable' : 'up',
        status: cacheData.overall.averageResponseTime <= 100 ? 'excellent' : 
                cacheData.overall.averageResponseTime <= 500 ? 'good' : 
                cacheData.overall.averageResponseTime <= 1000 ? 'needs-attention' : 'critical',
        target: '< 100ms',
        description: 'Average time for system to respond to executive requests'
      },
      
      // Cache Performance
      {
        label: 'Cache Efficiency',
        value: cacheData.overall.hitRate || 0,
        unit: '%',
        trend: cacheData.overall.hitRate >= 80 ? 'up' : 'down',
        status: cacheData.overall.hitRate >= 90 ? 'excellent' :
                cacheData.overall.hitRate >= 75 ? 'good' :
                cacheData.overall.hitRate >= 50 ? 'needs-attention' : 'critical',
        target: '> 80%',
        description: 'Percentage of requests served from high-speed cache'
      },
      
      // System Health
      {
        label: 'Memory Efficiency',
        value: cacheData.memoryUsageMB || 0,
        unit: 'MB',
        trend: cacheData.memoryUsageMB <= 50 ? 'stable' : 'up',
        status: cacheData.memoryUsageMB <= 50 ? 'excellent' :
                cacheData.memoryUsageMB <= 100 ? 'good' :
                cacheData.memoryUsageMB <= 200 ? 'needs-attention' : 'critical',
        target: '< 100MB',
        description: 'Memory usage for optimal executive dashboard performance'
      },

      // Availability
      {
        label: 'System Availability',
        value: cacheData.isHealthy ? 99.9 : 95.0,
        unit: '%',
        trend: cacheData.isHealthy ? 'stable' : 'down',
        status: cacheData.isHealthy ? 'excellent' : 'needs-attention',
        target: '> 99.5%',
        description: 'System uptime ensuring executive access when needed'
      },

      // Data Freshness
      {
        label: 'Data Freshness',
        value: 5, // 5 minutes cache TTL
        unit: 'min',
        trend: 'stable',
        status: 'excellent',
        target: '< 10 min',
        description: 'How recent the displayed data is for executive decision-making'
      },

      // Request Volume
      {
        label: 'Request Volume',
        value: cacheData.overall.totalRequests || 0,
        unit: 'req/session',
        trend: 'stable',
        status: cacheData.overall.totalRequests <= 1000 ? 'excellent' : 
               cacheData.overall.totalRequests <= 5000 ? 'good' : 'needs-attention',
        target: 'Optimized',
        description: 'Number of API requests per executive session'
      }
    ]

    return kpis
  }, [cacheData])

  // Executive summary
  const executiveSummary = useMemo(() => {
    const excellentCount = performanceKPIs.filter(kpi => kpi.status === 'excellent').length
    const totalKPIs = performanceKPIs.length
    const overallScore = (excellentCount / totalKPIs) * 100

    return {
      overallScore,
      excellentCount,
      totalKPIs,
      status: overallScore >= 80 ? 'excellent' : 
              overallScore >= 60 ? 'good' : 
              overallScore >= 40 ? 'needs-attention' : 'critical',
      recommendation: overallScore >= 80 
        ? 'System performing at executive standards'
        : overallScore >= 60 
        ? 'Minor optimizations recommended' 
        : 'Performance improvements needed for optimal executive experience'
    }
  }, [performanceKPIs])

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-20 right-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        title="Open Performance Dashboard"
      >
        <BarChart3 className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Executive Performance Dashboard</h2>
              <p className="text-blue-100 mt-1">Real-time system performance metrics for Napoleon AI</p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-blue-100 hover:text-white transition-colors"
            >
              <span className="sr-only">Close</span>
              <div className="w-6 h-6 text-xl">×</div>
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {executiveSummary.overallScore.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">Overall Performance Score</div>
                </div>
                <div className={`p-3 rounded-full ${
                  executiveSummary.status === 'excellent' ? 'bg-green-100' :
                  executiveSummary.status === 'good' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  {executiveSummary.status === 'excellent' ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : executiveSummary.status === 'good' ? (
                    <TrendingUp className="w-8 h-8 text-yellow-600" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {executiveSummary.excellentCount}/{executiveSummary.totalKPIs}
                  </div>
                  <div className="text-sm text-gray-600">KPIs Meeting Targets</div>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900 mb-2">Status</div>
                  <div className="text-xs text-gray-600">{executiveSummary.recommendation}</div>
                </div>
                <div className="p-3 rounded-full bg-indigo-100">
                  <Activity className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {performanceKPIs.map((kpi, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{kpi.label}</div>
                    <div className={`p-1 rounded ${
                      kpi.status === 'excellent' ? 'bg-green-100' :
                      kpi.status === 'good' ? 'bg-yellow-100' :
                      kpi.status === 'needs-attention' ? 'bg-orange-100' : 'bg-red-100'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        kpi.status === 'excellent' ? 'bg-green-500' :
                        kpi.status === 'good' ? 'bg-yellow-500' :
                        kpi.status === 'needs-attention' ? 'bg-orange-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mb-2">
                    <div className="text-2xl font-bold text-gray-900">
                      {typeof kpi.value === 'number' ? 
                        (kpi.value % 1 === 0 ? kpi.value : kpi.value.toFixed(1)) : 
                        kpi.value}
                      {kpi.unit && <span className="text-sm font-normal text-gray-500 ml-1">{kpi.unit}</span>}
                    </div>
                    {kpi.trend && (
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        kpi.trend === 'up' ? 'bg-green-100 text-green-700' :
                        kpi.trend === 'down' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {kpi.trend === 'up' ? '↗' : kpi.trend === 'down' ? '↘' : '→'} {kpi.trend}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-600 mb-2">{kpi.description}</div>
                  
                  {kpi.target && (
                    <div className="text-xs text-blue-600 font-medium">
                      Target: {kpi.target}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Technical Details (Collapsible) */}
        <details className="p-6 border-t">
          <summary className="cursor-pointer text-lg font-semibold text-gray-900 mb-4">
            Technical Performance Details
          </summary>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cache Performance */}
            {cacheData && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  Cache Performance
                </h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(cacheData.caches).map(([name, cache]) => (
                    <div key={name} className="flex justify-between">
                      <span className="text-gray-600">{cache.name}</span>
                      <span className="font-medium">
                        {cache.metrics.hitRate.toFixed(1)}% hit rate
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* System Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                System Status
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Environment</span>
                  <span className="font-medium">{process.env.NODE_ENV}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Timestamp</span>
                  <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Health Status</span>
                  <span className={`font-medium ${cacheData?.isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                    {cacheData?.isHealthy ? 'Healthy' : 'Degraded'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </details>

        {/* Action Items */}
        {executiveSummary.status !== 'excellent' && (
          <div className="p-6 bg-yellow-50 border-t">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Recommended Actions
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {performanceKPIs
                .filter(kpi => kpi.status === 'needs-attention' || kpi.status === 'critical')
                .map((kpi, index) => (
                  <li key={index}>
                    • Optimize {kpi.label} - currently {kpi.value}{kpi.unit}, target: {kpi.target}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExecutivePerformanceDashboard