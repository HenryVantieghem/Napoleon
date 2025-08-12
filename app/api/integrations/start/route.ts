import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NANGO } from '@/lib/nango'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

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

    // Generate connection ID
    const connectionId = `${user.id}-${provider}`
    
    // Get app URL from environment or request
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   `${request.nextUrl.protocol}//${request.nextUrl.host}`

    // Construct Nango OAuth URL
    const nangoUrl = new URL(`/oauth/connect/${provider}`, NANGO.host)
    nangoUrl.searchParams.set('connection_id', connectionId)
    nangoUrl.searchParams.set('success_url', `${appUrl}/dashboard`)
    nangoUrl.searchParams.set('error_url', `${appUrl}/dashboard`)

    // Redirect to Nango OAuth flow
    return NextResponse.redirect(nangoUrl.toString())

  } catch (error) {
    console.error('Integration start error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}