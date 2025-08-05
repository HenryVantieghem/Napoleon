import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.redirect(new URL('/?error=auth_required', request.url))
    }

    // Redirect to Gmail OAuth (this would be handled by Clerk's OAuth provider)
    const gmailOAuthUrl = new URL('https://accounts.google.com/oauth2/auth')
    
    gmailOAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!)
    gmailOAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/auth/gmail/callback`)
    gmailOAuthUrl.searchParams.set('response_type', 'code')
    gmailOAuthUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/gmail.readonly')
    gmailOAuthUrl.searchParams.set('access_type', 'offline')
    gmailOAuthUrl.searchParams.set('prompt', 'consent')
    gmailOAuthUrl.searchParams.set('state', userId)

    return NextResponse.redirect(gmailOAuthUrl)
  } catch (error) {
    console.error('Gmail OAuth initialization error:', error)
    return NextResponse.redirect(new URL('/?error=oauth_init_failed', request.url))
  }
}