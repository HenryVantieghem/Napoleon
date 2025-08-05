import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { slackClient } from '@/lib/gmail-api/slack-client'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body

    switch (type) {
      case 'email_alert':
        const success = await slackClient.sendExecutiveEmailAlert(data)
        return NextResponse.json({ success })

      case 'system_alert':
        const systemSuccess = await slackClient.sendSystemAlert(
          data.title,
          data.message,
          data.severity || 'info'
        )
        return NextResponse.json({ success: systemSuccess })

      case 'test_connection':
        const testSuccess = await slackClient.testConnection()
        return NextResponse.json({ success: testSuccess })

      default:
        return NextResponse.json({ error: 'Invalid alert type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Slack integration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test connection
    const isConnected = await slackClient.testConnection()
    
    return NextResponse.json({ 
      connected: isConnected,
      service: 'slack',
      webhook_configured: !!process.env.SLACK_WEBHOOK_URL
    })
  } catch (error) {
    console.error('Slack status check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}