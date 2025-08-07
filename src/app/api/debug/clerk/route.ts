import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Debug API called')
    
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        userId: null,
        hasAuth: false
      })
    }

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        userId,
        hasAuth: true,
        hasUser: false
      })
    }

    // Check external accounts
    const externalAccounts = user.externalAccounts?.map(acc => ({
      id: acc.id,
      provider: acc.provider,
      verified: acc.verification?.status,
      emailAddress: acc.emailAddress || 'N/A'
    })) || []

    return NextResponse.json({
      success: true,
      userId,
      hasAuth: true,
      hasUser: true,
      userEmail: user.emailAddresses?.[0]?.emailAddress,
      externalAccounts,
      accountCount: externalAccounts.length,
      environment: {
        hasClerkSecretKey: !!process.env.CLERK_SECRET_KEY,
        clerkSecretKeyLength: process.env.CLERK_SECRET_KEY?.length || 0
      }
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
