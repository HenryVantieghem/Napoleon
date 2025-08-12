import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { startConnect, type Provider } from '@/lib/nango'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider') as Provider

    // Validate provider
    if (!provider || !['google', 'slack'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be google or slack' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = getSupabaseServerClient(cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Start OAuth connection flow with Nango
    const authUrl = startConnect(provider, user.id)

    // Redirect to Nango OAuth flow (302 redirect)
    return NextResponse.redirect(authUrl)

  } catch (error) {
    console.error('Integration start error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}