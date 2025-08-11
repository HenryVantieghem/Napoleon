#!/usr/bin/env node

/**
 * Performance Test Suite for Napoleon AI API Optimization
 * Tests the API optimization middleware, request batching, and payload compression
 */

const { performance } = require('perf_hooks');

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  testEndpoints: [
    '/api/messages/unified',
    '/api/messages/gmail', 
    '/api/messages/slack',
    '/api/cache/performance'
  ],
  iterations: 5,
  timeout: 30000 // 30 seconds
};

// Performance metrics
const metrics = {
  responseTime: [],
  payloadSizes: [],
  compressionSavings: [],
  cacheHits: 0,
  totalRequests: 0
};

/**
 * Test API endpoint performance
 */
async function testEndpoint(url, iterations = 5) {
  console.log(`\n🧪 Testing endpoint: ${url}`);
  
  const endpointMetrics = {
    responseTimes: [],
    payloadSizes: [],
    compressionSavings: [],
    cacheHits: 0,
    errors: 0
  };

  for (let i = 0; i < iterations; i++) {
    try {
      const startTime = performance.now();
      
      // Make request with optimization headers
      const response = await fetch(`${TEST_CONFIG.baseUrl}${url}`, {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache', // Force fresh requests for first test
          'X-Performance-Test': 'true'
        }
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      if (!response.ok) {
        console.warn(`⚠️  HTTP ${response.status}: ${response.statusText}`);
        endpointMetrics.errors++;
        continue;
      }

      // Get response data and measure payload
      const responseText = await response.text();
      const payloadSize = new Blob([responseText]).size;

      // Extract optimization headers
      const originalSize = parseInt(response.headers.get('X-Original-Size') || '0');
      const optimizedSize = parseInt(response.headers.get('X-Optimized-Size') || '0');
      const payloadSavings = response.headers.get('X-Payload-Savings');
      const cacheHit = response.headers.get('X-Cache') === 'HIT';
      const isOptimized = response.headers.get('X-Optimized') === 'true';

      // Record metrics
      endpointMetrics.responseTimes.push(responseTime);
      endpointMetrics.payloadSizes.push(payloadSize);
      
      if (payloadSavings) {
        endpointMetrics.compressionSavings.push(parseFloat(payloadSavings));
      }
      
      if (cacheHit) {
        endpointMetrics.cacheHits++;
      }

      // Log individual result
      console.log(`  📊 Request ${i + 1}:`);
      console.log(`     Response Time: ${responseTime.toFixed(1)}ms`);
      console.log(`     Payload Size: ${(payloadSize / 1024).toFixed(2)}KB`);
      console.log(`     Optimized: ${isOptimized ? '✅' : '❌'}`);
      if (payloadSavings) console.log(`     Compression: ${payloadSavings} savings`);
      if (cacheHit) console.log(`     Cache: 🎯 HIT`);

      // Add to global metrics
      metrics.responseTime.push(responseTime);
      metrics.payloadSizes.push(payloadSize);
      if (payloadSavings) metrics.compressionSavings.push(parseFloat(payloadSavings));
      if (cacheHit) metrics.cacheHits++;
      metrics.totalRequests++;

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Request ${i + 1} failed:`, error.message);
      endpointMetrics.errors++;
    }
  }

  // Calculate endpoint summary
  const avgResponseTime = endpointMetrics.responseTimes.reduce((a, b) => a + b, 0) / endpointMetrics.responseTimes.length || 0;
  const avgPayloadSize = endpointMetrics.payloadSizes.reduce((a, b) => a + b, 0) / endpointMetrics.payloadSizes.length || 0;
  const avgCompression = endpointMetrics.compressionSavings.reduce((a, b) => a + b, 0) / endpointMetrics.compressionSavings.length || 0;

  console.log(`\n📈 ${url} Summary:`);
  console.log(`   Average Response Time: ${avgResponseTime.toFixed(1)}ms`);
  console.log(`   Average Payload Size: ${(avgPayloadSize / 1024).toFixed(2)}KB`);
  console.log(`   Cache Hit Rate: ${((endpointMetrics.cacheHits / iterations) * 100).toFixed(1)}%`);
  if (avgCompression > 0) console.log(`   Average Compression: ${avgCompression.toFixed(1)}%`);
  console.log(`   Success Rate: ${(((iterations - endpointMetrics.errors) / iterations) * 100).toFixed(1)}%`);

  return endpointMetrics;
}

/**
 * Test cache performance by making repeated requests
 */
async function testCachePerformance() {
  console.log(`\n🔄 Testing Cache Performance`);
  
  const testUrl = `${TEST_CONFIG.baseUrl}/api/cache/performance`;
  const iterations = 3;
  
  console.log(`Making ${iterations} requests to test cache behavior...`);

  for (let i = 0; i < iterations; i++) {
    try {
      const startTime = performance.now();
      const response = await fetch(testUrl, {
        headers: { 'Accept': 'application/json' }
      });
      const endTime = performance.now();

      const cacheStatus = response.headers.get('X-Cache') || 'MISS';
      const responseTime = endTime - startTime;

      console.log(`  Request ${i + 1}: ${responseTime.toFixed(1)}ms (${cacheStatus})`);

      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Cache test ${i + 1} failed:`, error.message);
    }
  }
}

