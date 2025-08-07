import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [GMAIL OAUTH] Initiating OAuth flow...')
    
    // Check environment variables
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('❌ [GMAIL OAUTH] Missing GOOGLE_CLIENT_ID')
      return NextResponse.redirect(new URL('/prototype?error=missing_config', request.url))
    }

    // Generate secure state parameter
    const state = crypto.randomUUID()
    
    // Build Gmail OAuth URL with CORRECT endpoint
    const gmailOAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    
    gmailOAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!)
    gmailOAuthUrl.searchParams.set('redirect_uri', 'https://napoleonai.app/auth/gmail/callback')
    gmailOAuthUrl.searchParams.set('response_type', 'code')
    gmailOAuthUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile')
    gmailOAuthUrl.searchParams.set('access_type', 'offline')
    gmailOAuthUrl.searchParams.set('prompt', 'consent')
    gmailOAuthUrl.searchParams.set('state', state)

    console.log('✅ [GMAIL OAUTH] Redirecting to:', gmailOAuthUrl.toString())
    
    const response = NextResponse.redirect(gmailOAuthUrl)
    
    // Store state for verification
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })
    
    return response
    
  } catch (error) {
    console.error('❌ [GMAIL OAUTH] Initialization error:', error)
    return NextResponse.redirect(new URL('/prototype?error=oauth_init_failed', request.url))
  }
}