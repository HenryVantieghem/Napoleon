import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Please sign in to access Gmail data'
      }, { status: 401 })
    }

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Find Google external account from Clerk Social Connections
    const googleAccount = user.externalAccounts?.find(
      account => account.provider === 'google'
    )

    if (!googleAccount) {
      return NextResponse.json({ 
        error: 'Gmail not connected',
        message: 'Please connect Gmail using the Connect Gmail button first.',
        connected: false,
        requiresConnection: true
      }, { status: 400 })
    }

    // Verify account is verified
    if (googleAccount.verification?.status !== 'verified') {
      return NextResponse.json({ 
        error: 'Gmail connection not verified',
        message: 'Please complete Gmail connection verification.',
        connected: false
      }, { status: 400 })
    }

    // Get access token from Clerk's token management
    try {
      const tokenResponse = await fetch(
        `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/google`,
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
          message: 'Please reconnect Gmail to refresh your access token.',
          connected: false
        }, { status: 400 })
      }

      // Fetch Gmail messages using Clerk-managed token
      const gmailResponse = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&labelIds=INBOX',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!gmailResponse.ok) {
        if (gmailResponse.status === 401) {
          return NextResponse.json({ 
            error: 'Gmail access token expired',
            message: 'Please reconnect Gmail to refresh access.',
            connected: false
          }, { status: 401 })
        }
        throw new Error(`Gmail API error: ${gmailResponse.statusText}`)
      }

      const gmailData = await gmailResponse.json()
      
      return NextResponse.json({
        success: true,
        connected: true,
        messageCount: gmailData.messages?.length || 0,
        messages: gmailData.messages || [],
        user: {
          email: googleAccount.emailAddress,
          provider: 'google',
          verified: true,
          connectedAt: new Date().toISOString()
        },
        metadata: {
          source: 'clerk_social_connections',
          tokenManagement: 'clerk_managed'
        }
      })

    } catch (tokenError) {
      console.error('Gmail token error:', tokenError)
      return NextResponse.json({ 
        error: 'Token access failed',
        message: 'Unable to access Gmail token. Please reconnect Gmail.',
        connected: false
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Gmail API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch Gmail data',
      details: error instanceof Error ? error.message : 'Unknown error',
      connected: false
    }, { status: 500 })
  }
}