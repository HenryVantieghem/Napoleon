import { auth, currentUser } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export async function GET() {
  console.log('Slack messages API called')
  
  try {
    const { userId } = auth()
    if (!userId) {
      console.log('No userId found')
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Please sign in to access Slack data'
      }, { status: 401 })
    }

    const user = await currentUser()
    if (!user) {
      console.log('No user found')
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    console.log('User found:', user.id)

    // Find Slack external account from Clerk Social Connections
    const slackAccount = user.externalAccounts?.find(
      account => account.provider === 'slack' || account.provider === 'oauth_slack'
    )

    console.log('External accounts:', user.externalAccounts?.map(acc => ({ provider: acc.provider, verified: acc.verification?.status })))

    if (!slackAccount) {
      console.log('No Slack account found')
      return NextResponse.json({ 
        error: 'Slack not connected',
        message: 'Please connect Slack using the Connect Slack button first.',
        connected: false,
        requiresConnection: true
      }, { status: 400 })
    }

    if (slackAccount.verification?.status !== 'verified') {
      console.log('Slack account not verified:', slackAccount.verification?.status)
      return NextResponse.json({ 
        error: 'Slack connection not verified',
        message: 'Please complete Slack connection verification.',
        connected: false
      }, { status: 400 })
    }

    console.log('Slack account verified, fetching token...')

    // Get access token from Clerk's OAuth token management
    try {
      const tokenUrl = `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/oauth_slack`
      console.log('Fetching token from:', tokenUrl)
      
      const tokenResponse = await fetch(tokenUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('Clerk Slack token API failed:', tokenResponse.status, errorText)
        throw new Error(`Clerk token API error: ${tokenResponse.status} ${tokenResponse.statusText}`)
      }

      const tokenData = await tokenResponse.json()
      console.log('Token response:', tokenData)
      
      const accessToken = tokenData[0]?.token

      if (!accessToken) {
        console.log('No access token in response')
        return NextResponse.json({ 
          error: 'No access token available',
          message: 'Please reconnect Slack to refresh your access token.',
          connected: false
        }, { status: 400 })
      }

      console.log('Access token obtained, fetching Slack channels...')

      // Calculate 7 days ago timestamp for Slack API
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const oldest = Math.floor(sevenDaysAgo.getTime() / 1000)

      // Get user's accessible channels
      const channelsUrl = 'https://slack.com/api/conversations.list?limit=20&types=public_channel,private_channel'
      console.log('Fetching channels from Slack API:', channelsUrl)
      
      const channelsResponse = await fetch(channelsUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!channelsResponse.ok) {
        const errorText = await channelsResponse.text()
        console.error('Slack channels API failed:', channelsResponse.status, errorText)
        throw new Error(`Slack channels API error: ${channelsResponse.status} ${channelsResponse.statusText}`)
      }

      const channelsData = await channelsResponse.json()
      console.log('Slack channels response:', channelsData)
      
      if (!channelsData.ok) {
        console.error('Slack API error:', channelsData.error)
        throw new Error(`Slack API error: ${channelsData.error}`)
      }

      console.log('Found', channelsData.channels?.length || 0, 'channels')

      // Get messages from channels (last 7 days)
      const allMessages = []
      if (channelsData.channels && channelsData.channels.length > 0) {
        console.log('Fetching message history from channels...')
        
        for (const channel of channelsData.channels.slice(0, 10)) { // Limit channels for performance
          try {
            const historyUrl = `https://slack.com/api/conversations.history?channel=${channel.id}&limit=15&oldest=${oldest}`
            const historyResponse = await fetch(historyUrl, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            })
            
            if (historyResponse.ok) {
              const historyData = await historyResponse.json()
              
              if (historyData.ok && historyData.messages) {
                console.log(`Found ${historyData.messages.length} messages in #${channel.name}`)
                
                historyData.messages.forEach((msg: any) => {
                  // Skip bot messages and system messages
                  if (!msg.bot_id && msg.type === 'message' && msg.text) {
                    allMessages.push({
                      ...msg,
                      channel: channel.name,
                      channelId: channel.id
                    })
                  }
                })
              }
            }
          } catch (channelError) {
            console.error(`Error fetching history for channel ${channel.name}:`, channelError)
          }
        }
      }
      
      console.log('Successfully processed', allMessages.length, 'Slack messages')
      
      return NextResponse.json({
        success: true,
        connected: true,
        messageCount: allMessages.length,
        messages: allMessages,
        channelCount: channelsData.channels?.length || 0,
        user: {
          provider: 'slack',
          team: 'Workspace'
        },
        metadata: {
          source: 'clerk_social_connections',
          timeRange: '7_days',
          fetchedAt: new Date().toISOString()
        }
      })

    } catch (tokenError) {
      console.error('Slack token error:', tokenError)
      return NextResponse.json({ 
        error: 'Token access failed',
        message: 'Unable to access Slack token. Please reconnect Slack.',
        connected: false,
        details: tokenError instanceof Error ? tokenError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Slack messages API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch Slack messages',
      details: error instanceof Error ? error.message : 'Unknown error',
      connected: false
    }, { status: 500 })
  }
}
