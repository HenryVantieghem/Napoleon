import { NextRequest, NextResponse } from 'next/server';
import { fetchGmailMessages } from '@/lib/gmail/client';
import { fetchSlackMessages } from '@/lib/slack/client';
import type { UnifiedMessage } from '@/types/message';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');
    
    // Fetch messages from both sources
    const results = await Promise.allSettled([
      fetchGmailMessages(days),
      fetchSlackMessages(days)
    ]);
    
    const gmailResult = results[0];
    const slackResult = results[1];
    
    const response = {
      messages: [] as UnifiedMessage[],
      gmailConnected: false,
      slackConnected: false,
      errors: [] as string[]
    };
    
    if (gmailResult.status === 'fulfilled') {
      response.messages.push(...gmailResult.value);
      response.gmailConnected = true;
    } else {
      console.error('Gmail error:', gmailResult.reason);
      response.errors.push(`Gmail: ${gmailResult.reason.message || 'Connection failed'}`);
    }
    
    if (slackResult.status === 'fulfilled') {
      response.messages.push(...slackResult.value);
      response.slackConnected = true;
    } else {
      console.error('Slack error:', slackResult.reason);
      response.errors.push(`Slack: ${slackResult.reason.message || 'Connection failed'}`);
    }
    
    // Sort messages by timestamp (newest first)
    response.messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}