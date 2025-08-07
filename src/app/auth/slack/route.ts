import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [SLACK OAUTH] Initiating OAuth flow...')
    
    // Check environment variables
    if (!process.env.SLACK_CLIENT_ID) {
      console.error('❌ [SLACK OAUTH] Missing SLACK_CLIENT_ID')
      return NextResponse.redirect(new URL('/prototype?error=missing_slack_config', request.url))
    }

    // Generate secure state parameter
    const state = crypto.randomUUID()
    
    // Build Slack OAuth URL
    const slackOAuthUrl = new URL('https://slack.com/oauth/v2/authorize')
    
    slackOAuthUrl.searchParams.set('client_id', process.env.SLACK_CLIENT_ID!)
    slackOAuthUrl.searchParams.set('scope', 'channels:history,groups:history,im:history,users:read,channels:read,groups:read')
    slackOAuthUrl.searchParams.set('redirect_uri', 'https://napoleonai.app/auth/slack/callback')
    slackOAuthUrl.searchParams.set('response_type', 'code')
    slackOAuthUrl.searchParams.set('state', state)
    slackOAuthUrl.searchParams.set('user_scope', 'channels:history,groups:history,im:history,users:read')

    console.log('✅ [SLACK OAUTH] Redirecting to:', slackOAuthUrl.toString())
    
    const response = NextResponse.redirect(slackOAuthUrl)
    
    // Store state for verification
    response.cookies.set('slack_oauth_state', state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })
    
    return response
    
  } catch (error) {
    console.error('❌ [SLACK OAUTH] Initialization error:', error)
    return NextResponse.redirect(new URL('/prototype?error=slack_oauth_init_failed', request.url))
  }
}