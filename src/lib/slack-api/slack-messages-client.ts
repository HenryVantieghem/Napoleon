// Slack Messages API Client for Napoleon AI
// Reads user messages using OAuth user tokens

import { cookies } from 'next/headers'
import type { UnifiedMessage } from '@/types/message'

interface SlackMessage {
  type: string
  ts: string
  user?: string
  text?: string
  subtype?: string
  channel?: string
  thread_ts?: string
}

interface SlackChannel {
  id: string
  name: string
  is_private?: boolean
  is_im?: boolean
  is_mpim?: boolean
  is_member?: boolean
}

interface SlackUser {
  id: string
  name: string
  real_name?: string
  profile?: {
    display_name?: string
    email?: string
    image_72?: string
  }
}

interface SlackConversationsResponse {
  ok: boolean
  channels?: SlackChannel[]
  error?: string
  response_metadata?: {
    next_cursor?: string
  }
}

interface SlackHistoryResponse {
  ok: boolean
  messages?: SlackMessage[]
  error?: string
  response_metadata?: {
    next_cursor?: string
  }
}

interface SlackUsersResponse {
  ok: boolean
  user?: SlackUser
  error?: string
}

export class SlackMessagesClient {
  private userToken: string | null = null
  private teamInfo: any = null
  private userInfo: any = null

  constructor(userToken?: string | null, teamInfo?: any, userInfo?: any) {
    // Accept parameters directly or get from cookies in request context
    this.userToken = userToken || null
    this.teamInfo = teamInfo || null
    this.userInfo = userInfo || null
  }

  static fromCookies() {
    // Get tokens from HTTP-only cookies (only works in request context)
    const cookieStore = cookies()
    const userToken = cookieStore.get('slack_user_token')?.value || null
    
    const teamInfoCookie = cookieStore.get('slack_team_info')?.value
    const userInfoCookie = cookieStore.get('slack_user_info')?.value
    
    let teamInfo = null
    let userInfo = null
    
    try {
      teamInfo = teamInfoCookie ? JSON.parse(teamInfoCookie) : null
      userInfo = userInfoCookie ? JSON.parse(userInfoCookie) : null
    } catch (error) {
      console.error('Error parsing Slack cookies:', error)
    }

    return new SlackMessagesClient(userToken, teamInfo, userInfo)
  }

  isConnected(): boolean {
    return !!(this.userToken && this.teamInfo && this.userInfo)
  }

  getConnectionInfo() {
    return {
      connected: this.isConnected(),
      teamName: this.teamInfo?.name || null,
      userId: this.userInfo?.id || null,
      scopes: this.userInfo?.scope?.split(',') || []
    }
  }

  private async makeSlackRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    if (!this.userToken) {
      throw new Error('Slack user token not available')
    }

