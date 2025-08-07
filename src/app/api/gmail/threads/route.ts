import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAuthenticatedGmailClient } from '@/lib/auth/gmail-auth'
import { PriorityScorer } from '@/lib/ai/priority-scorer'
import { OpenAIAnalyzer } from '@/lib/ai/openai-analyzer'
// import type { ThreadWithPriority } from '@/lib/types'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const count = parseInt(searchParams.get('count') || '10', 10)
    const maxCount = Math.min(count, 50) // Limit to prevent abuse

    // Create authenticated Gmail client
    const gmailClient = await createAuthenticatedGmailClient()
    
    if (!gmailClient) {
      return NextResponse.json(
        { 
          error: 'Gmail access not available. Please reconnect your Gmail account.',
          code: 'GMAIL_ACCESS_REQUIRED'
        }, 
        { status: 403 }
      )
    }

    // Get OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured')
      return NextResponse.json(
        { 
          error: 'AI analysis temporarily unavailable',
          code: 'AI_SERVICE_UNAVAILABLE'
        }, 
        { status: 503 }
      )
    }

    // Initialize AI analyzer and priority scorer
    const openaiAnalyzer = new OpenAIAnalyzer(openaiApiKey)
    const priorityScorer = new PriorityScorer(openaiAnalyzer)

    // Fetch Gmail threads
    const threads = await gmailClient.fetchLatestThreads(maxCount)
    
    if (threads.length === 0) {
      return NextResponse.json({
        threads: [],
        stats: {
          total: 0,
          gold: 0,
          silver: 0,
          bronze: 0,
          standard: 0
        }
      })
    }

    // Score threads with AI analysis
    const scoredThreads = await priorityScorer.scoreThreads(threads)

    // Calculate stats
    const stats = {
      total: scoredThreads.length,
      gold: scoredThreads.filter(t => t.priorityTier === 'gold').length,
      silver: scoredThreads.filter(t => t.priorityTier === 'silver').length,
      bronze: scoredThreads.filter(t => t.priorityTier === 'bronze').length,
      standard: scoredThreads.filter(t => t.priorityTier === 'standard').length,
    }

    // Return sorted by priority (highest first)
    return NextResponse.json({
      threads: scoredThreads,
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Gmail threads API error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      // Gmail API errors
      if (error.message.includes('Gmail API Error')) {
        return NextResponse.json(
          { 
            error: 'Failed to fetch Gmail data. Please check your Gmail connection.',
            details: error.message
          }, 
          { status: 502 }
        )
      }

      // OpenAI API errors
      if (error.message.includes('OpenAI') || error.message.includes('rate limit')) {
        return NextResponse.json(
          { 
            error: 'AI analysis temporarily unavailable. Please try again later.',
            details: error.message
          }, 
          { status: 503 }
        )
      }

      // Authentication errors
      if (error.message.includes('not authenticated') || error.message.includes('access token')) {
        return NextResponse.json(
          { 
            error: 'Gmail authorization required. Please reconnect your account.',
            code: 'AUTH_REQUIRED'
          }, 
          { status: 401 }
        )
      }
    }

    // Generic server error
    return NextResponse.json(
      { 
        error: 'Internal server error occurred while fetching email threads',
        code: 'INTERNAL_ERROR'
      }, 
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function HEAD() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new NextResponse(null, { status: 401 })
    }

    // Quick health check - just verify we can create a client
    const gmailClient = await createAuthenticatedGmailClient()
    
    if (!gmailClient) {
      return new NextResponse(null, { status: 403 })
    }

    return new NextResponse(null, { status: 200 })
  } catch {
    return new NextResponse(null, { status: 500 })
  }
}