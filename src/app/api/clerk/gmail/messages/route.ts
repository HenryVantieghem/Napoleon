import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  console.log('Gmail messages API called')
  
  try {
    const { userId } = auth()
    if (!userId) {
      console.log('No userId found')
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Please sign in to access Gmail data'
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

    // Find Google external account from Clerk Social Connections
    const googleAccount = user.externalAccounts?.find(
      account => account.provider === 'google'
    )

    console.log('External accounts:', user.externalAccounts?.map(acc => ({ provider: acc.provider, verified: acc.verification?.status })))

    if (!googleAccount) {
      console.log('No Google account found')
      return NextResponse.json({ 
        error: 'Gmail not connected',
        message: 'Please connect Gmail using the Connect Gmail button first.',
        connected: false,
        requiresConnection: true
      }, { status: 400 })
    }

    if (googleAccount.verification?.status !== 'verified') {
      console.log('Google account not verified:', googleAccount.verification?.status)
      return NextResponse.json({ 
        error: 'Gmail connection not verified',
        message: 'Please complete Gmail connection verification.',
        connected: false
      }, { status: 400 })
    }

    console.log('Google account verified, fetching token...')

    // Get access token from Clerk's OAuth token management
    let accessToken = null
    let tokenData = null

    // Try primary token URL first
    const tokenUrl = `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/oauth_google`
    console.log('Fetching token from:', tokenUrl)
    
    const tokenResponse = await fetch(tokenUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (tokenResponse.ok) {
      tokenData = await tokenResponse.json()
      console.log('Primary token response:', tokenData)
      accessToken = tokenData[0]?.token
    } else {
      console.log('Primary token failed, trying alternative...')
      
      // Try alternative token URL
      const altTokenUrl = `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/google`
      console.log('Trying alternative token URL:', altTokenUrl)
      
      const altTokenResponse = await fetch(altTokenUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (altTokenResponse.ok) {
        tokenData = await altTokenResponse.json()
        console.log('Alternative token response:', tokenData)
        accessToken = tokenData[0]?.token
      } else {
        const errorText = await altTokenResponse.text()
        console.error('Both token URLs failed:', errorText)
        throw new Error(`Clerk token API error: ${altTokenResponse.status} ${altTokenResponse.statusText}`)
      }
    }

    if (!accessToken) {
      console.log('No access token in response')
      return NextResponse.json({ 
        error: 'No access token available',
        message: 'Please reconnect Gmail to refresh your access token.',
        connected: false
      }, { status: 400 })
    }

    console.log('Access token obtained, fetching Gmail messages...')

    // Calculate 7 days ago timestamp for Gmail API
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const afterTimestamp = Math.floor(sevenDaysAgo.getTime() / 1000)

    // Fetch Gmail messages from last 7 days
    const gmailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&labelIds=INBOX&q=after:${afterTimestamp}`
    console.log('Fetching from Gmail API:', gmailUrl)
    
    const gmailResponse = await fetch(gmailUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!gmailResponse.ok) {
      const errorText = await gmailResponse.text()
      console.error('Gmail API failed:', gmailResponse.status, errorText)
      
      if (gmailResponse.status === 401) {
        return NextResponse.json({ 
          error: 'Gmail access token expired',
          message: 'Please reconnect Gmail to refresh access.',
          connected: false
        }, { status: 401 })
      }
      throw new Error(`Gmail API error: ${gmailResponse.status} ${gmailResponse.statusText}`)
    }

    const gmailData = await gmailResponse.json()
    console.log('Gmail data received:', gmailData.messages?.length || 0, 'messages')
    
    // Get detailed message information
    const messages = []
    if (gmailData.messages && gmailData.messages.length > 0) {
      console.log('Fetching detailed message data...')
      
      for (const msg of gmailData.messages.slice(0, 25)) { // Limit for performance
        try {
          const messageResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          )
          
          if (messageResponse.ok) {
            const messageData = await messageResponse.json()
            
            // Extract headers safely
            const headers = messageData.payload?.headers || []
            const fromHeader = headers.find((h: any) => h.name === 'From')
            const subjectHeader = headers.find((h: any) => h.name === 'Subject')
            
            messages.push({
              id: messageData.id,
              snippet: messageData.snippet || 'No preview available',
              internalDate: messageData.internalDate,
              from: fromHeader?.value || 'Unknown Sender',
              subject: subjectHeader?.value || 'No Subject',
              threadId: messageData.threadId
            })
          }
        } catch (msgError) {
          console.error('Error fetching message details for', msg.id, ':', msgError)
        }
      }
    }
    
    console.log('Successfully processed', messages.length, 'Gmail messages')
    
    return NextResponse.json({
      success: true,
      connected: true,
      messageCount: messages.length,
      messages,
      user: {
        email: googleAccount.emailAddress,
        provider: 'google',
        verified: true
      },
      metadata: {
        source: 'clerk_social_connections',
        timeRange: '7_days',
        fetchedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Gmail messages API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch Gmail messages',
      details: error instanceof Error ? error.message : 'Unknown error',
      connected: false
    }, { status: 500 })
  }
}
