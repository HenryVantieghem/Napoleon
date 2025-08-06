import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { cookies } from 'next/headers';
import type { GmailMessage } from '@/types/gmail';

async function createGmailClient() {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/gmail/callback`
  );

  try {
    // Try to get tokens from cookies first (user OAuth flow)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('gmail_access_token')?.value;
    const refreshToken = cookieStore.get('gmail_refresh_token')?.value;
    const expiryDate = cookieStore.get('gmail_token_expiry')?.value;

    console.log('🍪 [GMAIL CLIENT] Token check:', {
      access_token: !!accessToken,
      refresh_token: !!refreshToken,
      token_expiry: expiryDate,
      env_refresh_token: !!process.env.GOOGLE_REFRESH_TOKEN
    });

    // Check if we have a refresh token (either from cookies or environment)
    const effectiveRefreshToken = refreshToken || process.env.GOOGLE_REFRESH_TOKEN;
    
    if (effectiveRefreshToken) {
      // Set the refresh token first
      oauth2Client.setCredentials({
        refresh_token: effectiveRefreshToken
      });
      
      // Check if access token is expired or missing
      const isExpired = expiryDate ? new Date(parseInt(expiryDate)) < new Date() : true;
      
      if (accessToken && !isExpired) {
        // Access token is still valid, use it
        oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: effectiveRefreshToken
        });
        console.log('✅ [GMAIL CLIENT] Using valid access token from cookies');
      } else {
        // Access token is expired or missing, refresh it
        console.log('🔄 [GMAIL CLIENT] Access token expired or missing, refreshing...');
        try {
          const { credentials } = await oauth2Client.refreshAccessToken();
          oauth2Client.setCredentials(credentials);
          console.log('✅ [GMAIL CLIENT] Successfully refreshed access token');
          
          // Note: We can't update cookies here in server component
          // The new access token will be used for this request
        } catch (refreshError) {
          console.error('❌ [GMAIL CLIENT] Failed to refresh access token:', refreshError);
          // Continue with just the refresh token, might still work
        }
      }
      
      console.log('✅ [GMAIL CLIENT] Gmail client configured with tokens');
    } else {
      console.log('❌ [GMAIL CLIENT] No OAuth tokens available');
    }
  } catch (error) {
    console.error('🍪 [GMAIL CLIENT] Cookie access error:', error);
    // Fallback to environment token if cookies fail
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      });
      console.log('✅ [GMAIL CLIENT] Using environment refresh token (cookies failed)');
    }
  }

  return oauth2Client;
}

export async function fetchGmailMessages(days: number = 7): Promise<GmailMessage[]> {
  try {
    console.log('📧 [GMAIL CLIENT] Starting Gmail message fetch...');
    const oauth2Client = await createGmailClient();
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

export async function getGmailAuthUrl(): Promise<string> {
  // Log environment variables for debugging
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const redirectUri = `${appUrl}/auth/gmail/callback`;
  
  console.log('🔍 [OAUTH DEBUG] Environment check:');
  console.log('  NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
  console.log('  Fallback URL:', 'http://localhost:3001');
  console.log('  Final App URL:', appUrl);
  console.log('  Computed Redirect URI:', redirectUri);
  console.log('  OAuth Client ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING');
  console.log('  OAuth Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING');

  const oauth2Client = await createGmailClient();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.metadata'
    ],
    prompt: 'consent'
  });

  console.log('🚀 [OAUTH DEBUG] Generated auth URL:', authUrl);
  console.log('📍 [OAUTH DEBUG] Expected redirect after auth:', redirectUri);
  
  return authUrl;
}

export async function handleGmailCallback(code: string) {
  const oauth2Client = await createGmailClient();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}