    const url = new URL(`https://slack.com/api/${endpoint}`)
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.set(key, params[key].toString())
      }
    })

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.userToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Slack API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getConversations(): Promise<SlackChannel[]> {
    console.log('🔄 [SLACK API] Fetching conversations...')
    
    try {
      const allChannels: SlackChannel[] = []
      let cursor: string | undefined

      do {
        const response: SlackConversationsResponse = await this.makeSlackRequest('conversations.list', {
          types: 'public_channel,private_channel,mpim,im',
          exclude_archived: true,
          limit: 200,
          cursor
        })

        if (!response.ok) {
          console.error('❌ [SLACK API] Error fetching conversations:', response.error)
          throw new Error(`Failed to fetch conversations: ${response.error}`)
        }

        if (response.channels) {
          // Filter for channels the user is a member of
          const memberChannels = response.channels.filter(channel => 
            channel.is_member || channel.is_im || channel.is_mpim
          )
          allChannels.push(...memberChannels)
        }

        cursor = response.response_metadata?.next_cursor
      } while (cursor)

      console.log(`✅ [SLACK API] Found ${allChannels.length} accessible conversations`)
      return allChannels
    } catch (error) {
      console.error('❌ [SLACK API] Error fetching conversations:', error)
      throw error
    }
  }

  async getChannelHistory(channelId: string, daysBack: number = 7): Promise<SlackMessage[]> {
    const oldestTimestamp = Math.floor((Date.now() - (daysBack * 24 * 60 * 60 * 1000)) / 1000)
    
    try {
      const allMessages: SlackMessage[] = []
      let cursor: string | undefined

      do {
        const response: SlackHistoryResponse = await this.makeSlackRequest('conversations.history', {
          channel: channelId,
          oldest: oldestTimestamp,
          limit: 200,
          cursor
        })

        if (!response.ok) {
          console.warn(`⚠️ [SLACK API] Error fetching history for ${channelId}: ${response.error}`)
          break
        }

        if (response.messages) {
          // Filter out bot messages and system messages
          const userMessages = response.messages.filter(msg => 
            msg.type === 'message' && 
            !msg.subtype && 
            msg.text && 
            msg.user
          )
          allMessages.push(...userMessages)
        }

        cursor = response.response_metadata?.next_cursor
      } while (cursor)

      return allMessages
    } catch (error) {
      console.warn(`⚠️ [SLACK API] Error fetching history for ${channelId}:`, error)
      return []
    }
  }

  async getUserInfo(userId: string): Promise<SlackUser | null> {
    try {
      const response: SlackUsersResponse = await this.makeSlackRequest('users.info', {
        user: userId
      })

      if (!response.ok || !response.user) {
        return null
      }

      return response.user
    } catch (error) {
      console.warn(`⚠️ [SLACK API] Error fetching user info for ${userId}:`, error)
      return null
    }
  }

  async getRecentMessages(daysBack: number = 7): Promise<UnifiedMessage[]> {
    console.log(`🔄 [SLACK API] Fetching messages from last ${daysBack} days...`)
    
    if (!this.isConnected()) {
      console.log('⚠️ [SLACK API] Not connected, skipping')
      return []
    }

    try {
      const conversations = await this.getConversations()
      const allMessages: UnifiedMessage[] = []
      const userCache = new Map<string, SlackUser>()

      console.log(`🔄 [SLACK API] Processing ${conversations.length} conversations...`)

      // Process channels in batches to avoid rate limits
      const batchSize = 10
      for (let i = 0; i < conversations.length; i += batchSize) {
        const batch = conversations.slice(i, i + batchSize)
        
        await Promise.all(batch.map(async (conversation) => {
          try {
            const messages = await this.getChannelHistory(conversation.id, daysBack)
            
            for (const message of messages) {
              if (!message.user) continue

              // Get user info (with caching)
              let user: SlackUser | undefined = userCache.get(message.user)
              if (!user) {
                const fetchedUser = await this.getUserInfo(message.user)
                if (fetchedUser) {
                  user = fetchedUser
                  userCache.set(message.user, user)
                }
              }

              const unifiedMessage: UnifiedMessage = {
                id: `slack-${message.ts}-${conversation.id}`,
                source: 'slack',
                subject: `#${conversation.name || conversation.id}`,
                from: user?.real_name || user?.name || 'Unknown User',
                timestamp: new Date(parseFloat(message.ts) * 1000),
                snippet: message.text || '',
                channelId: conversation.id,
                channelType: conversation.is_im ? 'im' : conversation.is_mpim ? 'mpim' : 'channel',
                threadTs: message.thread_ts,
                priority: 'normal'
              }

              allMessages.push(unifiedMessage)
            }
          } catch (error) {
            console.warn(`⚠️ [SLACK API] Error processing conversation ${conversation.id}:`, error)
          }
        }))

        // Rate limiting - wait between batches
        if (i + batchSize < conversations.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      // Sort by timestamp (newest first)
      allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

      console.log(`✅ [SLACK API] Retrieved ${allMessages.length} messages from ${conversations.length} conversations`)
      return allMessages

    } catch (error) {
      console.error('❌ [SLACK API] Error fetching messages:', error)
      throw error
    }
  }
}

// Export the class (no singleton since it depends on request context)