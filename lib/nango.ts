import { createServerClient } from './supabase/server'

// Provider types
export type Provider = 'google' | 'slack'

// Nango connection interface
export interface NangoConnection {
  user_id: string
  provider: Provider
  connection_id: string
  access_token?: string
  refresh_token?: string
  expires_at?: string
  created_at?: string
  updated_at?: string
}

// Core Nango configuration
const NANGO_HOST = process.env.NANGO_SERVER_URL || 'https://api.nango.dev'
const NANGO_SECRET = process.env.NANGO_SECRET_KEY || ''
const NANGO_PUBLIC = process.env.NANGO_PUBLIC_KEY || ''

// Export for backward compatibility
export const NANGO = {
  host: NANGO_HOST,
  secret: NANGO_SECRET,
  public: NANGO_PUBLIC,
}

/**
 * Start OAuth connection flow with Nango
 * Returns the authorization URL to redirect the user to
 */
export function startConnect(provider: Provider, userId: string): string {
  const connectionId = getConnId(userId, provider)
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/callback`
  
  const params = new URLSearchParams({
    connection_id: connectionId,
    provider_config_key: provider,
    redirect_uri: redirectUri,
  })
  
  return `${NANGO_HOST}/oauth/authorize?${params.toString()}`
}

/**
 * Generate a consistent connection ID for a user and provider
 */
export function getConnId(userId: string, provider: Provider): string {
  return `${userId}-${provider}`
}

/**
 * Make a proxy request through Nango to access provider APIs
 */
export async function proxyFetch<T = any>(
  provider: Provider,
  path: string,
  query?: Record<string, string | number | boolean>
): Promise<T> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  const connectionId = getConnId(user.id, provider)
  
  const url = new URL(`${NANGO_HOST}/proxy`)
  
  // Build query string if provided
  let endpoint = path
  if (query && Object.keys(query).length > 0) {
    const queryString = new URLSearchParams(
      Object.entries(query).reduce((acc, [key, value]) => {
        acc[key] = String(value)
        return acc
      }, {} as Record<string, string>)
    ).toString()
    endpoint = `${path}?${queryString}`
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NANGO_SECRET}`,
      'Content-Type': 'application/json',
      'Provider-Config-Key': provider,
      'Connection-Id': connectionId,
    },
    body: JSON.stringify({
      method: 'GET',
      endpoint,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Nango proxy request failed: ${response.status} - ${error}`)
  }
  
  return response.json()
}

// Supabase table helpers for nango_connections
export const nangoDb = {
  /**
   * Get a connection from the database
   */
  async getConnection(userId: string, provider: Provider): Promise<NangoConnection | null> {
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('nango_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single()
    
    if (error) {
      console.error('Error fetching Nango connection:', error)
      return null
    }
    
    return data
  },
  
  /**
   * Save or update a connection in the database
   */
  async upsertConnection(connection: NangoConnection): Promise<boolean> {
    const supabase = createServerClient()
    
    const { error } = await supabase
      .from('nango_connections')
      .upsert({
        ...connection,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider'
      })
    
    if (error) {
      console.error('Error upserting Nango connection:', error)
      return false
    }
    
    return true
  },
  
  /**
   * Delete a connection from the database
   */
  async deleteConnection(userId: string, provider: Provider): Promise<boolean> {
    const supabase = createServerClient()
    
    const { error } = await supabase
      .from('nango_connections')
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider)
    
    if (error) {
      console.error('Error deleting Nango connection:', error)
      return false
    }
    
    return true
  },
  
  /**
   * Get all connections for a user
   */
  async getUserConnections(userId: string): Promise<NangoConnection[]> {
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('nango_connections')
      .select('*')
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching user connections:', error)
      return []
    }
    
    return data || []
  },
  
  /**
   * Check if a user has a connection for a provider
   */
  async hasConnection(userId: string, provider: Provider): Promise<boolean> {
    const connection = await this.getConnection(userId, provider)
    return !!connection
  },
}