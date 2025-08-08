import { clerkClient } from '@clerk/nextjs/server'
import type { Msg } from '@/lib/priority'

export async function getGoogleMessages(userId: string): Promise<Msg[]> {
  try {
    if (!userId) return []
    const tokens = await clerkClient.users.getUserOauthAccessToken(userId, 'oauth_google').catch(() => [])
    const token = Array.isArray(tokens) && tokens.length > 0 ? (tokens[0] as any).token : undefined
    if (!token) return []

    // List messages from last 7 days in inbox
    const listUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=newer_than:7d in:inbox&maxResults=25'
    const listRes = await fetch(listUrl, { headers: { Authorization: `Bearer ${token}` } })
    if (!listRes.ok) return []
    const listData = await listRes.json()
    const ids: string[] = (listData.messages || []).map((m: any) => m.id)
    if (ids.length === 0) return []

    const messages: Msg[] = []
    for (const id of ids.slice(0, 25)) {
      try {
        const msgUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`
        const msgRes = await fetch(msgUrl, { headers: { Authorization: `Bearer ${token}` } })
        if (!msgRes.ok) continue
        const msg = await msgRes.json()

        const headers: Array<{ name: string; value: string }> = msg.payload?.headers || []
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown'
        const subject = headers.find(h => h.name === 'Subject')?.value
        const snippet = msg.snippet || ''
        const ts = Number(msg.internalDate || Date.now())

        messages.push({
          id: `gmail_${msg.id}`,
          source: 'gmail',
          from,
          subject,
          text: snippet,
          ts,
        })
      } catch {
        // skip one bad message
      }
    }

    return messages
  } catch {
    return []
  }
}

export async function hasGoogleToken(userId: string): Promise<boolean> {
  try {
    if (!userId) return false
    const tokens = await clerkClient.users.getUserOauthAccessToken(userId, 'oauth_google').catch(() => [])
    return Array.isArray(tokens) && tokens.length > 0
  } catch {
    return false
  }
}


