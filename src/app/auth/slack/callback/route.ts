import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET
const SLACK_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + '/auth/slack/callback'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  console.log('🔄 [SLACK OAUTH] Callback received:', { code: !!code, state: !!state, error })

  // Validate state parameter for CSRF protection
  const storedState = request.cookies.get('slack_oauth_state')?.value
  if (!storedState || state !== storedState) {
    console.error('❌ [SLACK OAUTH] Invalid state parameter')
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/prototype?slack_error=invalid_state`)
  }

  if (error) {
    console.error('❌ [SLACK OAUTH] Error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/prototype?slack_error=${error}`)
  }

  if (!code) {
    console.error('❌ [SLACK OAUTH] No code received')
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/prototype?slack_error=no_code`)
  }

  if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET) {
    console.error('❌ [SLACK OAUTH] Missing client credentials')
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/prototype?slack_error=config_error`)
  }

  try {
    console.log('🔄 [SLACK OAUTH] Exchanging code for token...')
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code,
        redirect_uri: SLACK_REDIRECT_URI,
      }),
    })

    const tokenData = await tokenResponse.json()
    console.log('📦 [SLACK OAUTH] Token response:', {
      ok: tokenData.ok,
      team: tokenData.team?.name,
      user: tokenData.authed_user?.id
    })

    if (!tokenData.ok) {
      console.error('❌ [SLACK OAUTH] Token exchange failed:', tokenData.error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/prototype?slack_error=${tokenData.error}`)
    }

    // Store user access token securely in HTTP-only cookies
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/prototype?slack_connected=true`)
    
    // Clear the OAuth state cookie
    response.cookies.delete('slack_oauth_state')
    
    // Store user access token (for user's channels/DMs)
    if (tokenData.authed_user?.access_token) {
      response.cookies.set('slack_user_token', tokenData.authed_user.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      })
    }

    // Store team info
    if (tokenData.team) {
      response.cookies.set('slack_team_info', JSON.stringify({
        id: tokenData.team.id,
        name: tokenData.team.name
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      })
    }

    // Store user info
    if (tokenData.authed_user) {
      response.cookies.set('slack_user_info', JSON.stringify({
        id: tokenData.authed_user.id,
        scope: tokenData.authed_user.scope
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      })
    }

    console.log('✅ [SLACK OAUTH] Successfully stored user tokens')
    return response

  } catch (error) {
    console.error('❌ [SLACK OAUTH] Callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/prototype?slack_error=callback_failed`)
  }
}