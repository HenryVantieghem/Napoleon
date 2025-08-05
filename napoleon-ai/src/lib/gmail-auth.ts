import { auth } from '@clerk/nextjs/server'
import GmailClient from './gmail-client'

/**
 * Gets the authenticated user's Gmail access token from Clerk
 */
export async function getGmailAccessToken(): Promise<string | null> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error('User not authenticated')
    }

    // Get the user's OAuth tokens from Clerk
    const { getToken } = await auth()
    const token = await getToken({ template: 'oauth_google' })
    
    if (!token) {
      throw new Error('No Gmail access token found. User may need to reconnect their Gmail account.')
    }

    return token
  } catch (error) {
    console.error('Failed to get Gmail access token:', error)
    return null
  }
}

/**
 * Creates an authenticated Gmail client instance
 */
export async function createAuthenticatedGmailClient(): Promise<GmailClient | null> {
  try {
    const accessToken = await getGmailAccessToken()
    
    if (!accessToken) {
      return null
    }

    return new GmailClient(accessToken)
  } catch (error) {
    console.error('Failed to create authenticated Gmail client:', error)
    return null
  }
}

/**
 * Checks if the current user has Gmail access
 */
export async function hasGmailAccess(): Promise<boolean> {
  const token = await getGmailAccessToken()
  return token !== null
}