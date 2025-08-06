export interface GmailMessage {
  id: string;
  threadId?: string;
  source: 'gmail';
  subject: string;
  from: string;
  to?: string;
  timestamp: Date;
  snippet: string;
  body?: {
    text?: string;
    html?: string;
  };
  labelIds?: string[];
}

export interface GmailCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
}