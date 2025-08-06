import { NextRequest, NextResponse } from 'next/server';
import { fetchGmailMessages } from '@/lib/gmail/client';
import { SlackMessagesClient } from '@/lib/slack-api/slack-messages-client';
import type { UnifiedMessage, MessagePriority } from '@/types/message';

// Priority calculation function
function calculateMessagePriority(message: { subject?: string; snippet?: string }): { priority: MessagePriority; priorityReason?: string } {
  const subject = (message.subject || '').toLowerCase();
  const snippet = (message.snippet || '').toLowerCase();
  const content = `${subject} ${snippet}`;
  
  // Check for urgent keywords
  const urgentKeywords = ['urgent', 'asap', 'immediately', 'emergency', 'critical'];
  const hasUrgent = urgentKeywords.some(keyword => content.includes(keyword));
  
  // Check for question marks
  const hasQuestion = content.includes('?');
  
  if (hasUrgent) {
    return { 
      priority: 'high', 
      priorityReason: 'Contains urgent keywords' 
    };
  }
  
  if (hasQuestion) {
    return { 
      priority: 'high', 
      priorityReason: 'Contains question' 
    };
  }
  
  return { priority: 'normal' };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');
    
    // Create Slack client from cookies (request context)
    const slackClient = SlackMessagesClient.fromCookies();
    
    console.log('📋 [MESSAGES API] Fetching messages for', days, 'days');
    console.log('🔍 [MESSAGES API] Slack OAuth connected:', slackClient.isConnected());
    console.log('🔍 [MESSAGES API] Slack connection info:', slackClient.getConnectionInfo());
    
    // Fetch messages from both sources using Promise.allSettled for better error handling
    const results = await Promise.allSettled([
      fetchGmailMessages(days),
      slackClient.getRecentMessages(days)
    ]);
    
    const gmailResult = results[0];
    const slackResult = results[1];
    
    console.log('📊 [MESSAGES API] Results:', {
      gmail: gmailResult.status,
      slack: slackResult.status,
      slackConnected: slackClient.isConnected()
    });
    
    const response = {
      messages: [] as UnifiedMessage[],
      gmailConnected: false,
      slackConnected: false,
      errors: [] as string[]
    };
    
    if (gmailResult.status === 'fulfilled') {
      const gmailMessagesWithPriority = gmailResult.value.map(msg => ({
        ...msg,
        ...calculateMessagePriority(msg)
      }));
      response.messages.push(...gmailMessagesWithPriority);
      response.gmailConnected = true;
    } else {
      console.error('Gmail error:', gmailResult.reason);
      response.errors.push(`Gmail: ${gmailResult.reason.message || 'Connection failed'}`);
    }
    
    if (slackResult.status === 'fulfilled') {
      // Slack messages from OAuth client already have priority calculated
      response.messages.push(...slackResult.value);
      response.slackConnected = slackClient.isConnected();
      console.log('✅ [MESSAGES API] Slack OAuth messages loaded:', slackResult.value.length);
    } else {
      console.error('❌ [MESSAGES API] Slack OAuth error:', slackResult.reason);
      
      // Check if Slack OAuth is connected but failing
      if (slackClient.isConnected()) {
        response.errors.push(`Slack OAuth: ${slackResult.reason.message || 'Connection failed despite OAuth being connected'}`);
      } else {
        console.log('⚠️ [MESSAGES API] Slack OAuth not connected - skipping');
        // Don't add to errors if not connected, just log
      }
    }
    
    // Smart prioritization: Sort by priority first, then by timestamp within each priority
    response.messages.sort((a, b) => {
      // High priority first
      if (a.priority === 'high' && b.priority === 'normal') return -1;
      if (a.priority === 'normal' && b.priority === 'high') return 1;
      
      // Within same priority, sort by timestamp (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    // Log final summary
    const gmailCount = response.messages.filter(m => m.source === 'gmail').length;
    const slackCount = response.messages.filter(m => m.source === 'slack').length;
    const highPriorityCount = response.messages.filter(m => m.priority === 'high').length;
    
    console.log('📊 [MESSAGES API] Final summary:', {
      total: response.messages.length,
      gmail: gmailCount,
      slack: slackCount,
      highPriority: highPriorityCount,
      gmailConnected: response.gmailConnected,
      slackConnected: response.slackConnected,
      errors: response.errors.length
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}