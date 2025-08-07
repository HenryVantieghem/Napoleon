import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const diagnostics = {
    environment: {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT_SET',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT_SET',
      SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID ? 'SET' : 'NOT_SET',
      SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET ? 'SET' : 'NOT_SET',
    },
    redirectUris: {
      gmail: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/gmail/callback`,
      slack: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/slack/callback`
    },
    requestUrl: request.url,
    headers: Object.fromEntries(request.headers.entries())
  };

  return NextResponse.json(diagnostics, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}