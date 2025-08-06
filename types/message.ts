import type { GmailMessage } from './gmail';
import type { SlackMessage } from './slack';

export type UnifiedMessage = GmailMessage | SlackMessage;

export interface MessageListProps {
  messages: UnifiedMessage[];
  loading?: boolean;
  error?: string;
}