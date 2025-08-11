import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserTokens, isGmailConnected, isSlackConnected, isGmailTokenExpired } from '@/lib/oauth-handlers';
import type { ConnectionStatus } from '@/types';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokens = await getUserTokens(user.id);
    
    if (!tokens) {
      return NextResponse.json({
        connected: {
          gmail: false,
          slack: false
        },
        expires: {
          gmail: null,
          slack: null
        },
        status: 'no_tokens'
      });
    }

    const connectionStatus: ConnectionStatus = {
      gmail: isGmailConnected(tokens),
      slack: isSlackConnected(tokens)
    };

    const response = {
      connected: connectionStatus,
      expires: {
        gmail: tokens.gmail_expires_at || null,
        slack: null // Slack tokens don't expire
      },
      status: 'success',
      details: {
        gmail: {
          connected: connectionStatus.gmail,
          expired: connectionStatus.gmail ? isGmailTokenExpired(tokens) : null,
          connectedAt: (tokens as any).gmail_connected_at || null
        },
        slack: {
          connected: connectionStatus.slack,
          teamName: (tokens as any).slack_team_name || null,
          connectedAt: (tokens as any).slack_connected_at || null
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    return NextResponse.json({ error: 'Failed to fetch token status' }, { status: 500 });
  }
}