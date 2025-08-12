#!/usr/bin/env node

// Simple test script for Napoleon AI API endpoints
// Run with: node scripts/test-endpoints.js

const BASE_URL = 'http://localhost:3000'

async function testEndpoint(path, description) {
  try {
    console.log(`\n🔍 Testing: ${description}`)
    console.log(`   Endpoint: ${path}`)
    
    const response = await fetch(`${BASE_URL}${path}`)
    const statusColor = response.ok ? '✅' : '❌'
    
    console.log(`   Status: ${statusColor} ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      const data = await response.json()
      if (data.messages) {
        console.log(`   Messages: ${data.messages.length} found`)
      }
      if (data.connections) {
        console.log(`   Connections: Gmail=${data.connections.gmail}, Slack=${data.connections.slack}`)
      }
    } else {
      const errorData = await response.text().catch(() => 'No error details')
      console.log(`   Error: ${errorData.substring(0, 100)}...`)
    }
    
    return response.ok
  } catch (error) {
    console.log(`   ❌ Network Error: ${error.message}`)
    return false
  }
}

async function runTests() {
  console.log('🚀 Napoleon AI API Endpoint Tests')
  console.log('================================')
  
  const tests = [
    ['/api/messages/gmail', 'Gmail Messages API (requires auth)'],
    ['/api/messages/slack', 'Slack Messages API (requires auth)'],
    ['/api/messages/unified', 'Unified Messages API (requires auth)'],
    ['/api/user/connections', 'User Connections API (requires auth)'],
    ['/api/integrations/start?provider=google', 'Gmail OAuth Start (requires auth)'],
    ['/api/integrations/start?provider=slack', 'Slack OAuth Start (requires auth)']
  ]
  
  let passed = 0
  let total = tests.length
  
  for (const [path, description] of tests) {
    const success = await testEndpoint(path, description)
    if (success) passed++
  }
  
  console.log('\n📊 Test Results')
  console.log('===============')
  console.log(`Passed: ${passed}/${total}`)
  console.log(`Success Rate: ${Math.round((passed/total) * 100)}%`)
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! The API is working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. This is expected without authentication.')
    console.log('   To test with auth: login at /login and use browser dev tools')
  }
  
  console.log('\n📋 Next Steps:')
  console.log('1. Visit http://localhost:3000/login to authenticate')
  console.log('2. Connect Gmail/Slack via dashboard')
  console.log('3. Test SSE stream at /api/messages/unified/stream')
  console.log('4. Monitor browser DevTools Network tab for stream events')
}

// Add SSE stream test
async function testSSEStream() {
  console.log('\n🌊 Testing SSE Stream (requires auth)')
  console.log('=====================================')
  console.log('This test requires authentication. Use browser to test:')
  console.log('1. Login at http://localhost:3000/login')
  console.log('2. Open DevTools Network tab')
  console.log('3. Navigate to dashboard')
  console.log('4. Look for EventSource connection to /api/messages/unified/stream')
  console.log('5. Verify stream events arrive every 30 seconds')
}

// Run tests
runTests().then(() => {
  testSSEStream()
}).catch(console.error)