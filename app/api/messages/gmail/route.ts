import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NANGO } from '@/lib/nango'

export const runtime = 'nodejs'

interface GmailMessage {
  id: string
  threadId: string
  snippet: string
  payload: {
    headers: Array<{ name: string; value: string }>
  }
  internalDate: string
}

interface GmailListResponse {
  messages: Array<{ id: string; threadId: string }>
}

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

    // Check if user has Google connection
    const { data: connection } = await supabase
      .from('nango_connections')
      .select('connection_id')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .single()

    if (!connection) {
      return NextResponse.json({ messages: [] })
    }

    const connectionId = connection.connection_id

    // Get message list via Nango proxy
    const listUrl = `${NANGO.host}/proxy`
    const listBody = {
      connection_id: connectionId,
      provider_config_key: 'google',
      endpoint: 'https://gmail.googleapis.com/gmail/v1/users/me/messages',
      params: { 
        q: 'newer_than:7d in:inbox', 
        maxResults: 50 
      },
      method: 'GET'
    }

    const listResponse = await fetch(listUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NANGO.secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(listBody)
    })

    if (!listResponse.ok) {
      console.error('Nango list request failed:', listResponse.statusText)
      return NextResponse.json({ messages: [] })
    }

    const listData: GmailListResponse = await listResponse.json()

    if (!listData.messages || listData.messages.length === 0) {
      return NextResponse.json({ messages: [] })
    }

    // Fetch message details in batches via Nango proxy
    const messages = []
    const batchSize = 10
    const messageIds = listData.messages.slice(0, 25) // Limit for performance

    for (let i = 0; i < messageIds.length; i += batchSize) {
      const batch = messageIds.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (msg) => {
        try {
          const detailUrl = `${NANGO.host}/proxy`
          const detailBody = {
            connection_id: connectionId,
            provider_config_key: 'google',
            endpoint: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
            params: { format: 'full' },
            method: 'GET'
          }

          const detailResponse = await fetch(detailUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${NANGO.secret}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(detailBody)
          })

          if (!detailResponse.ok) {
            console.error(`Failed to fetch message ${msg.id}:`, detailResponse.statusText)
            return null
          }

          const messageData: GmailMessage = await detailResponse.json()
          
          // Extract headers
          const headers = messageData.payload?.headers || []
          const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender'
          const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject'
          const date = headers.find(h => h.name === 'Date')?.value || ''

          // Parse sender
          const senderMatch = from.match(/^(.+?)\s*<(.+)>$/) || from.match(/^(.+)$/)
          const senderName = senderMatch ? (senderMatch[1] || senderMatch[0]).trim().replace(/"/g, '') : 'Unknown'

          // Create normalized message
          return {
            id: messageData.id,
            provider: 'google',
            subject,
            sender: senderName,
            snippet: messageData.snippet || '',
            received_at: date ? new Date(date).toISOString() : new Date(parseInt(messageData.internalDate)).toISOString()
          }
        } catch (error) {
          console.error(`Error processing message ${msg.id}:`, error)
          return null
        }
      })

      const batchResults = await Promise.all(batchPromises)
      const validMessages = batchResults.filter(msg => msg !== null)
      messages.push(...validMessages)
    }

    return NextResponse.json({ 
      messages,
      totalCount: messages.length,
      source: 'gmail',
      fetchedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Gmail API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Gmail messages' },
      { status: 500 }
    )
  }
}