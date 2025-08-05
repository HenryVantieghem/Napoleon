import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check
    const timestamp = new Date().toISOString();
    
    // Check environment variables
    const requiredEnvs = [
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY'
    ];
    
    const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
    
    const health = {
      status: 'healthy',
      timestamp,
      version: process.env.npm_package_version || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      features: {
        clerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        openai: !!process.env.OPENAI_API_KEY,
        analytics: !!process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
      },
      checks: {
        envVars: missingEnvs.length === 0 ? 'pass' : 'fail',
        missingEnvs: missingEnvs.length > 0 ? missingEnvs : undefined
      }
    };

    return NextResponse.json(health, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function HEAD() {
  // Simple HEAD request for basic uptime monitoring
  return new Response(null, { status: 200 });
}