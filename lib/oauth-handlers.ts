import { clerkClient } from '@clerk/nextjs/server';
import type { UserTokens } from '@/types';

export async function refreshGmailToken(userId: string, refreshToken: string): Promise<string | null> {
  try {
    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const newTokens = await refreshResponse.json();
    
    if (newTokens.error) {
      console.error('Token refresh failed:', newTokens.error);
      return null;
    }

    // Update stored token
    const user = await clerkClient.users.getUser(userId);
    const currentMetadata = user.privateMetadata as UserTokens;
    
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...currentMetadata,
        gmail_access_token: newTokens.access_token,
        gmail_expires_at: Date.now() + (newTokens.expires_in * 1000),
      },
    });

    return newTokens.access_token;
  } catch (error) {
    console.error('Gmail token refresh error:', error);
    return null;
  }
}

export async function getValidGmailToken(userId: string): Promise<string | null> {
  try {
    const user = await clerkClient.users.getUser(userId);
    const metadata = user.privateMetadata as UserTokens;
    
    const gmailToken = metadata.gmail_access_token;
    const refreshToken = metadata.gmail_refresh_token;
    const expiresAt = metadata.gmail_expires_at;

    if (!gmailToken || !refreshToken) {
      return null;
    }

    // Check if token is expired and refresh if needed
    if (Date.now() > (expiresAt || 0)) {
      return await refreshGmailToken(userId, refreshToken);
    }

    return gmailToken;
  } catch (error) {
    console.error('Error getting valid Gmail token:', error);
    return null;
  }
}

export async function getUserTokens(userId: string): Promise<UserTokens | null> {
  try {
    const user = await clerkClient.users.getUser(userId);
    return user.privateMetadata as UserTokens;
  } catch (error) {
    console.error('Error getting user tokens:', error);
    return null;
  }
}

export function isGmailConnected(tokens: UserTokens): boolean {
  return !!(tokens.gmail_access_token && tokens.gmail_refresh_token);
}

export function isSlackConnected(tokens: UserTokens): boolean {
  return !!(tokens.slack_access_token && tokens.slack_user_id);
}

export function isGmailTokenExpired(tokens: UserTokens): boolean {
  if (!tokens.gmail_expires_at) return true;
  return Date.now() > tokens.gmail_expires_at;
}

export async function getValidSlackToken(userId: string): Promise<string | null> {
  try {
    const user = await clerkClient.users.getUser(userId);
    const metadata = user.privateMetadata as UserTokens;
    
    const slackToken = metadata.slack_access_token;

    if (!slackToken) {
      return null;
    }

    // Slack tokens generally don't expire for bot tokens
    // but we should validate they're still working
    return slackToken;
  } catch (error) {
    console.error('Error getting valid Slack token:', error);
    return null;
  }
}