import { NextResponse } from 'next/server'

// This is a public route to test environment and basic functionality
export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasClerkPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        hasClerkSecretKey: !!process.env.CLERK_SECRET_KEY,
        clerkPublishableKeyPrefix: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + '...',
        clerkSecretKeyPrefix: process.env.CLERK_SECRET_KEY?.substring(0, 20) + '...',
      },
      nextjs: {
        runtime: 'edge' in global ? 'edge' : 'nodejs',
        version: process.version || 'unknown'
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Basic API test successful',
      diagnostics
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: 'Basic API test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
