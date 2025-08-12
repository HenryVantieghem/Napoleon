import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getUserConnections, getConnectionDetails } from '@/lib/nango-handlers'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = getSupabaseServerClient(cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get connection status and details
    const connections = await getUserConnections(user.id)
    const details = await getConnectionDetails(user.id)

    // Format response to match the old token API structure
    const response = {
      connected: {
        gmail: connections.gmail,
        slack: connections.slack
      },
      expires: {
        gmail: null, // Nango handles token refresh automatically
        slack: null  // Slack tokens generally don't expire
      },
      status: 'success',
      details: {
        gmail: {
          connected: details.gmail.connected,
          expired: false, // Nango handles refresh automatically
          connectedAt: details.gmail.connectedAt
        },
        slack: {
          connected: details.slack.connected,
          teamName: null, // Could be fetched from Slack API if needed
          connectedAt: details.slack.connectedAt
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching user connections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}