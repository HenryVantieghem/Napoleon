import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=slack_oauth_failed`);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.SLACK_REDIRECT_URI!,
      }),
    });

    const response = await tokenResponse.json();

    if (!response.ok) {
      console.error('Slack OAuth error:', response.error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=slack_token_failed`);
    }

    // Store Slack tokens in Clerk user metadata
    await clerkClient.users.updateUserMetadata(state, {
      privateMetadata: {
        slack_access_token: response.authed_user.access_token,
        slack_user_id: response.authed_user.id,
        slack_team_id: response.team.id,
        slack_team_name: response.team.name,
        slack_connected_at: Date.now(),
      },
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?connected=slack`);
  } catch (error) {
    console.error('Slack OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=slack_failed`);
  }
}