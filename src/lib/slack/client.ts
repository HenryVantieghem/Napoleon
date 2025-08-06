import { WebClient } from '@slack/web-api';
import type { SlackMessage } from '@/types/slack';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Cache for user names
const userCache = new Map<string, string>();

async function getUserName(userId: string): Promise<string> {
  if (userCache.has(userId)) {
    return userCache.get(userId)!;
  }
  
  try {
    const result = await slack.users.info({ user: userId });
    const name = result.user?.real_name || result.user?.name || userId;
    userCache.set(userId, name);
    return name;
  } catch {
    return userId;
  }
}

export async function fetchSlackMessages(days: number = 7): Promise<SlackMessage[]> {
  try {
    // Calculate timestamp 7 days ago
    const oldest = Math.floor((Date.now() - (days * 24 * 60 * 60 * 1000)) / 1000);
    
    console.log(`Fetching Slack messages from last ${days} days`);
    
    // Get all conversations
    const channelsResult = await slack.conversations.list({
      types: 'public_channel,private_channel,im,mpim',
      limit: 100
    });
    
    if (!channelsResult.channels) {
      console.log('No Slack channels found');
      return [];
    }
    
    const messages: SlackMessage[] = [];
    
    // Fetch messages from each channel
    for (const channel of channelsResult.channels) {
      if (!channel.id || !channel.is_member) continue;
      
      try {
        const history = await slack.conversations.history({
          channel: channel.id,
          oldest: oldest.toString(),
          limit: 100,
          inclusive: true
        });
        
        if (!history.messages) continue;
        
        // Convert messages to our format
        for (const msg of history.messages) {
          if (!msg.ts || !msg.text) continue;
          
          // Skip bot messages unless they're important
          if (msg.bot_id && !msg.text.includes('@')) continue;
          
          const userName = msg.user ? await getUserName(msg.user) : 'Bot';
          
          messages.push({
            id: `${channel.id}-${msg.ts}`,
            source: 'slack',
            subject: channel.is_im ? `DM with ${userName}` : `#${channel.name || 'unknown'}`,
            from: userName,
            timestamp: new Date(parseFloat(msg.ts) * 1000),
            snippet: msg.text.length > 200 ? msg.text.substring(0, 200) + '...' : msg.text,
            channelId: channel.id,
            channelType: channel.is_channel ? 'channel' : channel.is_im ? 'im' : 'mpim',
            threadTs: msg.thread_ts
          });
        }
      } catch (error) {
        console.error(`Error fetching messages from channel ${channel.name}:`, error);
      }
    }
    
    console.log(`Fetched ${messages.length} Slack messages`);
    return messages;
    
  } catch (error) {
    console.error('Error fetching Slack messages:', error);
    throw error;
  }
}

export async function testSlackConnection(): Promise<boolean> {
  try {
    const result = await slack.auth.test();
    console.log('Slack connection successful:', result.ok);
    return result.ok || false;
  } catch (error) {
    console.error('Slack connection test failed:', error);
    return false;
  }
}