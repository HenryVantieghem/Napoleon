// High-performance cache manager for Napoleon AI
// Implements memory caching with intelligent invalidation strategies

import NodeCache from 'node-cache'

interface CacheOptions {
  ttl?: number // Time to live in seconds
  checkperiod?: number // Automatic delete check interval
  useClones?: boolean // Whether to clone values on get/set
  deleteOnExpire?: boolean // Whether to delete expired keys automatically
  enableLegacyCallbacks?: boolean // Enable legacy callback support
}

interface CacheStats {
  keys: number
  hits: number
  misses: number
  ksize: number
  vsize: number
}

interface CacheMetrics {
  hitRate: number
  totalRequests: number
  averageResponseTime: number
  memoryUsage: number
}

class CacheManager {
  private cache: NodeCache
  private hits = 0
  private misses = 0
  private totalRequests = 0
  private responseTimes: number[] = []

  constructor(options: CacheOptions = {}) {
    const defaultOptions = {
      ttl: 300, // 5 minutes default
      checkperiod: 60, // Check every minute
      useClones: false, // Better performance without cloning
      deleteOnExpire: true,
      enableLegacyCallbacks: false
    }

    this.cache = new NodeCache({ ...defaultOptions, ...options })

    // Log cache events in development
    if (process.env.NODE_ENV === 'development') {
      this.cache.on('set', (key, value) => {
        console.log(`🗃️ Cache SET: ${key}`)
      })

      this.cache.on('del', (key, value) => {
        console.log(`🗑️ Cache DEL: ${key}`)
      })

      this.cache.on('expired', (key, value) => {
        console.log(`⏰ Cache EXPIRED: ${key}`)
      })
    }
  }

  // Get value from cache with performance tracking
  get<T>(key: string): T | undefined {
    const startTime = Date.now()
    this.totalRequests++

    const value = this.cache.get<T>(key)
    
    if (value !== undefined) {
      this.hits++
    } else {
      this.misses++
    }

    const responseTime = Date.now() - startTime
    this.responseTimes.push(responseTime)

    // Keep only last 1000 response times for memory efficiency
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-500)
    }

    return value
  }

  // Set value in cache
  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl)
  }

  // Set multiple values at once
  mset<T>(keyValuePairs: Array<{key: string, val: T, ttl?: number}>): boolean {
    return this.cache.mset(keyValuePairs)
  }

  // Get multiple values at once
  mget<T>(keys: string[]): Record<string, T> {
    const startTime = Date.now()
    this.totalRequests += keys.length

    const values = this.cache.mget<T>(keys)
    
    // Count hits and misses
    keys.forEach(key => {
      if (values[key] !== undefined) {
        this.hits++
      } else {
        this.misses++
      }
    })

    const responseTime = Date.now() - startTime
    this.responseTimes.push(responseTime)

    return values
  }

  // Delete key(s)
  del(keys: string | string[]): number {
    return this.cache.del(keys)
  }

  // Check if key exists
  has(key: string): boolean {
    return this.cache.has(key)
  }

  // Get all keys
  keys(): string[] {
    return this.cache.keys()
  }

  // Clear all cache
  flushAll(): void {
    this.cache.flushAll()
    this.resetMetrics()
  }

  // Reset performance metrics
  resetMetrics(): void {
    this.hits = 0
    this.misses = 0
    this.totalRequests = 0
    this.responseTimes = []
  }

  // Get cache statistics
  getStats(): CacheStats {
    return this.cache.getStats()
  }

  // Get performance metrics
  getMetrics(): CacheMetrics {
    const hitRate = this.totalRequests > 0 ? (this.hits / this.totalRequests) * 100 : 0
    const averageResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
      : 0

    const stats = this.getStats()
    const memoryUsage = stats.ksize + stats.vsize

    return {
      hitRate: Math.round(hitRate * 100) / 100,
      totalRequests: this.totalRequests,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      memoryUsage
    }
  }

  // Smart cache key generation
  generateKey(prefix: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|')
    
    return sortedParams ? `${prefix}:${sortedParams}` : prefix
  }

  // Cache with automatic invalidation on data change
  async getOrSet<T>(
    key: string, 
    fetchFunction: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key)
    
    if (cached !== undefined) {
      return cached
    }

    try {
      const value = await fetchFunction()
      this.set(key, value, ttl)
      return value
    } catch (error) {
      console.error(`Cache fetch function failed for key ${key}:`, error)
      throw error
    }
  }

  // Invalidate cache by pattern
  invalidatePattern(pattern: string): number {
    const keys = this.cache.keys()
    const matchingKeys = keys.filter(key => {
      // Support simple wildcards
      const regex = new RegExp(pattern.replace(/\*/g, '.*'))
      return regex.test(key)
    })

    if (matchingKeys.length > 0) {
      console.log(`🧹 Invalidating ${matchingKeys.length} cache keys matching pattern: ${pattern}`)
      return this.cache.del(matchingKeys)
    }

    return 0
  }

  // Preload cache with data
  async preload<T>(keys: Array<{key: string, fetchFn: () => Promise<T>, ttl?: number}>): Promise<void> {
    console.log(`🔄 Preloading ${keys.length} cache entries...`)
    
    const promises = keys.map(async ({ key, fetchFn, ttl }) => {
      try {
        const value = await fetchFn()
        this.set(key, value, ttl)
        return key
      } catch (error) {
        console.error(`Failed to preload cache key ${key}:`, error)
        return null
      }
    })

    const results = await Promise.all(promises)
    const successful = results.filter(Boolean).length
    
    console.log(`✅ Successfully preloaded ${successful}/${keys.length} cache entries`)
  }
}

