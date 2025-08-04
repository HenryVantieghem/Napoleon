import type { GmailThread, ThreadWithPriority, AIAnalysis, PriorityTier } from '@/lib/types';
import type { OpenAIAnalyzer } from './openai-analyzer';

interface CacheEntry {
  analysis: AIAnalysis;
  timestamp: number;
}

export class PriorityScorer {
  private openaiAnalyzer: OpenAIAnalyzer;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Executive priority keywords for boost scoring
  private readonly URGENT_KEYWORDS = [
    'urgent', 'asap', 'immediately', 'deadline', 'today', 'now', 'emergency',
    'critical', 'time-sensitive', 'expires', 'due today'
  ];

  private readonly C_LEVEL_DOMAINS = [
    'ceo', 'cto', 'cfo', 'coo', 'cmo', 'chief', 'president', 'vp',
    'board', 'director', 'executive'
  ];

  private readonly HIGH_PRIORITY_LABELS = [
    'IMPORTANT', 'URGENT', 'PRIORITY', 'FLAGGED'
  ];

  constructor(openaiAnalyzer: OpenAIAnalyzer) {
    if (!openaiAnalyzer) {
      throw new Error('OpenAI analyzer is required');
    }
    this.openaiAnalyzer = openaiAnalyzer;
  }

  async scoreThread(thread: GmailThread): Promise<ThreadWithPriority> {
    if (!thread) {
      throw new Error('Thread is required for priority scoring');
    }

    if (!thread.id || !thread.subject) {
      throw new Error('Thread must have valid ID and subject');
    }

    // Check cache first
    const cached = this.getCachedAnalysis(thread.id);
    let analysis: AIAnalysis;

    if (cached) {
      analysis = cached;
    } else {
      // Get AI analysis
      analysis = await this.openaiAnalyzer.analyzeThread(thread);
      
      // Validate the analysis has a valid priority score
      if (typeof analysis.priority_score !== 'number' || analysis.priority_score < 0 || analysis.priority_score > 10) {
        throw new Error('Invalid priority score received from AI analysis');
      }
      
      // Cache the analysis
      this.setCachedAnalysis(thread.id, analysis);
    }

    // Apply executive context boosting
    const { boostedScore, boostReason } = this.applyExecutiveBoosts(thread, analysis.priority_score);
    const finalScore = Math.min(10, Math.max(0, boostedScore)); // Clamp to 0-10
    
    // Determine priority tier
    const priorityTier = this.getPriorityTier(finalScore);

    return {
      thread,
      analysis,
      priorityScore: Math.round(finalScore * 10) / 10, // Round to 1 decimal
      priorityTier,
      boostedScore: boostedScore !== analysis.priority_score ? boostedScore : undefined,
      boostReason: boostReason || undefined,
    };
  }

  async scoreThreads(threads: GmailThread[]): Promise<ThreadWithPriority[]> {
    if (!Array.isArray(threads)) {
      throw new Error('Threads must be an array');
    }

    const results: ThreadWithPriority[] = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < threads.length; i += batchSize) {
      const batch = threads.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (thread) => {
        try {
          return await this.scoreThread(thread);
        } catch (error) {
          console.error(`Failed to score thread ${thread.id}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null) as ThreadWithPriority[]);

      // Small delay between batches to respect rate limits
      if (i + batchSize < threads.length) {
        await this.sleep(200);
      }
    }

    // Sort by priority score (highest first)
    return results.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  getPriorityTier(score: number): PriorityTier {
    if (score >= 9.0) return 'gold';
    if (score >= 7.0) return 'silver';
    if (score >= 4.0) return 'bronze';
    return 'standard';
  }

  private applyExecutiveBoosts(thread: GmailThread, baseScore: number): { boostedScore: number; boostReason?: string } {
    let boostedScore = baseScore;
    const boostReasons: string[] = [];

    // C-level participant boost (+0.8)
    const hasClevelParticipants = thread.participants.some(participant => {
      const email = participant.toLowerCase();
      return this.C_LEVEL_DOMAINS.some(domain => email.includes(domain));
    });

    if (hasClevelParticipants) {
      boostedScore += 0.8;
      boostReasons.push('C-level participants');
    }

    // Time-sensitive keyword boost (+0.5)
    const hasUrgentKeywords = this.URGENT_KEYWORDS.some(keyword => 
      thread.subject.toLowerCase().includes(keyword) || 
      thread.snippet.toLowerCase().includes(keyword)
    );

    if (hasUrgentKeywords) {
      boostedScore += 0.5;
      boostReasons.push('time-sensitive keywords');
    }

    // High priority label boost (+0.4)
    const hasHighPriorityLabels = thread.labels.some(label => 
      this.HIGH_PRIORITY_LABELS.includes(label)
    );

    if (hasHighPriorityLabels) {
      boostedScore += 0.4;
      boostReasons.push('high priority labels');
    }

    // Unread boost (+0.2)
    if (thread.unreadCount > 0) {
      boostedScore += 0.2;
      boostReasons.push('unread messages');
    }

    // Recent activity boost (+0.1 if within last 4 hours)
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    if (new Date(thread.lastActivity) > fourHoursAgo) {
      boostedScore += 0.1;
      boostReasons.push('recent activity');
    }

    // Attachment boost for important communications (+0.1)
    if (thread.hasAttachments && baseScore >= 6.0) {
      boostedScore += 0.1;
      boostReasons.push('important attachments');
    }

    return {
      boostedScore,
      boostReason: boostReasons.length > 0 ? boostReasons.join(', ') : undefined
    };
  }

  private getCachedAnalysis(threadId: string): AIAnalysis | null {
    const cached = this.cache.get(threadId);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(threadId);
      return null;
    }

    return cached.analysis;
  }

  private setCachedAnalysis(threadId: string, analysis: AIAnalysis): void {
    this.cache.set(threadId, {
      analysis,
      timestamp: Date.now(),
    });
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Utility method for getting priority tier styling information
  getPriorityTierInfo(tier: PriorityTier) {
    switch (tier) {
      case 'gold':
        return {
          color: '#D4AF37', // Napoleon gold
          bgColor: 'rgba(212, 175, 55, 0.1)',
          borderColor: '#D4AF37',
          textColor: '#D4AF37',
          name: 'Gold Priority',
          description: 'Requires immediate executive attention',
          icon: '👑'
        };
      case 'silver':
        return {
          color: '#C7CAD1', // Napoleon silver
          bgColor: 'rgba(199, 202, 209, 0.1)',
          borderColor: '#C7CAD1',
          textColor: '#C7CAD1',
          name: 'Silver Priority',
          description: 'Important business matter',
          icon: '⭐'
        };
      case 'bronze':
        return {
          color: '#CD7F32',
          bgColor: 'rgba(205, 127, 50, 0.1)',
          borderColor: '#CD7F32',
          textColor: '#CD7F32',
          name: 'Bronze Priority',
          description: 'Routine business communication',
          icon: '📋'
        };
      case 'standard':
        return {
          color: '#6B7280',
          bgColor: 'rgba(107, 114, 128, 0.05)',
          borderColor: '#6B7280',
          textColor: '#6B7280',
          name: 'Standard Priority',
          description: 'Informational content',
          icon: '📄'
        };
    }
  }
}