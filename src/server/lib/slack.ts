export const runtime = 'nodejs'
import { clerkClient } from '@clerk/nextjs/server'
import type { Msg } from '@/lib/priority'

export async function getSlackMessages(userId: string): Promise<Msg[]> {
  try {
    if (!userId) return []
    const tokens = await clerkClient.users.getUserOauthAccessToken(userId, 'oauth_slack').catch(() => [])
    const token = Array.isArray(tokens) && tokens.length > 0 ? (tokens[0] as any).token : undefined
    if (!token) return []

    const sevenDaysAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000)

    // list a small set of conversations
    const convRes = await fetch('https://slack.com/api/conversations.list?limit=5&types=public_channel,private_channel,im,mpim', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!convRes.ok) return []
    const convData = await convRes.json()
    if (!convData.ok || !Array.isArray(convData.channels)) return []

    const messages: Msg[] = []
    for (const ch of convData.channels.slice(0, 5)) {
      try {
        const histUrl = `https://slack.com/api/conversations.history?channel=${ch.id}&oldest=${sevenDaysAgo}&limit=20`
        const histRes = await fetch(histUrl, { headers: { Authorization: `Bearer ${token}` } })
        if (!histRes.ok) continue
        const hist = await histRes.json()
        if (!hist.ok || !Array.isArray(hist.messages)) continue
        for (const m of hist.messages) {
          if (m.type === 'message' && !m.subtype && !!m.text) {
            messages.push({
              id: `slack_${m.ts}`,
              source: 'slack',
              from: m.user || 'Slack',
              text: m.text || '',
              ts: Math.floor(parseFloat(m.ts || '0') * 1000),
            })
          }
        }
      } catch {
        // skip this channel
      }
    }

    return messages
  } catch {
    return []
  }
}

export async function hasSlackToken(userId: string): Promise<boolean> {
  try {
    if (!userId) return false
    const tokens = await clerkClient.users.getUserOauthAccessToken(userId, 'oauth_slack').catch(() => [])
    return Array.isArray(tokens) && tokens.length > 0
  } catch {
    return false
  }
}


