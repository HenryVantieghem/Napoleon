import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { WebClient } from '@slack/web-api';
import { getValidSlackToken } from '@/lib/oauth-handlers';
import { withAPIOptimization } from '@/middleware/api-optimization';
import type { Message } from '@/types';

export const runtime = 'nodejs';

async function handleSlackMessages(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get valid Slack token
    const accessToken = await getValidSlackToken(user.id);
    
    if (!accessToken) {
      return NextResponse.json({ 
        error: 'Slack not connected',
        code: 'SLACK_NOT_CONNECTED' 
      }, { status: 400 });
    }

    // Initialize Slack API client
    const slack = new WebClient(accessToken);

    // Calculate date range - last 7 days (as Unix timestamp)
    const sevenDaysAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
    
    const messages: Message[] = [];

    try {
      // Get list of channels the user is a member of
      const channelsResponse = await slack.conversations.list({
        exclude_archived: true,
        types: 'public_channel,private_channel',
        limit: 50
      });

      // Get direct message conversations
      const dmsResponse = await slack.conversations.list({
        exclude_archived: true,
        types: 'im',
        limit: 50
      });

      const allConversations = [
        ...(channelsResponse.channels || []),
        ...(dmsResponse.channels || [])
      ];

      // Process conversations in batches to prevent API rate limits
      const batchSize = 5;
      for (let i = 0; i < allConversations.length && i < 20; i += batchSize) {
        const batch = allConversations.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (conversation) => {
          try {
            if (!conversation.id) return [];

            // Get recent messages from this conversation
            const historyResponse = await slack.conversations.history({
              channel: conversation.id,
              oldest: sevenDaysAgo.toString(),
              limit: 10, // Limit messages per channel
              inclusive: true
            });

            if (!historyResponse.messages) return [];

            // Convert Slack messages to our Message format
            const conversationMessages: Message[] = [];
            
            for (const slackMessage of historyResponse.messages) {
              if (!slackMessage.text || !slackMessage.ts || !slackMessage.user) continue;
              
              // Skip bot messages and system messages
              if (slackMessage.bot_id || slackMessage.subtype) continue;

              // Get user info for sender name
              let senderName = 'Unknown User';
              try {
                const userResponse = await slack.users.info({ user: slackMessage.user });
                const user = userResponse.user as any;
                senderName = user?.profile?.display_name || user?.real_name || user?.name || 'Unknown User';
              } catch (userError) {
                console.warn('Error fetching user info:', userError);
              }

              // Determine channel name
              let channelName = conversation.name || 'Direct Message';
              if (conversation.is_im) {
                channelName = `DM with ${senderName}`;
              }

              const message: Message = {
                id: slackMessage.ts!,
                source: 'slack',
                content: slackMessage.text,
                sender: senderName,
                channel: channelName,
                timestamp: new Date(parseFloat(slackMessage.ts!) * 1000).toISOString(),
                priority: getPriority(slackMessage.text, channelName, senderName),
                metadata: {
                  channelType: conversation.is_channel ? 'channel' : conversation.is_group ? 'group' : 'dm',
                  teamId: slackMessage.team,
                }
              };

              conversationMessages.push(message);
            }

            return conversationMessages;
          } catch (conversationError) {
            console.error(`Error fetching messages from conversation ${conversation.id}:`, conversationError);
            return [];
          }
        });

        const batchResults = await Promise.all(batchPromises);
        const validMessages = batchResults.flat();
        messages.push(...validMessages);
      }
    } catch (apiError) {
      console.error('Slack API error:', apiError);
      return NextResponse.json({ 
        error: 'Failed to fetch Slack data',
        code: 'SLACK_API_ERROR' 
      }, { status: 500 });
    }

    // Sort messages by timestamp (newest first) and then by priority
    messages.sort((a, b) => {
      // Priority order: urgent > question > normal
      const priorityOrder = { urgent: 3, question: 2, normal: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      // If same priority, sort by timestamp (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return NextResponse.json({ 
      messages,
      totalCount: messages.length,
      source: 'slack',
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Slack API error:', error);
    
    // Handle specific Slack API errors
    if ((error as any)?.code === 'not_authed') {
      return NextResponse.json({ 
        error: 'Slack authentication failed',
        code: 'SLACK_AUTH_FAILED' 
      }, { status: 401 });
    }
    
    if ((error as any)?.code === 'account_inactive') {
      return NextResponse.json({ 
        error: 'Slack account inactive',
        code: 'SLACK_INACTIVE' 
      }, { status: 403 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch Slack messages',
      code: 'SLACK_FETCH_ERROR'
    }, { status: 500 });
  }
}

// Priority detection algorithm for Slack messages (same logic as Gmail)
function getPriority(text: string, channelName: string, senderName: string): 'urgent' | 'question' | 'normal' {
  const textLower = text.toLowerCase();
  const channelLower = channelName.toLowerCase();
  const senderLower = senderName.toLowerCase();
  
  // Urgent indicators
  const urgentKeywords = [
    'urgent', 'asap', 'emergency', 'critical', 'immediate',
    'breaking', 'alert', 'action required', 'time sensitive',
    'deadline', 'overdue', 'escalation', 'help needed',
    'issue', 'problem', 'down', 'failing', 'broken'
  ];
  
  // VIP indicators (channels and senders)
  const vipChannels = [
    'general', 'announcements', 'alerts', 'incidents',
    'leadership', 'executive', 'board', 'ceo', 'management'
  ];
  
  const vipTitles = [
    'ceo', 'cto', 'cfo', 'president', 'director', 'vp',
    'manager', 'lead', 'head', 'senior', 'chief'
  ];
  
  // Check for urgent keywords in message text
  if (urgentKeywords.some(keyword => textLower.includes(keyword))) {
    return 'urgent';
  }
  
  // Check for VIP channels
  if (vipChannels.some(vip => channelLower.includes(vip))) {
    return 'urgent';
  }
  
  // Check for VIP senders
  if (vipTitles.some(title => senderLower.includes(title))) {
    return 'urgent';
  }
  
  // Check for questions
  if (textLower.includes('?') || 
      textLower.includes('please') ||
      textLower.includes('can you') ||
      textLower.includes('could you') ||
      textLower.includes('help') ||
      textLower.includes('question') ||
      textLower.includes('how to') ||
      textLower.includes('what is') ||
      textLower.includes('how do') ||
      textLower.includes('where is')) {
    return 'question';
  }
  
  // Default to normal priority
  return 'normal';
}

// Export the optimized handler
export const GET = withAPIOptimization(handleSlackMessages, {
  enableCompression: true,
  enableCaching: true,
  enablePayloadOptimization: true,
  compressionThreshold: 1024, // 1KB - Slack messages tend to be shorter
  cacheMaxAge: 300, // 5 minutes
});