import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this OAuth callback route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 [OAUTH CALLBACK] Gmail OAuth callback started')
    console.log('🌐 [OAUTH CALLBACK] Request URL:', request.url)
    
    const { searchParams } = new URL(request.url)
    
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    console.log('📋 [OAUTH CALLBACK] OAuth params:', { code: !!code, state, error })
    
    // Log environment variables for debugging
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://napoleonai.app';
    const redirectUri = `${appUrl}/auth/gmail/callback`;
    
    console.log('🔍 [OAUTH CALLBACK] Environment check:');
    console.log('  NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
    console.log('  Computed App URL:', appUrl);
    console.log('  Redirect URI for token exchange:', redirectUri);

    if (error) {
      console.error('Gmail OAuth error:', error)
      return NextResponse.redirect(new URL(`/prototype?error=gmail_oauth_${error}`, request.url))
    }

    if (!code) {
      console.error('No OAuth code received')
      return NextResponse.redirect(new URL('/prototype?error=no_oauth_code', request.url))
    }

    // Validate state parameter for CSRF protection
    const storedState = request.cookies.get('oauth_state')?.value
    if (!storedState || state !== storedState) {
      console.error('❌ [OAUTH CALLBACK] Invalid state parameter')
      return NextResponse.redirect(new URL('/prototype?error=invalid_state', request.url))
    }

    // Check environment variables
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Missing Google OAuth environment variables')
      return NextResponse.redirect(new URL('/prototype?error=missing_oauth_config', request.url))
    }

    // Exchange code for access token
    console.log('🔄 [OAUTH CALLBACK] Exchanging code for tokens...')
    
    const tokenExchangeData = {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET ? '[REDACTED]' : 'MISSING',
      code: code ? '[REDACTED]' : 'MISSING',
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    };
    
    console.log('📤 [OAUTH CALLBACK] Token exchange data:', tokenExchangeData);
    
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
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('🚨 [OAUTH CALLBACK] Token exchange failed:', tokenResponse.status, errorData)
      
      // Check for redirect_uri_mismatch specifically
      if (errorData.includes('redirect_uri_mismatch')) {
        console.error('❌ [OAUTH CALLBACK] REDIRECT URI MISMATCH ERROR!')
        console.error('   Expected by Google: [Check Google Cloud Console]')
        console.error('   Sent by our app:', redirectUri)
        console.error('   Full error response:', errorData)
        return NextResponse.redirect(new URL('/prototype?error=redirect_uri_mismatch', request.url))
      }
      
      return NextResponse.redirect(new URL('/prototype?error=token_exchange_failed', request.url))
    }

    const tokens = await tokenResponse.json()
    console.log('✅ [OAUTH CALLBACK] OAuth tokens received:', { 
      access_token: !!tokens.access_token, 
      refresh_token: !!tokens.refresh_token,
      expires_in: tokens.expires_in,
      scope: tokens.scope 
    })
    
    // Store tokens in secure HTTP-only cookie for user session
    // This allows the Gmail client to use the tokens for API calls
    const response = NextResponse.redirect(new URL('/prototype?gmail=connected', request.url))
    
    // Clear the OAuth state cookie
    response.cookies.delete('oauth_state')
    
    // Calculate token expiry time
    const expiryTime = new Date(Date.now() + (tokens.expires_in || 3600) * 1000).getTime();
    
    // Set secure cookies with OAuth tokens
    if (tokens.access_token) {
      response.cookies.set('gmail_access_token', tokens.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: tokens.expires_in || 3600, // Default 1 hour
        path: '/'
      })
    }
    
    if (tokens.refresh_token) {
      response.cookies.set('gmail_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year (refresh tokens are long-lived)
        path: '/'
      })
      console.log('🎉 [OAUTH CALLBACK] Refresh token received and stored!')
    } else {
      console.log('⚠️ [OAUTH CALLBACK] No refresh token received - user may need to re-authenticate')
    }
    
    // Store token expiry time
    response.cookies.set('gmail_token_expiry', expiryTime.toString(), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })
    
    console.log('🍪 [OAUTH CALLBACK] Tokens stored in secure cookies with expiry tracking')
    
    return response
  } catch (error) {
    console.error('Gmail OAuth callback error:', error)
    return NextResponse.redirect(new URL('/prototype?error=oauth_callback_failed', request.url))
  }
}