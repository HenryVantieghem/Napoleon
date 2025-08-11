// API Optimization utilities for Executive-Grade Performance
// Payload compression, request batching, and response optimization

interface BatchedRequest {
  id: string
  url: string
  options?: RequestInit
  timestamp: number
  resolve: (value: any) => void
  reject: (error: any) => void
}

interface OptimizedResponse<T = any> {
  data: T
  compressed: boolean
  originalSize?: number
  compressedSize?: number
  cacheHit?: boolean
  batchId?: string
  responseTime: number
}

class APIOptimizer {
  private requestQueue: BatchedRequest[] = []
  private batchTimeout: NodeJS.Timeout | null = null
  private readonly BATCH_DELAY = 50 // 50ms batching window
  private readonly MAX_BATCH_SIZE = 10
  private readonly COMPRESSION_THRESHOLD = 1024 // 1KB minimum for compression

  // Batch multiple API requests together
  public async batchRequest<T>(url: string, options?: RequestInit): Promise<OptimizedResponse<T>> {
    return new Promise((resolve, reject) => {
      const request: BatchedRequest = {
        id: this.generateRequestId(),
        url,
        options,
        timestamp: Date.now(),
        resolve: (response) => resolve(response),
        reject: (error) => reject(error)
      }

      this.requestQueue.push(request)
      this.scheduleBatchProcessing()
    })
  }

  // Process batched requests
  private scheduleBatchProcessing() {
    // Clear existing timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
    }

    // Process immediately if batch is full
    if (this.requestQueue.length >= this.MAX_BATCH_SIZE) {
      this.processBatch()
      return
    }

