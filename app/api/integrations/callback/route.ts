import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const success = searchParams.get('success')
  const error = searchParams.get('error')
  
  // Redirect back to dashboard with status
  const redirectUrl = new URL('/dashboard', request.url)
  
  if (success === 'true') {
    redirectUrl.searchParams.set('connection', 'success')
  } else if (error) {
    redirectUrl.searchParams.set('connection', 'error')
    redirectUrl.searchParams.set('message', error)
  }
  
  return NextResponse.redirect(redirectUrl)
}