import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    const { searchParams } = new URL(request.url)
    
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('Gmail OAuth error:', error)
      return NextResponse.redirect(new URL(`/dashboard?error=gmail_oauth_${error}`, request.url))
    }

    if (!code || !state || state !== userId) {
      return NextResponse.redirect(new URL('/dashboard?error=invalid_oauth_response', request.url))
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/gmail/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange OAuth code for token')
    }

    const tokens = await tokenResponse.json()
    
    // TODO: Store tokens securely (in production, use a database)
    // For now, we'll rely on Clerk's built-in OAuth handling
    
    return NextResponse.redirect(new URL('/dashboard?gmail_connected=true', request.url))
  } catch (error) {
    console.error('Gmail OAuth callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=oauth_callback_failed', request.url))
  }
}