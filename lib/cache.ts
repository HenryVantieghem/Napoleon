import { cache as cacheConfig } from './config'
import { NormalizedMessage } from './normalize'

// In-memory cache implementation for development/testing
// In production, consider Redis or other distributed cache

interface CacheEntry<T = any> {
  data: T
  timestamp: number
  expiresAt: number
  hitCount: number
}

interface CacheMetrics {
  hits: number
  misses: number
  sets: number
  deletes: number
  totalRequests: number
  hitRate: number
  memoryUsage: number
  averageResponseTime: number
}

interface CacheOptions {
  ttl?: number // Time to live in seconds
  maxSize?: number // Maximum number of entries
  namespace?: string // Cache namespace for isolation
}

class MessageCache {
  private cache = new Map<string, CacheEntry>()
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    totalRequests: 0,
    hitRate: 0,
    memoryUsage: 0,
    averageResponseTime: 0,
  }
  
  private readonly defaultTtl: number
  private readonly maxSize: number
  private readonly namespace: string

  constructor(options: CacheOptions = {}) {
    this.defaultTtl = options.ttl || cacheConfig.ttlSeconds
    this.maxSize = options.maxSize || cacheConfig.maxEntries
    this.namespace = options.namespace || 'default'
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000)
  }

  /**
   * Generate cache key with namespace
   */
  private getKey(key: string): string {
    return `${this.namespace}:${key}`
  }

  /**
   * Get item from cache
   */
  get<T = any>(key: string): T | null {
    const start = Date.now()
    this.metrics.totalRequests++
    
    const fullKey = this.getKey(key)
    const entry = this.cache.get(fullKey)

    if (!entry) {
      this.metrics.misses++
      this.updateMetrics()
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(fullKey)
      this.metrics.misses++
      this.updateMetrics()
      return null
    }

    // Update hit count and metrics
    entry.hitCount++
    this.metrics.hits++
    
    const responseTime = Date.now() - start
    this.updateAverageResponseTime(responseTime)
    this.updateMetrics()
    
    return entry.data as T
  }

  /**
   * Set item in cache
   */
  set<T = any>(key: string, data: T, ttlSeconds?: number): void {
    const fullKey = this.getKey(key)
    const ttl = ttlSeconds || this.defaultTtl
    const now = Date.now()

    // Remove oldest entries if at max capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(fullKey)) {
      this.evictOldest()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + (ttl * 1000),
      hitCount: 0,
    }

    this.cache.set(fullKey, entry)
    this.metrics.sets++
    this.updateMetrics()
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    const fullKey = this.getKey(key)
    const deleted = this.cache.delete(fullKey)
    
    if (deleted) {
      this.metrics.deletes++
      this.updateMetrics()
    }
    
    return deleted
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const fullKey = this.getKey(key)
    const entry = this.cache.get(fullKey)
    
    if (!entry) return false
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(fullKey)
      return false
    }
    
    return true
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
    this.updateMetrics()
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Get all keys in cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys()).map(key => 
      key.startsWith(`${this.namespace}:`) ? key.slice(this.namespace.length + 1) : key
    )
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      this.updateMetrics()
    }
  }

  /**
   * Evict oldest entry (LRU)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * Update cache metrics
   */
  private updateMetrics(): void {
    this.metrics.hitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.hits / this.metrics.totalRequests) * 100 
      : 0
    
    this.metrics.memoryUsage = this.estimateMemoryUsage()
  }

  /**
   * Update average response time
   */
  private updateAverageResponseTime(responseTime: number): void {
    if (this.metrics.averageResponseTime === 0) {
      this.metrics.averageResponseTime = responseTime
    } else {
      // Rolling average
      this.metrics.averageResponseTime = (this.metrics.averageResponseTime + responseTime) / 2
    }
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0
    
    for (const [key, entry] of Array.from(this.cache.entries())) {
      totalSize += key.length * 2 // String overhead
      totalSize += JSON.stringify(entry.data).length * 2 // Data size estimate
      totalSize += 64 // Entry overhead estimate
    }
    
    return totalSize
  }
}

// Cache instances for different data types
export const messageCache = new MessageCache({
  namespace: 'messages',
  ttl: 300, // 5 minutes for messages
  maxSize: 1000,
})

export const connectionCache = new MessageCache({
  namespace: 'connections',
  ttl: 3600, // 1 hour for connections
  maxSize: 100,
})

export const userCache = new MessageCache({
  namespace: 'users',
  ttl: 1800, // 30 minutes for user data
  maxSize: 500,
})

// Message-specific cache helpers
export const messageCacheHelpers = {
  /**
   * Generate cache key for user messages
   */
  getUserMessagesKey(userId: string, provider: 'gmail' | 'slack'): string {
    return `user:${userId}:${provider}:messages`
  },

  /**
   * Generate cache key for message details
   */
  getMessageKey(provider: 'gmail' | 'slack', messageId: string): string {
    return `${provider}:message:${messageId}`
  },

  /**
   * Generate cache key for unified messages
   */
  getUnifiedMessagesKey(userId: string): string {
    return `user:${userId}:unified:messages`
  },

  /**
   * Cache user messages
   */
  cacheUserMessages(userId: string, provider: 'gmail' | 'slack', messages: NormalizedMessage[]): void {
    const key = this.getUserMessagesKey(userId, provider)
    messageCache.set(key, {
      messages,
      timestamp: Date.now(),
      count: messages.length,
    })
  },

  /**
   * Get cached user messages
   */
  getCachedUserMessages(userId: string, provider: 'gmail' | 'slack'): NormalizedMessage[] | null {
    const key = this.getUserMessagesKey(userId, provider)
    const cached = messageCache.get<{
      messages: NormalizedMessage[]
      timestamp: number
      count: number
    }>(key)

    return cached?.messages || null
  },

  /**
   * Cache unified messages
   */
  cacheUnifiedMessages(userId: string, messages: NormalizedMessage[]): void {
    const key = this.getUnifiedMessagesKey(userId)
    messageCache.set(key, {
      messages,
      timestamp: Date.now(),
      count: messages.length,
      providers: Array.from(new Set(messages.map(m => m.provider))),
    })
  },

  /**
   * Get cached unified messages
   */
  getCachedUnifiedMessages(userId: string): NormalizedMessage[] | null {
    const key = this.getUnifiedMessagesKey(userId)
    const cached = messageCache.get<{
      messages: NormalizedMessage[]
      timestamp: number
      count: number
      providers: string[]
    }>(key)

    return cached?.messages || null
  },

  /**
   * Invalidate all messages for a user
   */
  invalidateUserMessages(userId: string): void {
    const keys = [
      this.getUserMessagesKey(userId, 'gmail'),
      this.getUserMessagesKey(userId, 'slack'),
      this.getUnifiedMessagesKey(userId),
    ]

    keys.forEach(key => messageCache.delete(key))
  },

  /**
   * Get cache statistics
   */
  getStats(): {
    messages: CacheMetrics
    connections: CacheMetrics
    users: CacheMetrics
  } {
    return {
      messages: messageCache.getMetrics(),
      connections: connectionCache.getMetrics(),
      users: userCache.getMetrics(),
    }
  },
}

// Export cache instances and helpers
export { MessageCache }
export default messageCacheHelpers