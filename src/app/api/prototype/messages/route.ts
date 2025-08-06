import { NextRequest, NextResponse } from 'next/server';
import { fetchGmailMessages } from '@/lib/gmail/client';
import { fetchSlackMessages } from '@/lib/slack/client';
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
      const slackMessagesWithPriority = slackResult.value.map(msg => ({
        ...msg,
        ...calculateMessagePriority(msg)
      }));
      response.messages.push(...slackMessagesWithPriority);
      response.slackConnected = true;
    } else {
      console.error('Slack error:', slackResult.reason);
      response.errors.push(`Slack: ${slackResult.reason.message || 'Connection failed'}`);
    }
    
    // Smart prioritization: Sort by priority first, then by timestamp within each priority
    response.messages.sort((a, b) => {
      // High priority first
      if (a.priority === 'high' && b.priority === 'normal') return -1;
      if (a.priority === 'normal' && b.priority === 'high') return 1;
      
      // Within same priority, sort by timestamp (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
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