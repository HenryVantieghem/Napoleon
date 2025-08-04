import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const timestamp = new Date().toISOString()
    
    // Collect system metrics
    const memoryUsage = process.memoryUsage()
    const uptime = process.uptime()
    
    // Check external dependencies
    const supabaseHealthy = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const openaiHealthy = !!process.env.OPENAI_API_KEY
    
    // Performance metrics
    const performanceMetrics = {
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
        external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100, // MB
      },
      uptime: Math.round(uptime),
      timestamp,
      
      // Service health
      services: {
        supabase: {
          status: supabaseHealthy ? 'healthy' : 'unhealthy',
          responseTime: null, // Would measure actual response time in production
        },
        openai: {
          status: openaiHealthy ? 'healthy' : 'unhealthy',
          responseTime: null,
        },
        gmail_api: {
          status: 'depends_on_auth', // Requires user authentication
          responseTime: null,
        }
      },
      
      // Application metrics
      application: {
        version: process.env.npm_package_version || 'unknown',
        environment: process.env.NODE_ENV || 'development',
        build_time: process.env.BUILD_TIME || 'unknown',
        commit_hash: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'unknown',
      },
      
      // Feature flags
      features: {
        ai_priority_scoring: openaiHealthy,
        gmail_integration: supabaseHealthy,
        luxury_ui: true,
        error_detection: true,
        monitoring: true,
      }
    }
    
    return NextResponse.json({
      status: 'operational',
      timestamp,
      metrics: performanceMetrics
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('Metrics collection failed:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown metrics error'
    }, { 
      status: 500 
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event, data } = body
    
    // Log custom events (in production, send to analytics service)
    console.log(`[METRICS] ${event}:`, data)
    
    // Here you would typically send to your analytics service
    // Examples: Mixpanel, Google Analytics, PostHog, etc.
    
    return NextResponse.json({
      status: 'logged',
      timestamp: new Date().toISOString(),
      event,
      acknowledged: true
    })
    
  } catch (error) {
    console.error('Event logging failed:', error)
    
    return NextResponse.json({
      status: 'error',
      error: 'Failed to log event'
    }, { 
      status: 400 
    })
  }
}