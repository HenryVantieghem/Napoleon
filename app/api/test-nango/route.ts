import { NextRequest, NextResponse } from 'next/server'
import { startConnect, getConnId, nangoDb } from '@/lib/nango'

export async function GET(request: NextRequest) {
  try {
    // Test 1: getConnId
    const connId = getConnId('test-user-123', 'google')
    
    // Test 2: startConnect URL generation
    const authUrl = startConnect('google', 'test-user-123')
    
    // Test results
    const tests = {
      getConnId: {
        input: { userId: 'test-user-123', provider: 'google' },
        output: connId,
        expected: 'test-user-123-google',
        passed: connId === 'test-user-123-google'
      },
      startConnect: {
        input: { provider: 'google', userId: 'test-user-123' },
        output: authUrl,
        isValidUrl: authUrl.includes('/oauth/authorize'),
        hasConnectionId: authUrl.includes('test-user-123-google'),
        passed: authUrl.includes('/oauth/authorize') && authUrl.includes('test-user-123-google')
      },
      nangoDb: {
        available: typeof nangoDb === 'object',
        methods: Object.keys(nangoDb),
        passed: typeof nangoDb === 'object'
      }
    }
    
    const allPassed = Object.values(tests).every(test => test.passed)
    
    return NextResponse.json({
      success: allPassed,
      tests,
      summary: {
        total: Object.keys(tests).length,
        passed: Object.values(tests).filter(t => t.passed).length,
        failed: Object.values(tests).filter(t => !t.passed).length
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}