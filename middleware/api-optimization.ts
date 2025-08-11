import { NextRequest, NextResponse } from 'next/server'
import { optimizeResponsePayload } from '@/lib/api-optimization'

interface OptimizationOptions {
  enableCompression?: boolean
  enableCaching?: boolean
  enablePayloadOptimization?: boolean
  compressionThreshold?: number
  cacheMaxAge?: number
}

export function withAPIOptimization(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: OptimizationOptions = {}
) {
  const {
    enableCompression = true,
    enableCaching = true,
    enablePayloadOptimization = true,
    compressionThreshold = 1024, // 1KB
    cacheMaxAge = 300, // 5 minutes
  } = options

  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()
    let response: NextResponse

    try {
      // Add performance tracking
      console.log(`🔄 API Request: ${req.method} ${req.nextUrl.pathname}`)
      
      // Process the request
      response = await handler(req)
      
      // Optimize the response
      response = await optimizeResponse(response, {
        enableCompression,
        enableCaching,
        enablePayloadOptimization,
        compressionThreshold,
        cacheMaxAge,
        requestUrl: req.nextUrl.pathname,
        requestMethod: req.method
      })

      // Add performance headers
      const processingTime = Date.now() - startTime
      response.headers.set('X-Response-Time', `${processingTime}ms`)
      response.headers.set('X-Optimized', 'true')

      console.log(`✅ API Response: ${req.method} ${req.nextUrl.pathname} - ${processingTime}ms`)

      return response

    } catch (error) {
      const processingTime = Date.now() - startTime
      console.error(`❌ API Error: ${req.method} ${req.nextUrl.pathname} - ${processingTime}ms`, error)
      
      // Return optimized error response
      return NextResponse.json({
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
        processingTime
      }, { 
        status: 500,
        headers: {
          'X-Response-Time': `${processingTime}ms`,
          'X-Error': 'true'
        }
      })
    }
  }
}

async function optimizeResponse(
  response: NextResponse,
  options: {
    enableCompression: boolean
    enableCaching: boolean
    enablePayloadOptimization: boolean
    compressionThreshold: number
    cacheMaxAge: number
    requestUrl: string
    requestMethod: string
  }
): Promise<NextResponse> {
  const { 
    enableCompression,
    enableCaching,
    enablePayloadOptimization,
    compressionThreshold,
    cacheMaxAge,
    requestUrl,
    requestMethod
  } = options

  // Only optimize successful JSON responses
  if (response.status !== 200) {
    return response
  }

  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    return response
  }

  try {
    // Get response body
    const responseText = await response.text()
    let data: any

    try {
      data = JSON.parse(responseText)
    } catch {
      // Not valid JSON, return as-is
      return response
    }

    // Optimize payload structure
    if (enablePayloadOptimization) {
      data = optimizeResponsePayload(data)
      console.log(`🔧 Payload optimized for ${requestUrl}`)
    }

    // Add executive metadata
    data = addExecutiveMetadata(data, {
      requestUrl,
      requestMethod,
      processingTime: parseInt(response.headers.get('X-Response-Time') || '0')
    })

    const optimizedJson = JSON.stringify(data)
    const originalSize = responseText.length
    const optimizedSize = optimizedJson.length

    // Create optimized response
    const optimizedResponse = NextResponse.json(data, {
      status: response.status,
      headers: response.headers
    })

    // Add optimization headers
    optimizedResponse.headers.set('X-Original-Size', originalSize.toString())
    optimizedResponse.headers.set('X-Optimized-Size', optimizedSize.toString())
    
    if (optimizedSize < originalSize) {
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1)
      optimizedResponse.headers.set('X-Payload-Savings', `${savings}%`)
      console.log(`📦 Payload savings: ${originalSize} → ${optimizedSize} bytes (${savings}%)`)
    }

    // Add caching headers
    if (enableCaching) {
      const cacheControl = getCacheControlHeader(requestUrl, requestMethod, cacheMaxAge)
      optimizedResponse.headers.set('Cache-Control', cacheControl)
      optimizedResponse.headers.set('X-Cache-Strategy', getCacheStrategy(requestUrl))
    }

    // Add compression hints (actual compression is handled by the platform/CDN)
    if (enableCompression && optimizedSize >= compressionThreshold) {
      optimizedResponse.headers.set('X-Should-Compress', 'true')
    }

    // Add security headers for API responses
    addSecurityHeaders(optimizedResponse)

    // Add executive performance indicators
    addExecutivePerformanceHeaders(optimizedResponse, {
      responseSize: optimizedSize,
      isOptimized: optimizedSize < originalSize,
      isCacheable: enableCaching
    })

    return optimizedResponse

  } catch (error) {
    console.warn('Response optimization failed, returning original:', error)
    return response
  }
}