// Create cache instances for different data types
export const messageCache = new CacheManager({
  ttl: 300, // 5 minutes for message data
  checkperiod: 60
})

export const userTokenCache = new CacheManager({
  ttl: 3600, // 1 hour for user tokens (they don't change often)
  checkperiod: 300 // Check every 5 minutes
})

export const priorityCache = new CacheManager({
  ttl: 600, // 10 minutes for priority calculations
  checkperiod: 120
})

export const connectionStatusCache = new CacheManager({
  ttl: 900, // 15 minutes for connection status
  checkperiod: 180
})

// Utility functions for common caching patterns
export const cacheKeys = {
  // Message-related keys
  unifiedMessages: (userId: string) => `messages:unified:${userId}`,
  gmailMessages: (userId: string) => `messages:gmail:${userId}`,
  slackMessages: (userId: string) => `messages:slack:${userId}`,
  messageStats: (userId: string) => `stats:messages:${userId}`,

  // User-related keys
  userTokens: (userId: string) => `tokens:user:${userId}`,
  connectionStatus: (userId: string) => `connection:status:${userId}`,

  // Priority-related keys
  messagePriority: (messageId: string) => `priority:message:${messageId}`,
  userPriorities: (userId: string) => `priority:user:${userId}`,

  // Performance keys
  apiResponse: (endpoint: string, params: string = '') => `api:${endpoint}:${params}`,
  performanceMetrics: (userId: string) => `performance:${userId}`
}

// Cache invalidation helpers
export const invalidateUserCache = (userId: string) => {
  const patterns = [
    `messages:*:${userId}`,
    `stats:*:${userId}`,
    `tokens:user:${userId}`,
    `connection:status:${userId}`,
    `priority:user:${userId}`,
    `performance:${userId}`
  ]

  let totalInvalidated = 0
  patterns.forEach(pattern => {
    totalInvalidated += messageCache.invalidatePattern(pattern)
    totalInvalidated += userTokenCache.invalidatePattern(pattern)
    totalInvalidated += priorityCache.invalidatePattern(pattern)
    totalInvalidated += connectionStatusCache.invalidatePattern(pattern)
  })

  console.log(`🧹 Invalidated ${totalInvalidated} cache entries for user ${userId}`)
  return totalInvalidated
}

// Performance monitoring
export const getCachePerformanceReport = () => {
  return {
    messageCache: {
      name: 'Message Cache',
      stats: messageCache.getStats(),
      metrics: messageCache.getMetrics()
    },
    userTokenCache: {
      name: 'User Token Cache',
      stats: userTokenCache.getStats(),
      metrics: userTokenCache.getMetrics()
    },
    priorityCache: {
      name: 'Priority Cache',
      stats: priorityCache.getStats(),
      metrics: priorityCache.getMetrics()
    },
    connectionStatusCache: {
      name: 'Connection Status Cache',
      stats: connectionStatusCache.getStats(),
      metrics: connectionStatusCache.getMetrics()
    }
  }
}

// Export default cache manager for custom use cases
export default CacheManager