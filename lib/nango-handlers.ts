import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NANGO } from './nango'

export interface ConnectionStatus {
  gmail: boolean
  slack: boolean
}

export interface ConnectionDetails {
  gmail: {
    connected: boolean
    connectedAt: number | null
    accountId: string | null
  }
  slack: {
    connected: boolean
    connectedAt: number | null
    teamId: string | null
  }
}

// Get Supabase client with service role for server operations
function getSupabaseServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() { return undefined },
        set() {},
        remove() {},
      },
    }
  )
}

// Get user's connection status from nango_connections table
export async function getUserConnections(userId: string): Promise<ConnectionStatus> {
  try {
    const supabase = getSupabaseServiceClient()
    
    const { data: connections, error } = await supabase
      .from('nango_connections')
      .select('provider')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching connections:', error)
      return { gmail: false, slack: false }
    }

    const providers = connections?.map(c => c.provider) || []
    
    return {
      gmail: providers.includes('google'),
      slack: providers.includes('slack')
    }
  } catch (error) {
    console.error('Error getting user connections:', error)
    return { gmail: false, slack: false }
  }
}

// Get detailed connection information
export async function getConnectionDetails(userId: string): Promise<ConnectionDetails> {
  try {
    const supabase = getSupabaseServiceClient()
    
    const { data: connections, error } = await supabase
      .from('nango_connections')
      .select('provider, account_id, team_id, created_at')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching connection details:', error)
      return {
        gmail: { connected: false, connectedAt: null, accountId: null },
        slack: { connected: false, connectedAt: null, teamId: null }
      }
    }

    const gmailConnection = connections?.find(c => c.provider === 'google')
    const slackConnection = connections?.find(c => c.provider === 'slack')

    return {
      gmail: {
        connected: !!gmailConnection,
        connectedAt: gmailConnection ? new Date(gmailConnection.created_at).getTime() : null,
        accountId: gmailConnection?.account_id || null
      },
      slack: {
        connected: !!slackConnection,
        connectedAt: slackConnection ? new Date(slackConnection.created_at).getTime() : null,
        teamId: slackConnection?.team_id || null
      }
    }
  } catch (error) {
    console.error('Error getting connection details:', error)
    return {
      gmail: { connected: false, connectedAt: null, accountId: null },
      slack: { connected: false, connectedAt: null, teamId: null }
    }
  }
}

// Get access token from Nango for a specific connection
export async function getNangoToken(connectionId: string, providerConfigKey: string): Promise<string | null> {
  try {
    const response = await fetch(`${NANGO.host}/connection/${connectionId}`, {
      headers: {
        'Authorization': `Bearer ${NANGO.secret}`,
        'Provider-Config-Key': providerConfigKey
      }
    })

    if (!response.ok) {
      console.error('Failed to get Nango token:', response.statusText)
      return null
    }

    const data = await response.json()
    return data.credentials?.access_token || null
  } catch (error) {
    console.error('Error getting Nango token:', error)
    return null
  }
}

// Get valid Gmail token for user
export async function getValidGmailToken(userId: string): Promise<string | null> {
  try {
    const connectionId = `${userId}-google`
    return await getNangoToken(connectionId, 'google')
  } catch (error) {
    console.error('Error getting valid Gmail token:', error)
    return null
  }
}

// Get valid Slack token for user
export async function getValidSlackToken(userId: string): Promise<string | null> {
  try {
    const connectionId = `${userId}-slack`
    return await getNangoToken(connectionId, 'slack')
  } catch (error) {
    console.error('Error getting valid Slack token:', error)
    return null
  }
}

// Helper functions for compatibility with existing code
export function isGmailConnected(connections: ConnectionStatus): boolean {
  return connections.gmail
}

export function isSlackConnected(connections: ConnectionStatus): boolean {
  return connections.slack
}