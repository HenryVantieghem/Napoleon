import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

// Enhanced OAuth error codes for better user experience
const OAUTH_ERRORS = {
  ACCESS_DENIED: 'access_denied',
  INVALID_GRANT: 'invalid_grant', 
  INVALID_REQUEST: 'invalid_request',
  SERVER_ERROR: 'server_error',
  TEMPORARILY_UNAVAILABLE: 'temporarily_unavailable'
} as const;

// User-friendly error messages
const ERROR_MESSAGES = {
  [OAUTH_ERRORS.ACCESS_DENIED]: 'Gmail access was denied. Please try connecting again and grant the necessary permissions.',
  [OAUTH_ERRORS.INVALID_GRANT]: 'The authorization code has expired. Please try connecting to Gmail again.',
  [OAUTH_ERRORS.INVALID_REQUEST]: 'Invalid connection request. Please try connecting to Gmail again.',
  [OAUTH_ERRORS.SERVER_ERROR]: 'Gmail servers are temporarily unavailable. Please try again in a few minutes.',
  [OAUTH_ERRORS.TEMPORARILY_UNAVAILABLE]: 'Gmail service is temporarily unavailable. Please try again later.',
  default: 'Unable to connect to Gmail. Please try again or contact support if the issue persists.'
} as const;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This is the user ID
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    console.log('🔐 Gmail OAuth callback received:', {
      hasCode: !!code,
      hasState: !!state, 
      error,
      errorDescription,
      timestamp: new Date().toISOString()
    });
    
    // Handle OAuth errors from Google
    if (error) {
      console.error('Gmail OAuth error from Google:', { error, errorDescription });
      const userMessage = ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.default;
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=gmail_oauth_error&message=${encodeURIComponent(userMessage)}&code=${error}`;
      return NextResponse.redirect(redirectUrl);
    }
    
    // Validate required parameters
    if (!code) {
      console.error('Gmail OAuth callback missing authorization code');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=gmail_oauth_error&message=${encodeURIComponent('Authorization code missing. Please try connecting again.')}&code=missing_code`);
    }
    
    if (!state) {
      console.error('Gmail OAuth callback missing state parameter');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=gmail_oauth_error&message=${encodeURIComponent('Invalid request state. Please try connecting again.')}&code=missing_state`);
    }

    // Exchange code for tokens with timeout and retry logic
    console.log('🔄 Exchanging authorization code for Gmail tokens...');
    
    let tokenResponse: Response;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        break; // Success, exit retry loop
        
      } catch (fetchError: any) {
        console.warn(`Gmail token exchange attempt ${attempts}/${maxAttempts} failed:`, fetchError.message);
        
        if (attempts === maxAttempts) {
          const isTimeout = fetchError.name === 'AbortError';
          const message = isTimeout 
            ? 'Gmail connection timed out. Please check your internet connection and try again.'
            : 'Unable to connect to Gmail servers. Please try again in a few minutes.';
          
          return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=gmail_oauth_error&message=${encodeURIComponent(message)}&code=connection_failed`);
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts - 1) * 1000));
      }
    }

    const tokens = await tokenResponse!.json();
    
    console.log('📝 Token exchange response:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in,
      error: tokens.error,
      attempt: attempts
    });

    if (tokens.error) {
      console.error('Gmail token exchange error:', {
        error: tokens.error,
        description: tokens.error_description,
        attempts
      });
      
      const userMessage = ERROR_MESSAGES[tokens.error as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.default;
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=gmail_oauth_error&message=${encodeURIComponent(userMessage)}&code=${tokens.error}`);
    }

    // Store tokens in Clerk user metadata with enhanced error handling
    console.log('💾 Storing Gmail tokens in user metadata...');
    
    try {
      await clerkClient.users.updateUserMetadata(state, {
        privateMetadata: {
          gmail_access_token: tokens.access_token,
          gmail_refresh_token: tokens.refresh_token,
          gmail_expires_at: Date.now() + (tokens.expires_in * 1000),
          gmail_connected_at: Date.now(),
          gmail_token_scope: tokens.scope || 'https://www.googleapis.com/auth/gmail.readonly',
        },
      });
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ Gmail OAuth completed successfully in ${totalTime}ms`);
      
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?connected=gmail&timestamp=${Date.now()}`);
      
    } catch (metadataError: any) {
      console.error('Failed to store Gmail tokens:', metadataError);
      
      // This is a critical error - we have tokens but can't store them
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=gmail_oauth_error&message=${encodeURIComponent('Gmail connected but failed to save credentials. Please try connecting again.')}&code=metadata_storage_failed`);
    }
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error('🚨 Gmail OAuth callback critical error:', {
      error: error.message,
      stack: error.stack,
      totalTime,
      timestamp: new Date().toISOString()
    });
    
    // Enhanced error response with user-friendly message
    const message = error.name === 'AbortError' 
      ? 'Gmail connection timed out. Please check your internet connection and try again.'
      : 'An unexpected error occurred while connecting to Gmail. Please try again or contact support if the issue persists.';
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=gmail_oauth_error&message=${encodeURIComponent(message)}&code=critical_error&timestamp=${Date.now()}`);
  }
}