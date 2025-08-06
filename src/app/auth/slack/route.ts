import { NextRequest, NextResponse } from 'next/server'

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID
const SLACK_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + '/auth/slack/callback'

export async function GET(request: NextRequest) {
  console.log('🔄 [SLACK OAUTH] Initiating OAuth flow...')

  if (!SLACK_CLIENT_ID) {
    console.error('❌ [SLACK OAUTH] Missing SLACK_CLIENT_ID')
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/prototype?slack_error=config_error`)
  }

  // User scopes for accessing user's channels and messages
  const scopes = [
    'channels:history',     // Read messages from public channels
    'groups:history',       // Read messages from private channels
    'im:history',           // Read direct messages
    'mpim:history',         // Read group direct messages
    'users:read',           // Read user profile information
    'channels:read',        // List public channels
    'groups:read',          // List private channels
    'im:read',              // List direct message conversations
    'mpim:read'             // List group direct message conversations
  ].join(',')

  // Generate state parameter for CSRF protection
  const state = crypto.randomUUID()

  const authUrl = new URL('https://slack.com/oauth/v2/authorize')
  authUrl.searchParams.set('client_id', SLACK_CLIENT_ID)
  authUrl.searchParams.set('scope', scopes)
  authUrl.searchParams.set('redirect_uri', SLACK_REDIRECT_URI)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('user_scope', scopes) // User-level permissions

  console.log('🔗 [SLACK OAUTH] Redirecting to Slack auth:', {
    client_id: SLACK_CLIENT_ID,
    scopes,
    redirect_uri: SLACK_REDIRECT_URI,
    state
  })

  // Store state in cookie for validation
  const response = NextResponse.redirect(authUrl.toString())
  response.cookies.set('slack_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
  })

  return response
}