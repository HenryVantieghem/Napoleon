import { nango as nangoConfig } from './config'

// Nango configuration
export const NANGO = {
  host: nangoConfig.serverUrl,
  secret: nangoConfig.secretKey,
  public: nangoConfig.publicKey,
} as const

// Provider types
export type Provider = 'google' | 'slack'

// Connection status types
export interface NangoConnection {
  id: number
  connection_id: string
  provider_config_key: string
  provider: Provider
  oauth_access_token: string
  oauth_refresh_token?: string
  oauth_access_token_expires_at?: string
  created_at: string
  updated_at: string
}

// OAuth token response
export interface OAuthTokens {
  access_token: string
  refresh_token?: string
  expires_at?: string
  token_type: 'Bearer'
  scope?: string
}

// Nango API response types
export interface NangoResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Proxy request options
export interface ProxyRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean>
  data?: any
  timeout?: number
  retries?: number
}

// Typed Nango helpers
export class NangoClient {
  private baseUrl: string
  private secretKey: string

  constructor() {
    this.baseUrl = NANGO.host
    this.secretKey = NANGO.secret
  }

  /**
   * Get OAuth authorization URL for a provider
   */
  getAuthUrl(provider: Provider, connectionId: string, redirectUri?: string): string {
    const params = new URLSearchParams({
      connection_id: connectionId,
      provider_config_key: provider,
    })
    
    if (redirectUri) {
      params.set('redirect_uri', redirectUri)
    }

    return `${this.baseUrl}/oauth/authorize?${params.toString()}`
  }

  /**
   * Get connection details
   */
  async getConnection(connectionId: string, provider: Provider): Promise<NangoConnection | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/connection/${connectionId}?provider_config_key=${provider}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`Failed to get connection: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting Nango connection:', error)
      return null
    }
  }

  /**
   * Delete a connection
   */
  async deleteConnection(connectionId: string, provider: Provider): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/connection/${connectionId}?provider_config_key=${provider}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.ok
    } catch (error) {
      console.error('Error deleting Nango connection:', error)
      return false
    }
  }

  /**
   * Make a proxy request to an external API using stored OAuth tokens
   */
  async proxyRequest<T = any>(
    connectionId: string,
    provider: Provider,
    endpoint: string,
    options: ProxyRequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      params = {},
      data,
      timeout = 30000,
      retries = 2
    } = options

    const requestUrl = `${this.baseUrl}/proxy`
    const requestHeaders = {
      'Authorization': `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
      'Provider-Config-Key': provider,
      'Connection-Id': connectionId,
      ...headers
    }

    const requestBody = {
      method,
      endpoint,
      headers: requestHeaders,
      ...(Object.keys(params).length > 0 && { params }),
      ...(data && { data }),
    }

    let lastError: Error
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Nango proxy request failed: ${response.status} ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        lastError = error as Error
        if (attempt < retries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    throw lastError!
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      const crypto = require('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')

      return signature === expectedSignature
    } catch (error) {
      console.error('Error verifying webhook signature:', error)
      return false
    }
  }
}

// Export singleton instance
export const nangoClient = new NangoClient()

// Helper functions for common operations
export const nangoHelpers = {
  /**
   * Generate connection ID for a user and provider
   */
  generateConnectionId(userId: string, provider: Provider): string {
    return `${userId}-${provider}`
  },

  /**
   * Check if connection is expired
   */
  isConnectionExpired(connection: NangoConnection): boolean {
    if (!connection.oauth_access_token_expires_at) return false
    
    const expiresAt = new Date(connection.oauth_access_token_expires_at)
    const now = new Date()
    
    // Consider expired if less than 5 minutes remaining
    return expiresAt.getTime() - now.getTime() < 5 * 60 * 1000
  },

  /**
   * Get provider display name
   */
  getProviderDisplayName(provider: Provider): string {
    const names: Record<Provider, string> = {
      google: 'Gmail',
      slack: 'Slack',
    }
    return names[provider] || provider
  },

  /**
   * Get provider icon/emoji
   */
  getProviderIcon(provider: Provider): string {
    const icons: Record<Provider, string> = {
      google: '📧',
      slack: '💬',
    }
    return icons[provider] || '🔗'
  },
}