import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { nangoDb, getConnId, type Provider } from '@/lib/nango'
import crypto from 'crypto'

// Verify Nango webhook signature (optional but recommended)
function verifyNangoSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('x-nango-signature')

    // Verify signature if configured
    if (process.env.NANGO_WEBHOOK_SECRET && signature) {
      if (!verifyNangoSignature(payload, signature, process.env.NANGO_WEBHOOK_SECRET)) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const webhookData = JSON.parse(payload)
    
    // Extract webhook details
    const { type, connectionId, providerConfigKey, metadata } = webhookData
    
    // Only handle auth success events
    if (type !== 'auth' || !connectionId) {
      return NextResponse.json({ status: 'ignored' })
    }

    // Parse connection ID to get user ID and provider
    const [userId, provider] = connectionId.split('-')
    
    if (!userId || !provider || !['google', 'slack'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid connection ID format' },
        { status: 400 }
      )
    }

    // Use the nangoDb helper to upsert the connection
    const success = await nangoDb.upsertConnection({
      user_id: userId,
      provider: provider as Provider,
      connection_id: connectionId,
      // Store any tokens if provided by webhook
      access_token: metadata?.access_token,
      refresh_token: metadata?.refresh_token,
      expires_at: metadata?.expires_at,
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to store connection' },
        { status: 500 }
      )
    }

    console.log(`Successfully stored ${provider} connection for user ${userId}`)
    
    return NextResponse.json({ status: 'success' })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}