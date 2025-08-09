import { cookies } from 'next/headers'

export interface ConnectionStatus {
  gmail: {
    connected: boolean
    status: 'connected' | 'disconnected' | 'expired'
    hasRefreshToken: boolean
  }
  slack: {
    connected: boolean
    status: 'connected' | 'disconnected'
    teamInfo?: {
      id: string
      name: string
    }
  }
}

export async function getConnectionStatus(): Promise<ConnectionStatus> {
  try {
    const cookieStore = cookies()
    
    // Check Gmail connection
    const gmailAccessToken = cookieStore.get('gmail_access_token')?.value
    const gmailRefreshToken = cookieStore.get('gmail_refresh_token')?.value
    const gmailTokenExpiry = cookieStore.get('gmail_token_expiry')?.value
    
    let gmailStatus: 'connected' | 'disconnected' | 'expired' = 'disconnected'
    
    if (gmailAccessToken) {
      if (gmailTokenExpiry) {
        const expiryTime = parseInt(gmailTokenExpiry)
        const now = Date.now()
        
        if (now < expiryTime) {
          gmailStatus = 'connected'
        } else if (gmailRefreshToken) {
          // Token expired but we have refresh token - still considered connected
          gmailStatus = 'connected'
        } else {
          gmailStatus = 'expired'
        }
      } else {
        gmailStatus = 'connected'
      }
    }
    
    // Check Slack connection
    const slackUserToken = cookieStore.get('slack_user_token')?.value
    const slackTeamInfo = cookieStore.get('slack_team_info')?.value
    
    let teamInfo = undefined
    if (slackTeamInfo) {
      try {
        teamInfo = JSON.parse(slackTeamInfo)
      } catch (error) {
        console.warn('Failed to parse Slack team info:', error)
      }
    }
    
    const slackStatus = slackUserToken ? 'connected' : 'disconnected'
    
    console.log('🔍 [CONNECTION STATUS] Status check:', {
      gmail: {
        hasToken: !!gmailAccessToken,
        hasRefresh: !!gmailRefreshToken,
        status: gmailStatus
      },
      slack: {
        hasToken: !!slackUserToken,
        hasTeamInfo: !!teamInfo,
        status: slackStatus
      }
    })
    
    return {
      gmail: {
        connected: gmailStatus === 'connected',
        status: gmailStatus,
        hasRefreshToken: !!gmailRefreshToken
      },
      slack: {
        connected: slackStatus === 'connected',
        status: slackStatus,
        teamInfo
      }
    }
    
  } catch (error) {
    console.error('❌ [CONNECTION STATUS] Error checking connection status:', error)
    
    // Return disconnected state on error
    return {
      gmail: {
        connected: false,
        status: 'disconnected',
        hasRefreshToken: false
      },
      slack: {
        connected: false,
        status: 'disconnected'
      }
    }
  }
}