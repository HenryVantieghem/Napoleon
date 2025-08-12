import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const provider = searchParams.get('provider')
  
  if (provider === 'google') {
    // Simulate what startConnect would return
    const nangoHost = 'https://api.nango.dev'
    const connectionId = 'test-user-google'
    const redirectUri = 'http://localhost:3000/api/integrations/callback'
    
    const authUrl = `${nangoHost}/oauth/authorize?connection_id=${connectionId}&provider_config_key=google&redirect_uri=${encodeURIComponent(redirectUri)}`
    
    // Return a 302 redirect to Nango
    return NextResponse.redirect(authUrl)
  }
  
  return NextResponse.json({ error: 'Provider required' }, { status: 400 })
}