import { auth, currentUser } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Please sign in to access Slack data'
      }, { status: 401 })
    }

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Find Slack external account from Clerk Social Connections
    const slackAccount = user.externalAccounts?.find(
      account => account.provider === 'slack' || account.provider === 'oauth_slack'
    )

    if (!slackAccount) {
      return NextResponse.json({ 
        error: 'Slack not connected',
        message: 'Please connect Slack using the Connect Slack button first.',
        connected: false,
        requiresConnection: true
      }, { status: 400 })
    }

    // Verify account is verified
    if (slackAccount.verification?.status !== 'verified') {
      return NextResponse.json({ 
        error: 'Slack connection not verified',
        message: 'Please complete Slack connection verification.',
        connected: false
      }, { status: 400 })
    }

    // Get access token from Clerk's token management
    try {
      const tokenResponse = await fetch(
        `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/oauth_slack`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!tokenResponse.ok) {
        throw new Error(`Clerk token API error: ${tokenResponse.statusText}`)
      }

      const tokenData = await tokenResponse.json()
      const accessToken = tokenData[0]?.token

      if (!accessToken) {
        return NextResponse.json({ 
          error: 'No access token available',
          message: 'Please reconnect Slack to refresh your access token.',
          connected: false
        }, { status: 400 })
      }

      // Fetch Slack conversations using Clerk-managed token
      const slackResponse = await fetch(
        'https://slack.com/api/conversations.list?limit=10&types=public_channel,private_channel',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!slackResponse.ok) {
        if (slackResponse.status === 401) {
          return NextResponse.json({ 
            error: 'Slack access token expired',
            message: 'Please reconnect Slack to refresh access.',
            connected: false
          }, { status: 401 })
        }
        throw new Error(`Slack API error: ${slackResponse.statusText}`)
      }

      const slackData = await slackResponse.json()
      
      if (!slackData.ok) {
        throw new Error(`Slack API error: ${slackData.error}`)
      }
      
      return NextResponse.json({
        success: true,
        connected: true,
        channelCount: slackData.channels?.length || 0,
        channels: slackData.channels || [],
        user: {
          provider: 'slack',
          team: slackData.team || 'Workspace',
          connectedAt: slackAccount.createdAt
        },
        metadata: {
          source: 'clerk_social_connections',
          tokenManagement: 'clerk_managed'
        }
      })

    } catch (tokenError) {
      console.error('Slack token error:', tokenError)
      return NextResponse.json({ 
        error: 'Token access failed',
        message: 'Unable to access Slack token. Please reconnect Slack.',
        connected: false
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Slack API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch Slack data',
      details: error instanceof Error ? error.message : 'Unknown error',
      connected: false
    }, { status: 500 })
  }
}