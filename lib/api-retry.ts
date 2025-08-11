// Bulletproof API retry logic with exponential backoff
// Designed for executive-grade reliability

interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  timeout?: number
  retryOn?: (error: any) => boolean
  onRetry?: (attempt: number, error: any) => void
  onFinalFailure?: (error: any) => void
}

interface RetryResult<T> {
  data?: T
  error?: any
  attempt: number
  totalTime: number
  success: boolean
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  timeout: 30000, // 30 seconds per request
  retryOn: (error: any) => {
    // Retry on network errors, 5xx errors, and rate limiting
    if (!error.status) return true // Network error
    return error.status >= 500 || error.status === 429
  },
  onRetry: () => {},
  onFinalFailure: () => {}
}

export class ApiRetryManager {
  private static instances = new Map<string, ApiRetryManager>()
  
  constructor(private serviceName: string) {}

  static getInstance(serviceName: string): ApiRetryManager {
    if (!this.instances.has(serviceName)) {
      this.instances.set(serviceName, new ApiRetryManager(serviceName))
    }
    return this.instances.get(serviceName)!
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    const config = { ...DEFAULT_RETRY_OPTIONS, ...options }
    const startTime = Date.now()
    let lastError: any = null

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        console.log(`🔄 ${this.serviceName} API call - Attempt ${attempt}/${config.maxAttempts}`)
        
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), config.timeout)
        })

        // Execute operation with timeout
        const data = await Promise.race([operation(), timeoutPromise])
        
        const totalTime = Date.now() - startTime
        console.log(`✅ ${this.serviceName} API call succeeded on attempt ${attempt} (${totalTime}ms)`)
        
        return {
          data,
          attempt,
          totalTime,
          success: true
        }

      } catch (error: any) {
        lastError = error
        const totalTime = Date.now() - startTime

        console.warn(`❌ ${this.serviceName} API call failed on attempt ${attempt}:`, error.message)

        // Check if we should retry this error
        if (!config.retryOn(error) || attempt === config.maxAttempts) {
          console.error(`🚨 ${this.serviceName} API call failed after ${attempt} attempts (${totalTime}ms)`)
          config.onFinalFailure(error)
          
          return {
            error,
            attempt,
            totalTime,
            success: false
          }
        }

        // Calculate delay with exponential backoff and jitter
        const baseDelay = Math.min(
          config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
          config.maxDelay
        )
        
        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.3 * baseDelay
        const delay = baseDelay + jitter

        console.log(`⏳ ${this.serviceName} retrying in ${Math.round(delay)}ms...`)
        config.onRetry(attempt, error)

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    // This should never be reached, but TypeScript requires it
    return {
      error: lastError,
      attempt: config.maxAttempts,
      totalTime: Date.now() - startTime,
      success: false
    }
  }
}

// Specific retry managers for different services
export const gmailRetryManager = ApiRetryManager.getInstance('Gmail')
export const slackRetryManager = ApiRetryManager.getInstance('Slack')
export const authRetryManager = ApiRetryManager.getInstance('Auth')

// Enhanced fetch wrapper with automatic retry
export async function retryFetch(
  url: string, 
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const serviceName = new URL(url, window.location.origin).pathname.split('/')[2] || 'API'
  const retryManager = ApiRetryManager.getInstance(serviceName)

  const result = await retryManager.executeWithRetry(async () => {
    const response = await fetch(url, options)
    
    // Check if response is ok
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
      ;(error as any).status = response.status
      ;(error as any).response = response
      throw error
    }
    
    return response
  }, retryOptions)

  if (result.success && result.data) {
    return result.data
  } else {
    throw result.error
  }
}

// Circuit breaker pattern for preventing cascading failures
export class CircuitBreaker {
  private failures = 0
  private lastFailTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000, // 1 minute
    private serviceName: string = 'Service'
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailTime < this.recoveryTimeout) {
        throw new Error(`Circuit breaker is OPEN for ${this.serviceName}`)
      } else {
        this.state = 'half-open'
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess() {
    this.failures = 0
    this.state = 'closed'
    console.log(`✅ Circuit breaker CLOSED for ${this.serviceName}`)
  }

  private onFailure() {
    this.failures++
    this.lastFailTime = Date.now()

    if (this.failures >= this.failureThreshold) {
      this.state = 'open'
      console.warn(`🚨 Circuit breaker OPENED for ${this.serviceName} (${this.failures} failures)`)
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailTime: this.lastFailTime
    }
  }
}

// Pre-configured circuit breakers
export const gmailCircuitBreaker = new CircuitBreaker(3, 30000, 'Gmail API')
export const slackCircuitBreaker = new CircuitBreaker(3, 30000, 'Slack API')
export const authCircuitBreaker = new CircuitBreaker(5, 60000, 'Auth Service')