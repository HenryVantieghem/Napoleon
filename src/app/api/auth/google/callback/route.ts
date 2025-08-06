import { NextRequest, NextResponse } from 'next/server';
import { handleGmailCallback } from '@/lib/gmail/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  if (error) {
    console.error('Gmail OAuth error:', error);
    return NextResponse.redirect('/prototype?error=gmail_auth_failed');
  }
  
  if (!code) {
    return NextResponse.json({ error: 'No authorization code' }, { status: 400 });
  }
  
  try {
    const tokens = await handleGmailCallback(code);
    
    // In production, store tokens securely (database/encrypted storage)
    // For prototype, we'll log them (developer can add to .env.local)
    console.log('Gmail OAuth successful. Add to .env.local:');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    
    return NextResponse.redirect('/prototype?gmail=connected');
  } catch (error) {
    console.error('Error handling Gmail callback:', error);
    return NextResponse.redirect('/prototype?error=gmail_callback_failed');
  }
}