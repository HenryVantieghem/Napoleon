import { NextResponse } from 'next/server';
import { testSlackConnection, isSlackConfigured } from '@/lib/slack/client';

export async function GET() {
  try {
    console.log('🔍 [SLACK STATUS] Testing Slack connection...');
    
    const tokenConfigured = isSlackConfigured();
    console.log('🔑 [SLACK STATUS] SLACK_BOT_TOKEN configured:', tokenConfigured);
    
    if (!tokenConfigured) {
      return NextResponse.json({
        connected: false,
        configured: false,
        error: 'SLACK_BOT_TOKEN environment variable not set'
      });
    }
    
    const connectionTest = await testSlackConnection();
    console.log('✅ [SLACK STATUS] Connection test result:', connectionTest);
    
    return NextResponse.json({
      connected: connectionTest,
      configured: true,
      error: connectionTest ? null : 'Slack API test failed - check token permissions'
    });
    
  } catch (error) {
    console.error('❌ [SLACK STATUS] Error testing Slack connection:', error);
    return NextResponse.json({
      connected: false,
      configured: isSlackConfigured(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}