/**
 * Test request batching by making simultaneous requests
 */
async function testRequestBatching() {
  console.log(`\n⚡ Testing Request Batching`);
  
  const batchSize = 5;
  const testUrl = `${TEST_CONFIG.baseUrl}/api/cache/performance`;
  
  console.log(`Making ${batchSize} simultaneous requests...`);

  const startTime = performance.now();
  
  try {
    const promises = Array(batchSize).fill().map(() => 
      fetch(testUrl, {
        headers: { 
          'Accept': 'application/json',
          'X-Batch-Test': 'true'
        }
      })
    );

    const responses = await Promise.all(promises);
    const endTime = performance.now();
    const totalTime = endTime - startTime;

    console.log(`  Total Time: ${totalTime.toFixed(1)}ms`);
    console.log(`  Average per Request: ${(totalTime / batchSize).toFixed(1)}ms`);
    console.log(`  Success Rate: ${(responses.filter(r => r.ok).length / batchSize * 100).toFixed(1)}%`);

    // Check for batch optimization headers
    responses.forEach((response, index) => {
      const batchId = response.headers.get('X-Batch-ID');
      const isOptimized = response.headers.get('X-Optimized') === 'true';
      if (batchId) console.log(`  Request ${index + 1}: Batch ID ${batchId} ${isOptimized ? '(optimized)' : ''}`);
    });

  } catch (error) {
    console.error(`Batch test failed:`, error.message);
  }
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary() {
  if (metrics.totalRequests === 0) {
    console.log(`\n❌ No successful requests to analyze`);
    return;
  }

  const avgResponseTime = metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length;
  const avgPayloadSize = metrics.payloadSizes.reduce((a, b) => a + b, 0) / metrics.payloadSizes.length;
  const avgCompression = metrics.compressionSavings.length > 0 
    ? metrics.compressionSavings.reduce((a, b) => a + b, 0) / metrics.compressionSavings.length 
    : 0;
  const cacheHitRate = (metrics.cacheHits / metrics.totalRequests) * 100;

  console.log(`\n🎯 EXECUTIVE PERFORMANCE SUMMARY`);
  console.log(`=======================================`);
  console.log(`📊 Average Response Time: ${avgResponseTime.toFixed(1)}ms`);
  console.log(`📦 Average Payload Size: ${(avgPayloadSize / 1024).toFixed(2)}KB`);
  console.log(`🗜️  Average Compression: ${avgCompression.toFixed(1)}% savings`);
  console.log(`⚡ Cache Hit Rate: ${cacheHitRate.toFixed(1)}%`);
  console.log(`✅ Total Requests: ${metrics.totalRequests}`);

  // Performance scoring
  let score = 100;
  if (avgResponseTime > 1000) score -= 30;
  else if (avgResponseTime > 500) score -= 15;
  
  if (avgPayloadSize > 100000) score -= 20; // >100KB
  else if (avgPayloadSize > 50000) score -= 10; // >50KB
  
  if (cacheHitRate < 50) score -= 15;
  
  if (avgCompression < 10 && avgPayloadSize > 10000) score -= 10;

  console.log(`🏆 Performance Score: ${Math.max(0, score)}/100`);
  
  // Recommendations
  console.log(`\n💡 Recommendations:`);
  if (avgResponseTime > 500) console.log(`   • Response times exceed executive standards (>500ms)`);
  if (avgPayloadSize > 50000) console.log(`   • Consider further payload optimization (>50KB average)`);
  if (cacheHitRate < 70) console.log(`   • Cache hit rate could be improved (target: >70%)`);
  if (avgCompression < 15 && avgPayloadSize > 10000) console.log(`   • Compression effectiveness could be enhanced`);
  
  if (score >= 90) console.log(`   ✨ System meets executive-grade performance standards!`);
  else if (score >= 70) console.log(`   👍 Good performance with room for minor improvements`);
  else console.log(`   📈 Performance improvements recommended for optimal executive experience`);
}

/**
 * Main test runner
 */
async function runPerformanceTests() {
  console.log(`🚀 Napoleon AI - Performance Test Suite`);
  console.log(`======================================`);
  console.log(`Testing against: ${TEST_CONFIG.baseUrl}`);
  console.log(`Iterations per endpoint: ${TEST_CONFIG.iterations}\n`);

  try {
    // Test individual endpoints
    for (const endpoint of TEST_CONFIG.testEndpoints) {
      await testEndpoint(endpoint, TEST_CONFIG.iterations);
    }

    // Test caching behavior
    await testCachePerformance();

    // Test request batching
    await testRequestBatching();

    // Generate summary
    generateExecutiveSummary();

  } catch (error) {
    console.error(`\n❌ Performance test suite failed:`, error);
    process.exit(1);
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  runPerformanceTests()
    .then(() => {
      console.log(`\n✅ Performance testing complete`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(`\n❌ Performance testing failed:`, error);
      process.exit(1);
    });
}

module.exports = { runPerformanceTests, testEndpoint };