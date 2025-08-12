import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getUserConnections } from '@/lib/nango-handlers'
import { normalizeMessages } from '@/lib/normalize'

export const runtime = 'nodejs'

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

    // Get user's connection status
    const connections = await getUserConnections(user.id)

    if (!connections.gmail && !connections.slack) {
      return NextResponse.json({
        messages: [],
        stats: {
          priority: { urgent: 0, question: 0, normal: 0, total: 0 },
          sources: { gmail: 0, slack: 0 }
        },
        connections,
        fetchedAt: new Date().toISOString()
      })
    }

    // Fetch from both providers in parallel
    const fetchPromises = []
    
    if (connections.gmail) {
      fetchPromises.push(
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/messages/gmail`, {
          headers: {
            'Cookie': request.headers.get('cookie') || '',
            'Authorization': request.headers.get('authorization') || ''
          }
        }).then(res => res.ok ? res.json() : null).catch(() => null)
      )
    } else {
      fetchPromises.push(Promise.resolve(null))
    }

    if (connections.slack) {
      fetchPromises.push(
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/messages/slack`, {
          headers: {
            'Cookie': request.headers.get('cookie') || '',
            'Authorization': request.headers.get('authorization') || ''
          }
        }).then(res => res.ok ? res.json() : null).catch(() => null)
      )
    } else {
      fetchPromises.push(Promise.resolve(null))
    }

    // Wait for both requests to complete
    const [gmailData, slackData] = await Promise.all(fetchPromises)

    // Normalize and merge messages with priority scoring
    const normalizedMessages = normalizeMessages(gmailData, slackData)

    // Calculate statistics
    const priorityStats = {
      urgent: normalizedMessages.filter(m => m.priority_score >= 60).length,
      question: normalizedMessages.filter(m => m.priority_score >= 20 && m.priority_score < 60).length,
      normal: normalizedMessages.filter(m => m.priority_score < 20).length,
      total: normalizedMessages.length
    }

    const sourceStats = {
      gmail: normalizedMessages.filter(m => m.provider === 'google').length,
      slack: normalizedMessages.filter(m => m.provider === 'slack').length
    }

    return NextResponse.json({
      messages: normalizedMessages,
      stats: {
        priority: priorityStats,
        sources: sourceStats
      },
      connections,
      fetchedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Unified API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unified messages' },
      { status: 500 }
    )
  }
}