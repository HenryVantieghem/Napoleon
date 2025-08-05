import { auth } from '@clerk/nextjs/server'
import GmailClient from './gmail-client'

/**
 * Gets the authenticated user's Gmail access token from Clerk
 */
export async function getGmailAccessToken(): Promise<string | null> {
  try {
    const { userId, getToken } = await auth()
    
    if (!userId) {
      throw new Error('User not authenticated')
    }

    // Try to get the OAuth token for Google with Gmail scopes
    try {
      const token = await getToken({ template: 'oauth_google' })
      
      if (token) {
        return token
      }
    } catch (templateError) {
      console.warn('OAuth template not found, trying alternative method:', templateError)
    }

    // Alternative: Try to get token directly if template doesn't exist
    try {
      const token = await getToken()
      if (token) {
        console.log('Using fallback token method')
        return token
      }
    } catch (fallbackError) {
      console.warn('Fallback token method failed:', fallbackError)
    }

    throw new Error('No Gmail access token found. User may need to connect their Gmail account through OAuth.')
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