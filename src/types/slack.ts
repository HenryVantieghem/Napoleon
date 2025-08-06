export interface SlackMessage {
  id: string;
  source: 'slack';
  subject: string;  // Channel name
  from: string;     // User ID or name
  timestamp: Date;
  snippet: string;  // Message text
  channelId: string;
  channelType: 'channel' | 'im' | 'mpim';
  threadTs?: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_im: boolean;
  is_mpim: boolean;
  is_private: boolean;
}