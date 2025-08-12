import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NANGO } from '@/lib/nango'

export const runtime = 'nodejs'

interface SlackChannel {
  id: string
  name: string
  is_channel: boolean
  is_group: boolean
  is_im: boolean
}

interface SlackMessage {
  type: string
  user: string
  text: string
  ts: string
  thread_ts?: string
  bot_id?: string
  subtype?: string
}

interface SlackUser {
  id: string
  name: string
  real_name: string
  profile: {
    display_name?: string
    real_name?: string
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = getSupabaseServerClient(cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has Slack connection
    const { data: connection } = await supabase
      .from('nango_connections')
      .select('connection_id')
      .eq('user_id', user.id)
      .eq('provider', 'slack')
      .single()

    if (!connection) {
      return NextResponse.json({ messages: [] })
    }

    const connectionId = connection.connection_id
    const sevenDaysAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000)

    // Get list of conversations via Nango proxy
    const channelsUrl = `${NANGO.host}/proxy`
    const channelsBody = {
      connection_id: connectionId,
      provider_config_key: 'slack',
      endpoint: 'https://slack.com/api/conversations.list',
      params: {
        exclude_archived: true,
        types: 'public_channel,private_channel,im',
        limit: 50
      },
      method: 'GET'
    }

    const channelsResponse = await fetch(channelsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NANGO.secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(channelsBody)
    })

    if (!channelsResponse.ok) {
      console.error('Nango channels request failed:', channelsResponse.statusText)
      return NextResponse.json({ messages: [] })
    }

    const channelsData = await channelsResponse.json()
    const channels: SlackChannel[] = channelsData.channels || []

    if (channels.length === 0) {
      return NextResponse.json({ messages: [] })
    }

    // Fetch messages from each channel
    const messages = []
    const batchSize = 5
    const limitedChannels = channels.slice(0, 20) // Limit channels for performance

    for (let i = 0; i < limitedChannels.length; i += batchSize) {
      const batch = limitedChannels.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (channel) => {
        try {
          // Get channel history via Nango proxy
          const historyUrl = `${NANGO.host}/proxy`
          const historyBody = {
            connection_id: connectionId,
            provider_config_key: 'slack',
            endpoint: 'https://slack.com/api/conversations.history',
            params: {
              channel: channel.id,
              oldest: sevenDaysAgo.toString(),
              limit: 20,
              inclusive: true
            },
            method: 'GET'
          }

          const historyResponse = await fetch(historyUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${NANGO.secret}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(historyBody)
          })

          if (!historyResponse.ok) {
            console.error(`Failed to fetch history for channel ${channel.id}:`, historyResponse.statusText)
            return []
          }

          const historyData = await historyResponse.json()
          const slackMessages: SlackMessage[] = historyData.messages || []

          // Process messages and get user info
          const channelMessages = []
          const userCache = new Map<string, SlackUser>()

          for (const slackMessage of slackMessages) {
            if (!slackMessage.text || !slackMessage.ts || !slackMessage.user) continue
            if (slackMessage.bot_id || slackMessage.subtype) continue // Skip bot messages

            // Get user info (with caching)
            let senderName = 'Unknown User'
            if (!userCache.has(slackMessage.user)) {
              try {
                const userUrl = `${NANGO.host}/proxy`
                const userBody = {
                  connection_id: connectionId,
                  provider_config_key: 'slack',
                  endpoint: 'https://slack.com/api/users.info',
                  params: { user: slackMessage.user },
                  method: 'GET'
                }

                const userResponse = await fetch(userUrl, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${NANGO.secret}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(userBody)
                })

                if (userResponse.ok) {
                  const userData = await userResponse.json()
                  userCache.set(slackMessage.user, userData.user)
                }
              } catch (userError) {
                console.warn(`Error fetching user ${slackMessage.user}:`, userError)
              }
            }

            const user = userCache.get(slackMessage.user)
            if (user) {
              senderName = user.profile?.display_name || user.real_name || user.name || 'Unknown User'
            }

            // Determine channel name for sender field
            let channelName = channel.name || 'Unknown Channel'
            if (channel.is_im) {
              channelName = `DM with ${senderName}`
            } else if (channel.is_group) {
              channelName = `Group: ${channelName}`
            } else {
              channelName = `#${channelName}`
            }

            // Create normalized message
            channelMessages.push({
              id: slackMessage.ts,
              provider: 'slack',
              subject: `Message from ${channelName}`,
              sender: channelName, // Use channel name as sender for Slack
              snippet: slackMessage.text,
              received_at: new Date(parseFloat(slackMessage.ts) * 1000).toISOString()
            })
          }

          return channelMessages
        } catch (error) {
          console.error(`Error processing channel ${channel.id}:`, error)
          return []
        }
      })

      const batchResults = await Promise.all(batchPromises)
      const validMessages = batchResults.flat()
      messages.push(...validMessages)
    }

    return NextResponse.json({
      messages,
      totalCount: messages.length,
      source: 'slack',
      fetchedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Slack API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Slack messages' },
      { status: 500 }
    )
  }
}