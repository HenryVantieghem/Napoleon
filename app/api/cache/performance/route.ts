import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getCachePerformanceReport, invalidateUserCache } from '@/lib/cache-manager';
import { withAPIOptimization } from '@/middleware/api-optimization';

export const runtime = 'nodejs';

// GET /api/cache/performance - Get cache performance metrics
async function handleCachePerformanceGet(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient(cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get comprehensive cache performance report
    const performanceReport = getCachePerformanceReport();
    
    // Calculate overall metrics
    const totalHits = Object.values(performanceReport).reduce((sum, cache) => sum + cache.metrics.hitRate * cache.metrics.totalRequests / 100, 0);
    const totalRequests = Object.values(performanceReport).reduce((sum, cache) => sum + cache.metrics.totalRequests, 0);
    const overallHitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
    
    const response = {
      overall: {
        hitRate: Math.round(overallHitRate * 100) / 100,
        totalRequests,
        memoryUsage: Object.values(performanceReport).reduce((sum, cache) => sum + cache.metrics.memoryUsage, 0),
        averageResponseTime: Object.values(performanceReport).reduce((sum, cache) => sum + cache.metrics.averageResponseTime, 0) / Object.keys(performanceReport).length
      },
      caches: performanceReport,
      timestamp: new Date().toISOString(),
      status: 'healthy'
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('Cache performance API error:', error);
    
    return NextResponse.json({
      error: 'Failed to get cache performance metrics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// DELETE /api/cache/performance?action=invalidate - Invalidate cache for current user
async function handleCachePerformanceDelete(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient(cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'invalidate') {
      // Invalidate all cache entries for the current user
      const invalidatedCount = invalidateUserCache(user.id);
      
      return NextResponse.json({
        message: 'Cache invalidated successfully',
        invalidatedEntries: invalidatedCount,
        userId: user.id,
        timestamp: new Date().toISOString()
      }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });

  } catch (error: any) {
    console.error('Cache invalidation API error:', error);
    
    return NextResponse.json({
      error: 'Failed to invalidate cache',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Export the optimized handlers
export const GET = withAPIOptimization(handleCachePerformanceGet, {
  enableCompression: true,
  enableCaching: false, // Don't cache performance metrics
  enablePayloadOptimization: true,
  compressionThreshold: 512, // 0.5KB - Performance data is smaller
  cacheMaxAge: 0, // No caching for real-time performance data
});

export const DELETE = withAPIOptimization(handleCachePerformanceDelete, {
  enableCompression: false, // DELETE operations don't need compression
  enableCaching: false, // No caching for DELETE operations
  enablePayloadOptimization: true,
  compressionThreshold: 0,
  cacheMaxAge: 0,
});