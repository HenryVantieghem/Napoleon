import type { GmailMessage } from './gmail';
import type { SlackMessage } from './slack';

export type MessagePriority = 'high' | 'normal';

export interface PriorityMessage {
  priority: MessagePriority;
  priorityReason?: string;
}

export type UnifiedMessage = (GmailMessage | SlackMessage) & PriorityMessage;

export interface MessageListProps {
  messages: UnifiedMessage[];
  loading?: boolean;
  error?: string;
}