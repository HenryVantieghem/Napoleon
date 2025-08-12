import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getUserConnections } from '@/lib/nango-handlers'
import { normalizeMessages, type NormalizedMessage } from '@/lib/normalize'
import { messageCacheHelpers } from '@/lib/cache'

export const runtime = 'edge'

// In-memory store for tracking last seen messages per user
const userLastMessages = new Map<string, Set<string>>()

// Helper function to fetch messages
async function fetchMessages(userId: string, cookie: string): Promise<NormalizedMessage[]> {
  try {
    const connections = await getUserConnections(userId)
    
    if (!connections.gmail && !connections.slack) {
      return []
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const fetchPromises = []
    
    if (connections.gmail) {
      fetchPromises.push(
        fetch(`${baseUrl}/api/messages/gmail`, {
          headers: { 'Cookie': cookie }
        }).then(res => res.ok ? res.json() : null).catch(() => null)
      )
    } else {
      fetchPromises.push(Promise.resolve(null))
    }

    if (connections.slack) {
      fetchPromises.push(
        fetch(`${baseUrl}/api/messages/slack`, {
          headers: { 'Cookie': cookie }
        }).then(res => res.ok ? res.json() : null).catch(() => null)
      )
    } else {
      fetchPromises.push(Promise.resolve(null))
    }

    const [gmailData, slackData] = await Promise.all(fetchPromises)
    return normalizeMessages(gmailData, slackData)
    
  } catch (error) {
    console.error('Error fetching messages for SSE:', error)
    return []
  }
}

// Helper function to detect new messages
function getNewMessages(userId: string, messages: NormalizedMessage[]): NormalizedMessage[] {
  const lastSeenIds = userLastMessages.get(userId) || new Set()
  const newMessages = messages.filter(msg => !lastSeenIds.has(msg.id))
  
  // Update the last seen messages
  const newIds = new Set(messages.map(msg => msg.id))
  userLastMessages.set(userId, newIds)
  
  return newMessages
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = getSupabaseServerClient(cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const userId = user.id
    const cookie = request.headers.get('cookie') || ''

    // Set up SSE headers with proper security and performance settings
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? '*' : process.env.NEXT_PUBLIC_APP_URL || '',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
      'Access-Control-Allow-Credentials': 'true',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    }

    // Create a readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        // Log connection start
        console.log(`🌊 SSE: New connection established for user ${userId}`)

        // Send connection confirmation
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ 
            type: 'connected', 
            timestamp: new Date().toISOString(),
            userId: userId.substring(0, 8) + '...' // Partial ID for logging
          })}\n\n`)
        )

        // Send initial full feed
        try {
          // Check cache first
          let initialMessages = messageCacheHelpers.getCachedUnifiedMessages(userId)
          
          if (!initialMessages) {
            console.log(`📥 SSE: Fetching fresh messages for user ${userId}`)
            initialMessages = await fetchMessages(userId, cookie)
            
            // Cache the results
            messageCacheHelpers.cacheUnifiedMessages(userId, initialMessages)
          } else {
            console.log(`⚡ SSE: Using cached messages for user ${userId} (${initialMessages.length} messages)`)
          }
          
          // Initialize user's seen messages
          const initialIds = new Set(initialMessages.map(msg => msg.id))
          userLastMessages.set(userId, initialIds)

          // Get connection status
          const connections = await getUserConnections(userId)

          // Send initial data with enhanced metadata
          const initialData = {
            type: 'feed_update',
            messages: initialMessages,
            connections: {
              gmail: !!connections.gmail,
              slack: !!connections.slack
            },
            metadata: {
              count: initialMessages.length,
              urgent: initialMessages.filter(m => m.priority >= 80).length,
              cached: !!messageCacheHelpers.getCachedUnifiedMessages(userId),
              timestamp: new Date().toISOString()
            }
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`)
          )

          console.log(`✅ SSE: Sent initial feed to user ${userId} - ${initialMessages.length} messages (${initialData.metadata.urgent} urgent)`)
        } catch (error) {
          console.error('❌ SSE: Error sending initial data:', error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: 'Failed to load initial messages',
              details: process.env.NODE_ENV === 'development' ? error.message : undefined,
              timestamp: new Date().toISOString()
            })}\n\n`)
          )
        }

        // Set up periodic updates every 30 seconds
        const intervalId = setInterval(async () => {
          try {
            console.log(`🔄 SSE: Checking for updates for user ${userId}`)
            
            const currentMessages = await fetchMessages(userId, cookie)
            const newMessages = getNewMessages(userId, currentMessages)

            if (newMessages.length > 0) {
              // Update cache with fresh data
              messageCacheHelpers.cacheUnifiedMessages(userId, currentMessages)
              
              // Get connection status
              const connections = await getUserConnections(userId)

              const updateData = {
                type: 'feed_update',
                messages: currentMessages, // Send full feed for simplicity
                connections: {
                  gmail: !!connections.gmail,
                  slack: !!connections.slack
                },
                metadata: {
                  newCount: newMessages.length,
                  totalCount: currentMessages.length,
                  urgent: currentMessages.filter(m => m.priority >= 80).length,
                  timestamp: new Date().toISOString()
                }
              }

              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(updateData)}\n\n`)
              )

              console.log(`📨 SSE: Sent update to user ${userId} - ${newMessages.length} new messages (${updateData.metadata.urgent} urgent total)`)
            } else {
              // Send heartbeat to keep connection alive
              const heartbeat = {
                type: 'heartbeat',
                timestamp: new Date().toISOString(),
                uptime: Math.floor(process.uptime()),
                connections: await getUserConnections(userId).then(c => ({
                  gmail: !!c.gmail,
                  slack: !!c.slack
                })).catch(() => ({ gmail: false, slack: false }))
              }
              
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(heartbeat)}\n\n`)
              )
              
              console.log(`💓 SSE: Heartbeat sent to user ${userId}`)
            }
          } catch (error) {
            console.error('❌ SSE: Error in periodic update:', error)
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: 'error', 
                error: 'Failed to check for updates',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                timestamp: new Date().toISOString()
              })}\n\n`)
            )
          }
        }, 30000) // 30 seconds

        // Clean up when client disconnects
        request.signal?.addEventListener('abort', () => {
          console.log(`🔌 SSE: Client disconnected for user ${userId}`)
          clearInterval(intervalId)
          userLastMessages.delete(userId)
          // Clean up cache entries older than 1 hour
          messageCacheHelpers.invalidateUserMessages(userId)
          controller.close()
        })

        // Also clean up after 10 minutes to prevent memory leaks
        const timeoutId = setTimeout(() => {
          console.log(`⏰ SSE: Connection timeout reached for user ${userId} (10 minutes)`)
          clearInterval(intervalId)
          userLastMessages.delete(userId)
          try {
            controller.close()
          } catch (e) {
            // Connection might already be closed
            console.log(`⚠️ SSE: Error closing controller for user ${userId}:`, e.message)
          }
        }, 10 * 60 * 1000) // 10 minutes

        // Clean up timeout on disconnect
        request.signal?.addEventListener('abort', () => {
          clearTimeout(timeoutId)
        })
      }
    })

    return new Response(stream, { headers })

  } catch (error) {
    console.error('💥 SSE: Fatal error in stream setup:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        message: 'Failed to establish SSE connection',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}