    // Otherwise, wait for more requests
    this.batchTimeout = setTimeout(() => {
      this.processBatch()
    }, this.BATCH_DELAY)
  }

  private async processBatch() {
    if (this.requestQueue.length === 0) return

    const batch = [...this.requestQueue]
    this.requestQueue = []
    this.batchTimeout = null

    const batchId = this.generateBatchId()
    const batchStartTime = performance.now()

    console.log(`🚀 Processing API batch (${batch.length} requests) - ID: ${batchId}`)

    // Group requests by domain for parallel processing
    const requestsByDomain = this.groupByDomain(batch)

    // Process each domain group in parallel
    const domainPromises = Object.entries(requestsByDomain).map(([domain, requests]) => 
      this.processDomainRequests(domain, requests, batchId)
    )

    try {
      await Promise.all(domainPromises)
      const batchTime = performance.now() - batchStartTime
      console.log(`✅ API batch completed in ${batchTime.toFixed(1)}ms - ID: ${batchId}`)
    } catch (error) {
      console.error(`❌ API batch failed - ID: ${batchId}`, error)
    }
  }

  private async processDomainRequests(domain: string, requests: BatchedRequest[], batchId: string) {
    // Execute requests in parallel with concurrency limit
    const CONCURRENCY_LIMIT = 5
    const chunks = this.chunkArray(requests, CONCURRENCY_LIMIT)

    for (const chunk of chunks) {
      const promises = chunk.map(request => this.executeOptimizedRequest(request, batchId))
      await Promise.allSettled(promises)
    }
  }

  private async executeOptimizedRequest(request: BatchedRequest, batchId: string) {
    const startTime = performance.now()
    
    try {
      // Add optimization headers
      const optimizedOptions = this.addOptimizationHeaders(request.options)
      
      const response = await fetch(request.url, optimizedOptions)
      const responseTime = performance.now() - startTime

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Get response data
      const responseText = await response.text()
      let data: any

      try {
        data = JSON.parse(responseText)
      } catch {
        data = responseText
      }

      // Check if response was compressed
      const wasCompressed = response.headers.get('content-encoding') !== null
      const contentLength = parseInt(response.headers.get('content-length') || '0')

      const optimizedResponse: OptimizedResponse = {
        data,
        compressed: wasCompressed,
        originalSize: responseText.length,
        compressedSize: contentLength > 0 ? contentLength : undefined,
        batchId,
        responseTime,
        cacheHit: response.headers.get('x-cache') === 'HIT'
      }

      request.resolve(optimizedResponse)

    } catch (error) {
      const responseTime = performance.now() - startTime
      
      console.error(`API request failed: ${request.url}`, error)
      
      request.reject({
        error: error instanceof Error ? error.message : 'Unknown error',
        url: request.url,
        batchId,
        responseTime
      })
    }
  }

  // Add optimization headers to requests
  private addOptimizationHeaders(options?: RequestInit): RequestInit {
    const headers = new Headers(options?.headers)
    
    // Request compression
    headers.set('Accept-Encoding', 'gzip, deflate, br')
    
    // Prefer JSON responses
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json, text/plain, */*')
    }
    
    // Cache control for API responses
    if (!headers.has('Cache-Control')) {
      headers.set('Cache-Control', 'max-age=300') // 5 minutes
    }

    // Performance hints
    headers.set('X-Performance-Mode', 'executive')

    return {
      ...options,
      headers
    }
  }

  // Compress request payload if it's large enough
  public async compressPayload(data: any): Promise<{ payload: string, compressed: boolean, originalSize: number, compressedSize?: number }> {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data)
    const originalSize = new Blob([jsonString]).size

    // Only compress if payload is large enough
    if (originalSize < this.COMPRESSION_THRESHOLD) {
      return {
        payload: jsonString,
        compressed: false,
        originalSize
      }
    }

    try {
      // Use CompressionStream if available (modern browsers)
      if (typeof window !== 'undefined' && 'CompressionStream' in window) {
        const stream = new CompressionStream('gzip')
        const writer = stream.writable.getWriter()
        const reader = stream.readable.getReader()

        writer.write(new TextEncoder().encode(jsonString))
        writer.close()

        const chunks: Uint8Array[] = []
        let done = false

        while (!done) {
          const { value, done: readerDone } = await reader.read()
          done = readerDone
          if (value) chunks.push(value)
        }

        const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
        let offset = 0
        for (const chunk of chunks) {
          compressed.set(chunk, offset)
          offset += chunk.length
        }

        // Convert to base64 for transmission
        const compressedBase64 = btoa(String.fromCharCode(...compressed))
        
        return {
          payload: compressedBase64,
          compressed: true,
          originalSize,
          compressedSize: compressed.length
        }
      }

      // Fallback to simple string compression (basic)
      const simpleCompressed = this.simpleStringCompress(jsonString)
      return {
        payload: simpleCompressed,
        compressed: true,
        originalSize,
        compressedSize: simpleCompressed.length
      }

    } catch (error) {
      console.warn('Payload compression failed, sending uncompressed:', error)
      return {
        payload: jsonString,
        compressed: false,
        originalSize
      }
    }
  }

  // Simple string compression using LZ-style algorithm
  private simpleStringCompress(str: string): string {
    const dict: { [key: string]: number } = {}
    const data = []
    let phrase = ''
    let out = []
    let code = 256
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i]
      const newPhrase = phrase + char
      
      if (dict[newPhrase]) {
        phrase = newPhrase
      } else {
        if (phrase.length > 1) {
          out.push(dict[phrase])
        } else {
          out.push(phrase.charCodeAt(0))
        }
        dict[newPhrase] = code
        code++
        phrase = char
      }
    }
    
    if (phrase.length > 1) {
      out.push(dict[phrase])
    } else {
      out.push(phrase.charCodeAt(0))
    }
    
    return out.map(num => String.fromCharCode(num)).join('')
  }

  // Helper functions
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
  }

  private groupByDomain(requests: BatchedRequest[]): { [domain: string]: BatchedRequest[] } {
    return requests.reduce((groups, request) => {
      const url = new URL(request.url, window.location.origin)
      const domain = url.hostname
      
      if (!groups[domain]) {
        groups[domain] = []
      }
      
      groups[domain].push(request)
      return groups
    }, {} as { [domain: string]: BatchedRequest[] })
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  // Get batch statistics for performance monitoring
  public getBatchStats() {
    return {
      queueLength: this.requestQueue.length,
      hasPendingBatch: this.batchTimeout !== null,
      batchDelay: this.BATCH_DELAY,
      maxBatchSize: this.MAX_BATCH_SIZE
    }
  }

  // Clean up resources
  public cleanup() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }
    
    // Reject any pending requests
    this.requestQueue.forEach(request => {
      request.reject(new Error('API optimizer cleanup - request cancelled'))
    })
    
    this.requestQueue = []
  }
}

// Global API optimizer instance
export const apiOptimizer = new APIOptimizer()

// High-level optimization functions
export async function optimizedFetch<T = any>(
  url: string, 
  options?: RequestInit
): Promise<OptimizedResponse<T>> {
  return apiOptimizer.batchRequest<T>(url, options)
}

export async function optimizedPost<T = any>(
  url: string,
  data: any,
  options?: RequestInit
): Promise<OptimizedResponse<T>> {
  const { payload, compressed, originalSize, compressedSize } = await apiOptimizer.compressPayload(data)
  
  const headers = new Headers(options?.headers)
  headers.set('Content-Type', compressed ? 'application/x-compressed-json' : 'application/json')
  
  if (compressed) {
    headers.set('X-Original-Size', originalSize.toString())
    headers.set('X-Compressed-Size', compressedSize?.toString() || '0')
  }

  console.log(`📤 Sending ${compressed ? 'compressed' : 'uncompressed'} payload: ${originalSize} bytes ${compressed ? `→ ${compressedSize} bytes (${((1 - (compressedSize || 0) / originalSize) * 100).toFixed(1)}% savings)` : ''}`)

  return apiOptimizer.batchRequest<T>(url, {
    ...options,
    method: 'POST',
    headers,
    body: payload
  })
}

// Response optimization utilities
export function optimizeResponsePayload<T>(data: T): T {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  // Remove null values and empty strings to reduce payload size
  const optimized = Array.isArray(data) ? [] : {}
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === '') {
      continue // Skip null/empty values
    }
    
    if (typeof value === 'object') {
      const optimizedValue = optimizeResponsePayload(value)
      // Only include if it's not empty
      if (Array.isArray(optimizedValue) ? optimizedValue.length > 0 : Object.keys(optimizedValue).length > 0) {
        (optimized as any)[key] = optimizedValue
      }
    } else {
      (optimized as any)[key] = value
    }
  }

  return optimized as T
}

// Executive performance metrics
export function getOptimizationMetrics() {
  return {
    ...apiOptimizer.getBatchStats(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  }
}

// Cleanup function for unmounting
export function cleanupAPIOptimizer() {
  apiOptimizer.cleanup()
}

export default apiOptimizer