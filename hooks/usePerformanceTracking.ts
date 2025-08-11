'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay  
  cls: number | null // Cumulative Layout Shift
  fcp: number | null // First Contentful Paint
  ttfb: number | null // Time to First Byte
  
  // Application Metrics
  renderTime: number | null
  hydrationTime: number | null
  routeChangeTime: number | null
  apiResponseTime: number | null
  
  // Resource Metrics
  memoryUsage: number | null
  bundleSize: number | null
  
  // User Experience Metrics
  interactionLatency: number[]
  errorCount: number
  sessionDuration: number
}

interface UsePerformanceTrackingOptions {
  enableCoreWebVitals?: boolean
  enableResourceTracking?: boolean
  enableInteractionTracking?: boolean
  reportingEndpoint?: string
  sampleRate?: number // 0-1, for performance sampling
}

export function usePerformanceTracking(options: UsePerformanceTrackingOptions = {}) {
  const {
    enableCoreWebVitals = true,
    enableResourceTracking = true,
    enableInteractionTracking = true,
    reportingEndpoint,
    sampleRate = 1.0
  } = options

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    renderTime: null,
    hydrationTime: null,
    routeChangeTime: null,
    apiResponseTime: null,
    memoryUsage: null,
    bundleSize: null,
    interactionLatency: [],
    errorCount: 0,
    sessionDuration: 0
  })

  const sessionStartTime = useRef<number>(Date.now())
  const clsValue = useRef<number>(0)
  const interactionStartTime = useRef<number | null>(null)
  const observersRef = useRef<PerformanceObserver[]>([])

  // Should we track this session?
  const shouldTrack = useCallback(() => {
    return Math.random() <= sampleRate
  }, [sampleRate])

  // Report metrics to endpoint
  const reportMetrics = useCallback(async (metricsToReport: Partial<PerformanceMetrics>) => {
    if (!reportingEndpoint || !shouldTrack()) return

    try {
      await fetch(reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: metricsToReport,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          sessionId: sessionStartTime.current.toString(),
        }),
      })
    } catch (error) {
      console.warn('Failed to report performance metrics:', error)
    }
  }, [reportingEndpoint, shouldTrack])

  // Measure Core Web Vitals
  const measureCoreWebVitals = useCallback(() => {
    if (!enableCoreWebVitals || typeof window === 'undefined') return

    // Navigation Timing API
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navTiming) {
      const ttfb = navTiming.responseStart - navTiming.requestStart
      const fcp = navTiming.domContentLoadedEventStart - navTiming.navigationStart
      
      setMetrics(prev => ({
        ...prev,
        ttfb,
        fcp,
        renderTime: navTiming.loadEventEnd - navTiming.domContentLoadedEventStart
      }))
    }

    // Use Performance Observer if available
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          const lcp = lastEntry.startTime
          
          setMetrics(prev => ({ ...prev, lcp }))
          reportMetrics({ lcp })
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        observersRef.current.push(lcpObserver)
      } catch (e) {
        console.warn('LCP observation not supported')
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          entries.forEach(entry => {
            const fid = entry.processingStart - entry.startTime
            setMetrics(prev => ({ ...prev, fid }))
            reportMetrics({ fid })
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        observersRef.current.push(fidObserver)
      } catch (e) {
        console.warn('FID observation not supported')
      }

      // Cumulative Layout Shift (CLS)
      try {
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          entries.forEach(entry => {
            if (!(entry as any).hadRecentInput) {
              clsValue.current += (entry as any).value
              setMetrics(prev => ({ ...prev, cls: clsValue.current }))
            }
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        observersRef.current.push(clsObserver)
      } catch (e) {
        console.warn('CLS observation not supported')
      }
    }
  }, [enableCoreWebVitals, reportMetrics])

  // Measure resource performance
  const measureResourceMetrics = useCallback(() => {
    if (!enableResourceTracking || typeof window === 'undefined') return

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const memoryUsage = memory.usedJSHeapSize / 1048576 // Convert to MB
      setMetrics(prev => ({ ...prev, memoryUsage }))
    }

    // Bundle size estimation
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const jsResources = resourceEntries.filter(entry => 
      entry.name.includes('.js') || entry.name.includes('/_next/')
    )
    
    const bundleSize = jsResources.reduce((total, resource) => {
      return total + (resource.transferSize || 0)
    }, 0) / 1024 // Convert to KB

    setMetrics(prev => ({ ...prev, bundleSize }))
  }, [enableResourceTracking])

  // Measure API response times
  const measureApiPerformance = useCallback(() => {
    if (typeof window === 'undefined') return

    // Hook into fetch to measure API response times
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = performance.now()
      try {
        const response = await originalFetch(...args)
        const endTime = performance.now()
        const responseTime = endTime - startTime
        
        // Update average API response time
        setMetrics(prev => ({
          ...prev,
          apiResponseTime: prev.apiResponseTime 
            ? (prev.apiResponseTime + responseTime) / 2 
            : responseTime
        }))
        
        return response
      } catch (error) {
        const endTime = performance.now()
        const responseTime = endTime - startTime
        
        setMetrics(prev => ({
          ...prev,
          apiResponseTime: prev.apiResponseTime 
            ? (prev.apiResponseTime + responseTime) / 2 
            : responseTime,
          errorCount: prev.errorCount + 1
        }))
        
        throw error
      }
    }

    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch
    }
  }, [])

  // Track user interactions
  const measureInteractionLatency = useCallback(() => {
    if (!enableInteractionTracking || typeof window === 'undefined') return

    const handleInteractionStart = () => {
      interactionStartTime.current = performance.now()
    }

    const handleInteractionEnd = () => {
      if (interactionStartTime.current) {
        const latency = performance.now() - interactionStartTime.current
        setMetrics(prev => ({
          ...prev,
          interactionLatency: [...prev.interactionLatency.slice(-49), latency] // Keep last 50
        }))
        interactionStartTime.current = null
      }
    }

    // Track various interaction types
    const events = ['click', 'keydown', 'touchstart']
    const endEvents = ['click', 'keyup', 'touchend']

    events.forEach(event => {
      document.addEventListener(event, handleInteractionStart, { passive: true })
    })

    endEvents.forEach(event => {
      document.addEventListener(event, handleInteractionEnd, { passive: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteractionStart)
      })
      endEvents.forEach(event => {
        document.removeEventListener(event, handleInteractionEnd)
      })
    }
  }, [enableInteractionTracking])

  // Calculate performance score
  const getPerformanceScore = useCallback(() => {
    let score = 100

    // LCP scoring
    if (metrics.lcp) {
      if (metrics.lcp > 4000) score -= 30
      else if (metrics.lcp > 2500) score -= 15
    }

    // FID scoring
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 25
      else if (metrics.fid > 100) score -= 10
    }

    // CLS scoring
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 25
      else if (metrics.cls > 0.1) score -= 10
    }

    // API response time scoring
    if (metrics.apiResponseTime) {
      if (metrics.apiResponseTime > 2000) score -= 15
      else if (metrics.apiResponseTime > 1000) score -= 8
    }

    // Memory usage scoring
    if (metrics.memoryUsage && metrics.memoryUsage > 100) {
      score -= 5
    }

    // Error count penalty
    score -= Math.min(metrics.errorCount * 2, 20)

    return Math.max(0, Math.min(100, score))
  }, [metrics])

  // Get executive summary
  const getExecutiveSummary = useCallback(() => {
    const score = getPerformanceScore()
    const avgInteractionLatency = metrics.interactionLatency.length > 0 
      ? metrics.interactionLatency.reduce((a, b) => a + b, 0) / metrics.interactionLatency.length 
      : 0

    return {
      performanceScore: score,
      status: score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'needs-improvement' : 'poor',
      coreWebVitalsScore: {
        lcp: metrics.lcp ? (metrics.lcp <= 2500 ? 'good' : metrics.lcp <= 4000 ? 'needs-improvement' : 'poor') : null,
        fid: metrics.fid ? (metrics.fid <= 100 ? 'good' : metrics.fid <= 300 ? 'needs-improvement' : 'poor') : null,
        cls: metrics.cls ? (metrics.cls <= 0.1 ? 'good' : metrics.cls <= 0.25 ? 'needs-improvement' : 'poor') : null,
      },
      averageInteractionLatency: avgInteractionLatency,
      sessionDuration: Date.now() - sessionStartTime.current,
      errorRate: metrics.errorCount > 0 ? (metrics.errorCount / (Date.now() - sessionStartTime.current) * 60000) : 0 // errors per minute
    }
  }, [metrics, getPerformanceScore])

  // Initialize tracking
  useEffect(() => {
    if (!shouldTrack()) return

    measureCoreWebVitals()
    measureResourceMetrics()
    const cleanupApi = measureApiPerformance()
    const cleanupInteraction = measureInteractionLatency()

    // Update session duration periodically
    const sessionInterval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        sessionDuration: Date.now() - sessionStartTime.current
      }))
    }, 10000) // Update every 10 seconds

    // Cleanup
    return () => {
      cleanupApi?.()
      cleanupInteraction?.()
      clearInterval(sessionInterval)
      
      // Disconnect all observers
      observersRef.current.forEach(observer => {
        observer.disconnect()
      })
      observersRef.current = []

      // Send final report
      const finalMetrics = {
        ...metrics,
        sessionDuration: Date.now() - sessionStartTime.current
      }
      reportMetrics(finalMetrics)
    }
  }, [measureCoreWebVitals, measureResourceMetrics, measureApiPerformance, measureInteractionLatency, reportMetrics, shouldTrack])

  return {
    metrics,
    performanceScore: getPerformanceScore(),
    executiveSummary: getExecutiveSummary(),
    reportMetrics: (customMetrics: Partial<PerformanceMetrics>) => reportMetrics(customMetrics)
  }
}