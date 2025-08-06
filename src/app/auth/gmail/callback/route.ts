import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Gmail OAuth callback started')
    const { userId } = await auth()
    const { searchParams } = new URL(request.url)
    
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    console.log('OAuth params:', { code: !!code, state, error, userId })

    if (error) {
      console.error('Gmail OAuth error:', error)
      return NextResponse.redirect(new URL(`/prototype?error=gmail_oauth_${error}`, request.url))
    }

    if (!code) {
      console.error('No OAuth code received')
      return NextResponse.redirect(new URL('/prototype?error=no_oauth_code', request.url))
    }

    // Check environment variables
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Missing Google OAuth environment variables')
      return NextResponse.redirect(new URL('/prototype?error=missing_oauth_config', request.url))
    }

    // Exchange code for access token
    console.log('Exchanging code for tokens...')
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/gmail/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', tokenResponse.status, errorData)
      return NextResponse.redirect(new URL('/prototype?error=token_exchange_failed', request.url))
    }

    const tokens = await tokenResponse.json()
    console.log('OAuth tokens received:', { access_token: !!tokens.access_token, refresh_token: !!tokens.refresh_token })
    
    // TODO: Store tokens securely (in production, use a database)
    // For now, we'll indicate successful connection
    
    return NextResponse.redirect(new URL('/prototype?gmail=connected', request.url))
  } catch (error) {
    console.error('Gmail OAuth callback error:', error)
    return NextResponse.redirect(new URL('/prototype?error=oauth_callback_failed', request.url))
  }
}