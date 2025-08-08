import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasGoogleToken } from '@/server/lib/google'
import { hasSlackToken } from '@/server/lib/slack'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ authed: false })
    const [google, slack] = await Promise.all([
      hasGoogleToken(userId),
      hasSlackToken(userId),
    ])
    return NextResponse.json({ authed: true, google, slack })
  } catch (e) {
    return NextResponse.json({ authed: false, error: (e as Error).message })
  }
}
