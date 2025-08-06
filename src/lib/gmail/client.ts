import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import type { GmailMessage } from '@/types/gmail';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/gmail/callback`
);

// Set credentials if we have a stored refresh token
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });
}

export async function fetchGmailMessages(days: number = 7): Promise<GmailMessage[]> {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Calculate date 7 days ago
    const afterDate = new Date();
    afterDate.setDate(afterDate.getDate() - days);
    const afterTimestamp = Math.floor(afterDate.getTime() / 1000);
    
    // Build query for messages from last 7 days
    const query = `after:${afterTimestamp} in:inbox`;
    
    console.log(`Fetching Gmail messages with query: ${query}`);
    
    // List messages
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 100
    });
    
    if (!listResponse.data.messages) {
      console.log('No Gmail messages found');
      return [];
    }
    
    // Fetch full message details
    const messages = await Promise.all(
      listResponse.data.messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'full'
        });
        
        // Extract headers
        const headers = detail.data.payload?.headers || [];
        const getHeader = (name: string) => 
          headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';
        
        // Parse body
        let textBody = '';
        let htmlBody = '';
        
        const extractBody = (parts: unknown[]): void => {
          for (const part of parts) {
            if (typeof part === 'object' && part !== null) {
              const partObj = part as { mimeType?: string; body?: { data?: string }; parts?: unknown[] };
              if (partObj.mimeType === 'text/plain' && partObj.body?.data) {
                textBody = Buffer.from(partObj.body.data, 'base64').toString();
              } else if (partObj.mimeType === 'text/html' && partObj.body?.data) {
                htmlBody = Buffer.from(partObj.body.data, 'base64').toString();
              } else if (partObj.parts) {
                extractBody(partObj.parts);
              }
            }
          }
        };
        
        if (detail.data.payload?.parts) {
          extractBody(detail.data.payload.parts);
        } else if (detail.data.payload?.body?.data) {
          textBody = Buffer.from(detail.data.payload.body.data, 'base64').toString();
        }
        
        return {
          id: detail.data.id!,
          threadId: detail.data.threadId || undefined,
          source: 'gmail' as const,
          subject: getHeader('Subject'),
          from: getHeader('From'),
          to: getHeader('To'),
          timestamp: new Date(parseInt(detail.data.internalDate!)),
          snippet: detail.data.snippet || '',
          body: {
            text: textBody,
            html: htmlBody
          },
          labelIds: detail.data.labelIds || undefined
        };
      })
    );
    
    console.log(`Fetched ${messages.length} Gmail messages`);
    return messages;
    
  } catch (error) {
    console.error('Error fetching Gmail messages:', error);
    throw error;
  }
}

export function getGmailAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.metadata'
    ],
    prompt: 'consent'
  });
}

export async function handleGmailCallback(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}