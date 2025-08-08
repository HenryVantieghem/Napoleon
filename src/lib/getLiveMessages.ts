import { type Msg, prioritize } from '@/lib/priority'
import { getGoogleMessages } from '@/server/lib/google'
import { getSlackMessages } from '@/server/lib/slack'

export async function getLiveMessages(userId: string): Promise<Msg[]> {
  try {
    const [g, s] = await Promise.allSettled([
      getGoogleMessages(userId),
      getSlackMessages(userId),
    ])
    const gmail = g.status === 'fulfilled' ? g.value : []
    const slack = s.status === 'fulfilled' ? s.value : []
    return prioritize([...gmail, ...slack])
  } catch {
    return []
  }
}


