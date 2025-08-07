import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find Google account
    const googleAccount = user.externalAccounts?.find(
      account => account.provider === 'google'
    )

    if (!googleAccount) {
      return NextResponse.json({ 
        error: 'No Google account',
        externalAccounts: user.externalAccounts?.map(acc => ({
          provider: acc.provider,
          verified: acc.verification?.status
        }))
      })
    }

    // Test both token URLs
    const tokenUrl1 = `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/oauth_google`
    const tokenUrl2 = `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/google`

    const results = {
      userId,
      googleAccountId: googleAccount.id,
      googleAccountVerified: googleAccount.verification?.status,
      clerkSecretKeyExists: !!process.env.CLERK_SECRET_KEY,
      tokenUrl1,
      tokenUrl2,
      tokenUrl1Response: null as any,
      tokenUrl2Response: null as any
    }

    // Test first URL
    try {
      const response1 = await fetch(tokenUrl1, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      })
      results.tokenUrl1Response = {
        status: response1.status,
        ok: response1.ok,
        data: response1.ok ? await response1.json() : await response1.text()
      }
    } catch (error) {
      results.tokenUrl1Response = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Test second URL
    try {
      const response2 = await fetch(tokenUrl2, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      })
      results.tokenUrl2Response = {
        status: response2.status,
        ok: response2.ok,
        data: response2.ok ? await response2.json() : await response2.text()
      }
    } catch (error) {
      results.tokenUrl2Response = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return NextResponse.json(results)

  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
