import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserTokens, isGmailConnected, isSlackConnected } from '@/lib/oauth-handlers';
import { messageCache, userTokenCache, priorityCache, cacheKeys } from '@/lib/cache-manager';
import { withAPIOptimization, batchOptimizer } from '@/middleware/api-optimization';
import type { Message } from '@/types';

export const runtime = 'nodejs';

// Enhanced error types for better error handling
interface ServiceError {
  service: 'gmail' | 'slack';
  error: string;
  code?: string;
  retryable: boolean;
  timestamp: number;
}

interface UnifiedApiError {
  error: string;
  code: string;
  services?: ServiceError[];
  canRetry: boolean;
  timestamp: number;
}

// Enhanced priority detection with executive focus
function getEnhancedPriority(
  message: Message,
  vipSenders: string[] = []
): 'urgent' | 'question' | 'normal' {
  const content = (message.content + ' ' + (message.subject || '')).toLowerCase();
  const sender = message.sender.toLowerCase();
  const senderEmail = message.senderEmail?.toLowerCase() || '';
  const channel = message.channel?.toLowerCase() || '';
  
  // URGENT INDICATORS
  const urgentKeywords = [
    'urgent', 'asap', 'emergency', 'critical', 'immediate',
    'breaking', 'alert', 'action required', 'time sensitive',
    'deadline', 'overdue', 'escalation', 'help needed',
    'issue', 'problem', 'down', 'failing', 'broken',
    'blocked', 'stop', 'priority', 'important'
  ];
  
  // VIP/Executive indicators
  const executiveTitles = [
    'ceo', 'cto', 'cfo', 'coo', 'president', 'vp', 'vice president',
    'director', 'executive', 'chief', 'board', 'investor',
    'founder', 'partner', 'managing', 'senior'
  ];
  
  const vipChannels = [
    'general', 'announcements', 'alerts', 'incidents',
    'leadership', 'executive', 'board', 'management',
    'urgent', 'priority', 'all-hands'
  ];
  
  // Check for VIP senders (custom list)
  if (vipSenders.some(vip => 
    sender.includes(vip.toLowerCase()) || 
    senderEmail.includes(vip.toLowerCase())
  )) {
    return 'urgent';
  }
  
  // Check for urgent keywords
  if (urgentKeywords.some(keyword => content.includes(keyword))) {
    return 'urgent';
  }
  
  // Check for executive titles in sender
  if (executiveTitles.some(title => 
    sender.includes(title) || 
    senderEmail.includes(title)
  )) {
    return 'urgent';
  }
  
  // Check for VIP channels (Slack)
  if (message.source === 'slack' && vipChannels.some(vip => channel.includes(vip))) {
    return 'urgent';
  }
  
  // QUESTION INDICATORS
  const questionIndicators = [
    '?',
    'can you', 'could you', 'would you', 'will you',
    'please advise', 'please confirm', 'please review',
    'need help', 'help with', 'question about',
    'how to', 'how do', 'what is', 'where is',
    'when can', 'why is', 'should i', 'should we',
    'thoughts on', 'opinion on', 'feedback on',
    'let me know', 'lmk', 'any update', 'status on'
  ];
  
  if (questionIndicators.some(indicator => content.includes(indicator))) {
    return 'question';
  }
  
  // Default to normal
  return 'normal';
}

