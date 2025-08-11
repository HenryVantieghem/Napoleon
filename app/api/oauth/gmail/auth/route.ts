import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
    googleAuthUrl.searchParams.set('redirect_uri', process.env.GOOGLE_REDIRECT_URI!);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/gmail.readonly');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'consent');
    googleAuthUrl.searchParams.set('state', user.id); // Pass user ID in state

    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error('Gmail OAuth initiation error:', error);
    return NextResponse.json({ error: 'Failed to initiate Gmail OAuth' }, { status: 500 });
  }
}