function addExecutiveMetadata(data: any, metadata: {
  requestUrl: string
  requestMethod: string
  processingTime: number
}): any {
  // Don't modify the data structure, just add metadata if it's an object
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return {
      ...data,
      _metadata: {
        timestamp: new Date().toISOString(),
        processingTime: metadata.processingTime,
        endpoint: metadata.requestUrl,
        method: metadata.requestMethod,
        optimized: true,
        executive: true
      }
    }
  }

  return data
}

function getCacheControlHeader(url: string, method: string, maxAge: number): string {
  // Different cache strategies based on endpoint
  if (method !== 'GET') {
    return 'no-cache'
  }

  // Static data - longer cache
  if (url.includes('/api/user/profile') || url.includes('/api/config')) {
    return `public, max-age=${maxAge * 4}, stale-while-revalidate=${maxAge * 2}`
  }

  // Dynamic data - shorter cache with revalidation
  if (url.includes('/api/messages') || url.includes('/api/cache')) {
    return `public, max-age=${maxAge}, stale-while-revalidate=${maxAge}`
  }

  // Default caching
  return `public, max-age=${maxAge}, stale-while-revalidate=${Math.floor(maxAge / 2)}`
}

function getCacheStrategy(url: string): string {
  if (url.includes('/api/user/profile')) return 'long-term'
  if (url.includes('/api/messages')) return 'stale-while-revalidate'
  if (url.includes('/api/cache/performance')) return 'short-term'
  return 'default'
}

function addSecurityHeaders(response: NextResponse) {
  // Prevent XSS
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Remove server information
  response.headers.delete('Server')
  response.headers.delete('X-Powered-By')
  
  // Add HSTS for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
}

function addExecutivePerformanceHeaders(response: NextResponse, metrics: {
  responseSize: number
  isOptimized: boolean
  isCacheable: boolean
}) {
  // Executive dashboard indicators
  response.headers.set('X-Executive-Grade', 'true')
  response.headers.set('X-Performance-Optimized', metrics.isOptimized.toString())
  response.headers.set('X-Cacheable', metrics.isCacheable.toString())
  
  // Response size classification for executives
  let sizeClass = 'optimal'
  if (metrics.responseSize > 50000) sizeClass = 'large' // >50KB
  else if (metrics.responseSize > 10000) sizeClass = 'medium' // >10KB
  else if (metrics.responseSize < 1000) sizeClass = 'minimal' // <1KB
  
  response.headers.set('X-Response-Size-Class', sizeClass)

  // Performance score (0-100)
  let score = 100
  if (metrics.responseSize > 50000) score -= 30
  else if (metrics.responseSize > 10000) score -= 15
  
  if (!metrics.isOptimized) score -= 20
  if (!metrics.isCacheable) score -= 10
  
  response.headers.set('X-Performance-Score', Math.max(0, score).toString())
}

// Batch request optimization for multiple API calls
export class BatchRequestOptimizer {
  private pendingRequests: Map<string, {
    promise: Promise<any>
    timestamp: number
  }> = new Map()

  private readonly BATCH_WINDOW = 100 // 100ms batching window
  private readonly MAX_CACHE_AGE = 5000 // 5 second cache for identical requests

  async optimizeRequest(key: string, requestFn: () => Promise<any>): Promise<any> {
    const now = Date.now()
    
    // Check if we have a recent identical request
    const existing = this.pendingRequests.get(key)
    if (existing && (now - existing.timestamp) < this.MAX_CACHE_AGE) {
      console.log(`🔄 Reusing pending request: ${key}`)
      return existing.promise
    }

    // Create new request
    const promise = requestFn()
    this.pendingRequests.set(key, {
      promise,
      timestamp: now
    })

    // Clean up after request completes
    promise.finally(() => {
      setTimeout(() => {
        this.pendingRequests.delete(key)
      }, this.MAX_CACHE_AGE)
    })

    return promise
  }

  cleanup() {
    this.pendingRequests.clear()
  }
}

export const batchOptimizer = new BatchRequestOptimizer()