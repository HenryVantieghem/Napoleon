import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slackAuthUrl = new URL('https://slack.com/oauth/v2/authorize');
    slackAuthUrl.searchParams.set('client_id', process.env.SLACK_CLIENT_ID!);
    slackAuthUrl.searchParams.set('redirect_uri', process.env.SLACK_REDIRECT_URI!);
    slackAuthUrl.searchParams.set('scope', 'channels:history,channels:read,im:history,im:read,users:read');
    slackAuthUrl.searchParams.set('user_scope', 'channels:history,im:history');
    slackAuthUrl.searchParams.set('state', user.id);

    return NextResponse.redirect(slackAuthUrl.toString());
  } catch (error) {
    console.error('Slack OAuth initiation error:', error);
    return NextResponse.json({ error: 'Failed to initiate Slack OAuth' }, { status: 500 });
  }
}