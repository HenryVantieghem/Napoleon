import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserTokens, isGmailConnected, isSlackConnected } from '@/lib/oauth-handlers';
import type { Message } from '@/types';

export const runtime = 'nodejs';

// Enhanced priority detection with executive focus
function getEnhancedPriority(
  message: Message,
  vipSenders: string[] = []
): 'urgent' | 'question' | 'normal' {
  const content = (message.content + ' ' + (message.subject || '')).toLowerCase();
  const sender = message.sender.toLowerCase();
  const senderEmail = message.senderEmail?.toLowerCase() || '';
  const channel = message.channel?.toLowerCase() || '';
  
  // URGENT INDICATORS
  const urgentKeywords = [
    'urgent', 'asap', 'emergency', 'critical', 'immediate',
    'breaking', 'alert', 'action required', 'time sensitive',
    'deadline', 'overdue', 'escalation', 'help needed',
    'issue', 'problem', 'down', 'failing', 'broken',
    'blocked', 'stop', 'priority', 'important'
  ];
  
  // VIP/Executive indicators
  const executiveTitles = [
    'ceo', 'cto', 'cfo', 'coo', 'president', 'vp', 'vice president',
    'director', 'executive', 'chief', 'board', 'investor',
    'founder', 'partner', 'managing', 'senior'
  ];
  
  const vipChannels = [
    'general', 'announcements', 'alerts', 'incidents',
    'leadership', 'executive', 'board', 'management',
    'urgent', 'priority', 'all-hands'
  ];
  
  // Check for VIP senders (custom list)
  if (vipSenders.some(vip => 
    sender.includes(vip.toLowerCase()) || 
    senderEmail.includes(vip.toLowerCase())
  )) {
    return 'urgent';
  }
  
  // Check for urgent keywords
  if (urgentKeywords.some(keyword => content.includes(keyword))) {
    return 'urgent';
  }
  
  // Check for executive titles in sender
  if (executiveTitles.some(title => 
    sender.includes(title) || 
    senderEmail.includes(title)
  )) {
    return 'urgent';
  }
  
  // Check for VIP channels (Slack)
  if (message.source === 'slack' && vipChannels.some(vip => channel.includes(vip))) {
    return 'urgent';
  }
  
  // QUESTION INDICATORS
  const questionIndicators = [
    '?',
    'can you', 'could you', 'would you', 'will you',
    'please advise', 'please confirm', 'please review',
    'need help', 'help with', 'question about',
    'how to', 'how do', 'what is', 'where is',
    'when can', 'why is', 'should i', 'should we',
    'thoughts on', 'opinion on', 'feedback on',
    'let me know', 'lmk', 'any update', 'status on'
  ];
  
  if (questionIndicators.some(indicator => content.includes(indicator))) {
    return 'question';
  }
  
  // Default to normal
  return 'normal';
}

// Sort messages by priority and timestamp
function sortMessagesByPriority(messages: Message[]): Message[] {
  const priorityOrder = { urgent: 3, question: 2, normal: 1 };
  
  return messages.sort((a, b) => {
    // First sort by priority
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    
    // Within same priority, sort by timestamp (newest first)
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's connection status
    const tokens = await getUserTokens(user.id);
    const hasGmail = tokens ? isGmailConnected(tokens) : false;
    const hasSlack = tokens ? isSlackConnected(tokens) : false;

    if (!hasGmail && !hasSlack) {
      return NextResponse.json({ 
        error: 'No accounts connected',
        code: 'NO_CONNECTIONS',
        connections: { gmail: false, slack: false }
      }, { status: 400 });
    }

    const allMessages: Message[] = [];
    const errors: { service: string; error: string }[] = [];
    let gmailFetchTime = 0;
    let slackFetchTime = 0;

    // Fetch Gmail messages if connected
    if (hasGmail) {
      const gmailStart = Date.now();
      try {
        const gmailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/messages/gmail`, {
          headers: {
            'Cookie': request.headers.get('cookie') || '',
            'Authorization': request.headers.get('authorization') || ''
          }
        });

        if (gmailResponse.ok) {
          const gmailData = await gmailResponse.json();
          allMessages.push(...(gmailData.messages || []));
        } else {
          const errorData = await gmailResponse.json();
          errors.push({ service: 'gmail', error: errorData.error || 'Failed to fetch Gmail messages' });
        }
      } catch (error) {
        console.error('Gmail fetch error:', error);
        errors.push({ service: 'gmail', error: 'Gmail service unavailable' });
      }
      gmailFetchTime = Date.now() - gmailStart;
    }

    // Fetch Slack messages if connected
    if (hasSlack) {
      const slackStart = Date.now();
      try {
        const slackResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/messages/slack`, {
          headers: {
            'Cookie': request.headers.get('cookie') || '',
            'Authorization': request.headers.get('authorization') || ''
          }
        });

        if (slackResponse.ok) {
          const slackData = await slackResponse.json();
          allMessages.push(...(slackData.messages || []));
        } else {
          const errorData = await slackResponse.json();
          errors.push({ service: 'slack', error: errorData.error || 'Failed to fetch Slack messages' });
        }
      } catch (error) {
        console.error('Slack fetch error:', error);
        errors.push({ service: 'slack', error: 'Slack service unavailable' });
      }
      slackFetchTime = Date.now() - slackStart;
    }

    // Apply enhanced priority detection
    const vipSenders = process.env.VIP_SENDERS?.split(',') || [];
    const messagesWithPriority = allMessages.map(message => ({
      ...message,
      priority: getEnhancedPriority(message, vipSenders)
    }));

    // Sort messages by priority
    const sortedMessages = sortMessagesByPriority(messagesWithPriority);

    // Calculate priority statistics
    const priorityStats = {
      urgent: sortedMessages.filter(m => m.priority === 'urgent').length,
      question: sortedMessages.filter(m => m.priority === 'question').length,
      normal: sortedMessages.filter(m => m.priority === 'normal').length,
      total: sortedMessages.length
    };

    // Calculate source statistics
    const sourceStats = {
      gmail: sortedMessages.filter(m => m.source === 'gmail').length,
      slack: sortedMessages.filter(m => m.source === 'slack').length
    };

    return NextResponse.json({
      messages: sortedMessages,
      stats: {
        priority: priorityStats,
        sources: sourceStats,
        performance: {
          gmailFetchTime,
          slackFetchTime,
          totalFetchTime: gmailFetchTime + slackFetchTime
        }
      },
      connections: {
        gmail: hasGmail,
        slack: hasSlack
      },
      errors: errors.length > 0 ? errors : undefined,
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unified API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch unified messages',
      code: 'UNIFIED_FETCH_ERROR'
    }, { status: 500 });
  }
}