// Sort messages by priority and timestamp
function sortMessagesByPriority(messages: Message[]): Message[] {
  const priorityOrder = { urgent: 3, question: 2, normal: 1 };
  
  return messages.sort((a, b) => {
    // First sort by priority
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    
    // Within same priority, sort by timestamp (newest first)
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

// Apply API optimization middleware
async function handleUnifiedMessages(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check cache first for unified messages
    const cacheKey = cacheKeys.unifiedMessages(user.id);
    const cachedData = messageCache.get<any>(cacheKey);
    
    if (cachedData) {
      console.log(`⚡ Cache HIT: Returning cached unified messages for user ${user.id}`);
      return NextResponse.json({
        ...cachedData,
        cached: true,
        cacheHit: true,
        fetchedAt: cachedData.fetchedAt
      }, { status: 200 });
    }

    console.log(`💾 Cache MISS: Fetching fresh unified messages for user ${user.id}`);

    // Get user's connection status (with caching)
    const tokenCacheKey = cacheKeys.userTokens(user.id);
    let tokens = userTokenCache.get<any>(tokenCacheKey);
    
    if (!tokens) {
      tokens = await getUserTokens(user.id);
      if (tokens) {
        userTokenCache.set(tokenCacheKey, tokens, 3600); // Cache for 1 hour
      }
    }
    
    const hasGmail = tokens ? isGmailConnected(tokens) : false;
    const hasSlack = tokens ? isSlackConnected(tokens) : false;

    if (!hasGmail && !hasSlack) {
      return NextResponse.json({ 
        error: 'No accounts connected',
        code: 'NO_CONNECTIONS',
        connections: { gmail: false, slack: false }
      }, { status: 400 });
    }

    const allMessages: Message[] = [];
    const errors: Array<{ service: string; error: string; retryable?: boolean; code?: string }> = [];
    let gmailFetchTime = 0;
    let slackFetchTime = 0;

    // Fetch Gmail messages if connected with enhanced error handling and caching
    if (hasGmail) {
      const gmailStart = Date.now();
      const gmailCacheKey = cacheKeys.gmailMessages(user.id);
      
      try {
        // Check Gmail cache first
        const cachedGmailData = messageCache.get<any>(gmailCacheKey);
        
        if (cachedGmailData) {
          console.log(`⚡ Gmail cache HIT for user ${user.id}`);
          allMessages.push(...(cachedGmailData.messages || []));
          gmailFetchTime = 10; // Minimal time for cache hit
        } else {
          console.log(`💾 Gmail cache MISS for user ${user.id}, fetching...`);
          
          // Add timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
          
          const gmailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/messages/gmail`, {
            headers: {
              'Cookie': request.headers.get('cookie') || '',
              'Authorization': request.headers.get('authorization') || ''
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (gmailResponse.ok) {
            const gmailData = await gmailResponse.json();
            allMessages.push(...(gmailData.messages || []));
            
            // Cache Gmail response for 5 minutes
            messageCache.set(gmailCacheKey, gmailData, 300);
            console.log(`💾 Gmail data cached for user ${user.id}`);
          } else {
            const errorData = await gmailResponse.json().catch(() => ({ error: 'Unknown error' }));
            const isRetryable = gmailResponse.status >= 500 || gmailResponse.status === 429;
            
            errors.push({ 
              service: 'gmail', 
              error: errorData.error || `HTTP ${gmailResponse.status}: ${gmailResponse.statusText}`,
              code: errorData.code || `HTTP_${gmailResponse.status}`,
              retryable: isRetryable,
              timestamp: Date.now()
            });
          }
        }
      } catch (error: any) {
        console.error('Gmail fetch error:', error);
        const isTimeoutError = error.name === 'AbortError';
        const isNetworkError = !error.status;
        
        errors.push({ 
          service: 'gmail', 
          error: isTimeoutError 
            ? 'Gmail request timed out after 15 seconds'
            : isNetworkError 
              ? 'Network error connecting to Gmail'
              : 'Gmail service temporarily unavailable',
          code: isTimeoutError ? 'TIMEOUT' : isNetworkError ? 'NETWORK_ERROR' : 'SERVICE_ERROR',
          retryable: true,
          timestamp: Date.now()
        });
      }
      gmailFetchTime = Date.now() - gmailStart;
    }

    // Fetch Slack messages if connected with enhanced error handling and caching
    if (hasSlack) {
      const slackStart = Date.now();
      const slackCacheKey = cacheKeys.slackMessages(user.id);
      
      try {
        // Check Slack cache first
        const cachedSlackData = messageCache.get<any>(slackCacheKey);
        
        if (cachedSlackData) {
          console.log(`⚡ Slack cache HIT for user ${user.id}`);
          allMessages.push(...(cachedSlackData.messages || []));
          slackFetchTime = 10; // Minimal time for cache hit
        } else {
          console.log(`💾 Slack cache MISS for user ${user.id}, fetching...`);
          
          // Add timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
          
          const slackResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/messages/slack`, {
            headers: {
              'Cookie': request.headers.get('cookie') || '',
              'Authorization': request.headers.get('authorization') || ''
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (slackResponse.ok) {
            const slackData = await slackResponse.json();
            allMessages.push(...(slackData.messages || []));
            
            // Cache Slack response for 5 minutes
            messageCache.set(slackCacheKey, slackData, 300);
            console.log(`💾 Slack data cached for user ${user.id}`);
          } else {
            const errorData = await slackResponse.json().catch(() => ({ error: 'Unknown error' }));
            const isRetryable = slackResponse.status >= 500 || slackResponse.status === 429;
            
            errors.push({ 
              service: 'slack', 
              error: errorData.error || `HTTP ${slackResponse.status}: ${slackResponse.statusText}`,
              code: errorData.code || `HTTP_${slackResponse.status}`,
              retryable: isRetryable,
              timestamp: Date.now()
            });
          }
        }
      } catch (error: any) {
        console.error('Slack fetch error:', error);
        const isTimeoutError = error.name === 'AbortError';
        const isNetworkError = !error.status;
        
        errors.push({ 
          service: 'slack', 
          error: isTimeoutError 
            ? 'Slack request timed out after 15 seconds'
            : isNetworkError 
              ? 'Network error connecting to Slack'
              : 'Slack service temporarily unavailable',
          code: isTimeoutError ? 'TIMEOUT' : isNetworkError ? 'NETWORK_ERROR' : 'SERVICE_ERROR',
          retryable: true,
          timestamp: Date.now()
        });
      }
      slackFetchTime = Date.now() - slackStart;
    }

    // Apply enhanced priority detection (with caching for expensive calculations)
    const vipSenders = process.env.VIP_SENDERS?.split(',') || [];
    const messagesWithPriority = allMessages.map(message => {
      // Cache priority calculations for performance
      const priorityCacheKey = cacheKeys.messagePriority(message.id);
      let cachedPriority = priorityCache.get<'urgent' | 'question' | 'normal'>(priorityCacheKey);
      
      if (!cachedPriority) {
        cachedPriority = getEnhancedPriority(message, vipSenders);
        priorityCache.set(priorityCacheKey, cachedPriority, 600); // Cache for 10 minutes
      }
      
      return {
        ...message,
        priority: cachedPriority
      };
    });

    // Sort messages by priority
    const sortedMessages = sortMessagesByPriority(messagesWithPriority);

    // Calculate priority statistics
    const priorityStats = {
      urgent: sortedMessages.filter(m => m.priority === 'urgent').length,
      question: sortedMessages.filter(m => m.priority === 'question').length,
      normal: sortedMessages.filter(m => m.priority === 'normal').length,
      total: sortedMessages.length
    };

    // Calculate source statistics
    const sourceStats = {
      gmail: sortedMessages.filter(m => m.source === 'gmail').length,
      slack: sortedMessages.filter(m => m.source === 'slack').length
    };

    // Enhanced response with comprehensive error information and caching metrics
    const response = {
      messages: sortedMessages,
      stats: {
        priority: priorityStats,
        sources: sourceStats,
        performance: {
          gmailFetchTime,
          slackFetchTime,
          totalFetchTime: gmailFetchTime + slackFetchTime
        }
      },
      connections: {
        gmail: hasGmail,
        slack: hasSlack
      },
      errors: errors.length > 0 ? errors : undefined,
      fetchedAt: new Date().toISOString(),
      status: {
        success: errors.length === 0,
        partialSuccess: sortedMessages.length > 0 && errors.length > 0,
        canRetry: errors.some((e: any) => e.retryable),
        healthScore: Math.round(((hasGmail && hasSlack ? 2 : 1) - errors.length) / (hasGmail && hasSlack ? 2 : 1) * 100)
      }
    };

    // Cache the unified response for 5 minutes (if successful)
    if (errors.length === 0) {
      messageCache.set(cacheKey, response, 300);
      console.log(`💾 Unified response cached for user ${user.id}`);
    }
    
    // Return appropriate status code based on success level
    const statusCode = errors.length === 0 
      ? 200 
      : sortedMessages.length > 0 
        ? 206 // Partial content
        : 503; // Service unavailable
    
    return NextResponse.json(response, { status: statusCode });

  } catch (error: any) {
    console.error('Unified API critical error:', error);
    
    // Enhanced error response with debugging information
    const errorResponse: UnifiedApiError = {
      error: error.message || 'Failed to fetch unified messages',
      code: 'UNIFIED_FETCH_ERROR',
      canRetry: true,
      timestamp: Date.now()
    };
    
    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
      (errorResponse as any).stack = error.stack;
      (errorResponse as any).details = {
        name: error.name,
        cause: error.cause
      };
    }
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Export the optimized handler
export const GET = withAPIOptimization(handleUnifiedMessages, {
  enableCompression: true,
  enableCaching: true,
  enablePayloadOptimization: true,
  compressionThreshold: 1024, // 1KB
  cacheMaxAge: 300, // 5 minutes - matches existing cache
});