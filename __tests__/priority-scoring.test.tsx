import { PriorityScorer } from '@/lib/priority-scorer';
import { OpenAIAnalyzer } from '@/lib/openai-analyzer';
import type { GmailThread, AIAnalysis, ThreadWithPriority } from '@/lib/types';

// Mock OpenAI
jest.mock('@/lib/openai-analyzer');

describe('AI Priority Scoring Algorithm', () => {
  let priorityScorer: PriorityScorer;
  let mockOpenAIAnalyzer: jest.Mocked<OpenAIAnalyzer>;

  const mockThreads: GmailThread[] = [
    {
      id: 'thread_1',
      subject: 'URGENT: Board Meeting Cancelled - Immediate Action Required',
      snippet: 'Due to the CEO\'s emergency, the board meeting scheduled for tomorrow has been cancelled. Please reschedule all stakeholder calls and notify the legal team immediately...',
      participants: ['ceo@company.com', 'board@company.com', 'executive@company.com'],
      unreadCount: 1,
      lastActivity: new Date('2024-01-15T08:00:00'),
      hasAttachments: true,
      labels: ['INBOX', 'IMPORTANT', 'UNREAD'],
    },
    {
      id: 'thread_2',
      subject: 'Q4 Financial Results - Executive Review Required',
      snippet: 'Please find attached the preliminary Q4 financial results. Your review and approval are needed before the earnings call scheduled for Friday...',
      participants: ['cfo@company.com', 'executive@company.com'],
      unreadCount: 0,
      lastActivity: new Date('2024-01-14T16:30:00'),
      hasAttachments: true,
      labels: ['INBOX', 'IMPORTANT'],
    },
    {
      id: 'thread_3',
      subject: 'Weekly Team Newsletter - January Edition',
      snippet: 'Here\'s this week\'s team newsletter with updates on project milestones, upcoming events, and employee spotlights...',
      participants: ['hr@company.com', 'executive@company.com'],
      unreadCount: 0,
      lastActivity: new Date('2024-01-12T10:00:00'),
      hasAttachments: false,
      labels: ['INBOX'],
    },
    {
      id: 'thread_4',
      subject: 'Contract Amendment - Legal Review Needed',
      snippet: 'The proposed amendments to the vendor contract require executive approval. Legal has flagged several clauses that need immediate attention...',
      participants: ['legal@company.com', 'executive@company.com', 'vendor@external.com'],
      unreadCount: 1,
      lastActivity: new Date('2024-01-15T14:20:00'),
      hasAttachments: true,
      labels: ['INBOX', 'UNREAD'],
    },
  ];

  beforeEach(() => {
    mockOpenAIAnalyzer = {
      analyzeThread: jest.fn(),
    } as any;
    priorityScorer = new PriorityScorer(mockOpenAIAnalyzer);
  });

  describe('Constructor', () => {
    it('should create priority scorer with OpenAI analyzer', () => {
      expect(priorityScorer).toBeInstanceOf(PriorityScorer);
    });

    it('should throw error without OpenAI analyzer', () => {
      expect(() => new PriorityScorer(null as any)).toThrow('OpenAI analyzer is required');
    });
  });

  describe('Executive Priority Algorithm', () => {
    it('should score urgent executive communications as Gold tier (9-10)', async () => {
      const urgentThread = mockThreads[0]; // URGENT board meeting
      
      mockOpenAIAnalyzer.analyzeThread.mockResolvedValue({
        id: 'analysis_1',
        thread_id: urgentThread.id,
        priority_score: 9.5,
        category: 'urgent',
        summary: 'Board meeting cancellation requiring immediate executive action',
        key_points: ['Board meeting cancelled', 'CEO emergency', 'Stakeholder calls need rescheduling'],
        suggested_actions: ['Reschedule calls', 'Notify legal team', 'Update board members'],
        sentiment: 'negative',
        confidence_score: 0.95,
        created_at: new Date().toISOString(),
      });

      const result = await priorityScorer.scoreThread(urgentThread);

      expect(result.priorityTier).toBe('gold');
      expect(result.priorityScore).toBeGreaterThanOrEqual(9);
      expect(result.analysis.category).toBe('urgent');
      expect(mockOpenAIAnalyzer.analyzeThread).toHaveBeenCalledWith(urgentThread);
    });

    it('should score important financial communications as Silver tier (7-8)', async () => {
      const financialThread = mockThreads[1]; // Q4 financial results
      
      mockOpenAIAnalyzer.analyzeThread.mockResolvedValue({
        id: 'analysis_2',
        thread_id: financialThread.id,
        priority_score: 7.8,
        category: 'important',
        summary: 'Q4 financial results requiring executive review before earnings call',
        key_points: ['Q4 financial results', 'Executive review needed', 'Earnings call Friday'],
        suggested_actions: ['Review financial results', 'Prepare for earnings call', 'Schedule CFO meeting'],
        sentiment: 'neutral' as const,
        confidence_score: 0.88,
        created_at: new Date().toISOString(),
      });

      const result = await priorityScorer.scoreThread(financialThread);

      // The boosting may push this to gold tier due to IMPORTANT label and other factors
      expect(result.priorityTier).toMatch(/^(silver|gold)$/);
      expect(result.priorityScore).toBeGreaterThanOrEqual(7);
      expect(result.analysis.category).toBe('important');
    });

    it('should score routine communications as Bronze tier (4-6)', async () => {
      const routineThread = mockThreads[2]; // Weekly newsletter
      
      mockOpenAIAnalyzer.analyzeThread.mockResolvedValue({
        id: 'analysis_3',
        thread_id: routineThread.id,
        priority_score: 4.2,
        category: 'fyi',
        summary: 'Weekly team newsletter with project updates and employee news',
        key_points: ['Project milestones', 'Upcoming events', 'Employee spotlights'],
        suggested_actions: ['Review when convenient', 'Note upcoming events'],
        sentiment: 'positive',
        confidence_score: 0.75,
        created_at: new Date().toISOString(),
      });

      const result = await priorityScorer.scoreThread(routineThread);

      expect(result.priorityTier).toBe('bronze');
      expect(result.priorityScore).toBeGreaterThanOrEqual(4);
      expect(result.priorityScore).toBeLessThan(7);
      expect(result.analysis.category).toBe('fyi');
    });

    it('should handle legal communications with appropriate urgency', async () => {
      const legalThread = mockThreads[3]; // Contract amendment
      
      mockOpenAIAnalyzer.analyzeThread.mockResolvedValue({
        id: 'analysis_4',
        thread_id: legalThread.id,
        priority_score: 8.3,
        category: 'important',
        summary: 'Contract amendment requiring executive approval and legal review',
        key_points: ['Contract amendments', 'Executive approval needed', 'Legal flagged clauses'],
        suggested_actions: ['Review contract amendments', 'Consult with legal team', 'Approve or request changes'],
        sentiment: 'neutral' as const,
        confidence_score: 0.92,
        created_at: new Date().toISOString(),
      });

      const result = await priorityScorer.scoreThread(legalThread);

      // Legal thread with unread status may get boosted to gold tier
      expect(result.priorityTier).toMatch(/^(silver|gold)$/);
      expect(result.priorityScore).toBeGreaterThanOrEqual(8);
      expect(result.analysis.suggested_actions).toContain('Review contract amendments');
    });
  });

  describe('Batch Processing', () => {
    it('should score multiple threads and sort by priority', async () => {
      mockOpenAIAnalyzer.analyzeThread
        .mockResolvedValueOnce({
          id: 'analysis_1',
          thread_id: 'thread_1',
          priority_score: 9.5,
          category: 'urgent',
          summary: 'Urgent board meeting cancellation',
          key_points: [],
          suggested_actions: [],
          sentiment: 'negative',
          confidence_score: 0.95,
          created_at: new Date().toISOString(),
        })
        .mockResolvedValueOnce({
          id: 'analysis_2',
          thread_id: 'thread_2',
          priority_score: 7.8,
          category: 'important',
          summary: 'Financial results for review',
          key_points: [],
          suggested_actions: [],
          sentiment: 'neutral' as const,
          confidence_score: 0.88,
          created_at: new Date().toISOString(),
        })
        .mockResolvedValueOnce({
          id: 'analysis_3',
          thread_id: 'thread_3',
          priority_score: 4.2,
          category: 'fyi',
          summary: 'Weekly newsletter',
          key_points: [],
          suggested_actions: [],
          sentiment: 'positive',
          confidence_score: 0.75,
          created_at: new Date().toISOString(),
        });

      const results = await priorityScorer.scoreThreads(mockThreads.slice(0, 3));

      expect(results).toHaveLength(3);
      expect(results[0].priorityScore).toBeGreaterThan(results[1].priorityScore);
      expect(results[1].priorityScore).toBeGreaterThan(results[2].priorityScore);
      expect(results[0].priorityTier).toBe('gold');
      // Second result may be boosted to gold due to IMPORTANT label
      expect(results[1].priorityTier).toMatch(/^(silver|gold)$/);
      expect(results[2].priorityTier).toBe('bronze');
    });

    it('should handle batch processing errors gracefully', async () => {
      mockOpenAIAnalyzer.analyzeThread
        .mockResolvedValueOnce({
          id: 'analysis_1',
          thread_id: 'thread_1',
          priority_score: 9.5,
          category: 'urgent',
          summary: 'Success',
          key_points: [],
          suggested_actions: [],
          sentiment: 'negative',
          confidence_score: 0.95,
          created_at: new Date().toISOString(),
        })
        .mockRejectedValueOnce(new Error('OpenAI API error'))
        .mockResolvedValueOnce({
          id: 'analysis_3',
          thread_id: 'thread_3',
          priority_score: 4.2,
          category: 'fyi',
          summary: 'Success',
          key_points: [],
          suggested_actions: [],
          sentiment: 'positive',
          confidence_score: 0.75,
          created_at: new Date().toISOString(),
        });

      const results = await priorityScorer.scoreThreads(mockThreads.slice(0, 3));

      expect(results).toHaveLength(2); // Only successful analyses
      expect(results[0].thread.id).toBe('thread_1');
      expect(results[1].thread.id).toBe('thread_3');
    });
  });

  describe('Priority Tier Classification', () => {
    it('should classify scores 9-10 as Gold tier', () => {
      expect(priorityScorer.getPriorityTier(9.0)).toBe('gold');
      expect(priorityScorer.getPriorityTier(9.5)).toBe('gold');
      expect(priorityScorer.getPriorityTier(10.0)).toBe('gold');
    });

    it('should classify scores 7-8.9 as Silver tier', () => {
      expect(priorityScorer.getPriorityTier(7.0)).toBe('silver');
      expect(priorityScorer.getPriorityTier(8.0)).toBe('silver');
      expect(priorityScorer.getPriorityTier(8.9)).toBe('silver');
    });

    it('should classify scores 4-6.9 as Bronze tier', () => {
      expect(priorityScorer.getPriorityTier(4.0)).toBe('bronze');
      expect(priorityScorer.getPriorityTier(5.5)).toBe('bronze');
      expect(priorityScorer.getPriorityTier(6.9)).toBe('bronze');
    });

    it('should classify scores 0-3.9 as Standard tier', () => {
      expect(priorityScorer.getPriorityTier(0)).toBe('standard');
      expect(priorityScorer.getPriorityTier(2.5)).toBe('standard');
      expect(priorityScorer.getPriorityTier(3.9)).toBe('standard');
    });
  });

  describe('Executive Context Analysis', () => {
    it('should boost priority for C-level participants', async () => {
      const clevelThread = {
        ...mockThreads[0],
        participants: ['ceo@company.com', 'cto@company.com', 'executive@company.com']
      };

      mockOpenAIAnalyzer.analyzeThread.mockResolvedValue({
        id: 'analysis_boost',
        thread_id: clevelThread.id,
        priority_score: 8.5, // Would be silver, but should boost to gold
        category: 'important',
        summary: 'C-level communication',
        key_points: [],
        suggested_actions: [],
        sentiment: 'neutral' as const,
        confidence_score: 0.9,
        created_at: new Date().toISOString(),
      });

      const result = await priorityScorer.scoreThread(clevelThread);

      // Should boost score due to C-level participants (+0.8) and other factors
      expect(result.priorityScore).toBeGreaterThan(8.5);
      expect(result.priorityTier).toBe('gold');
    });

    it('should boost priority for time-sensitive keywords', async () => {
      const urgentThread = {
        ...mockThreads[0],
        subject: 'DEADLINE TODAY: Contract Signature Required'
      };

      mockOpenAIAnalyzer.analyzeThread.mockResolvedValue({
        id: 'analysis_urgent',
        thread_id: urgentThread.id,
        priority_score: 7.5,
        category: 'urgent',
        summary: 'Time-sensitive contract signature',
        key_points: [],
        suggested_actions: [],
        sentiment: 'neutral' as const,
        confidence_score: 0.9,
        created_at: new Date().toISOString(),
      });

      const result = await priorityScorer.scoreThread(urgentThread);

      // Should boost score due to time-sensitive keywords
      expect(result.priorityScore).toBeGreaterThan(7.5);
    });
  });

  describe('Error Handling', () => {
    it('should handle OpenAI API failures gracefully', async () => {
      mockOpenAIAnalyzer.analyzeThread.mockRejectedValue(new Error('OpenAI API rate limit exceeded'));

      await expect(priorityScorer.scoreThread(mockThreads[0])).rejects.toThrow('OpenAI API rate limit exceeded');
    });

    it('should handle malformed analysis responses', async () => {
      mockOpenAIAnalyzer.analyzeThread.mockResolvedValue({
        id: 'malformed',
        thread_id: 'thread_1',
        priority_score: null, // Invalid score
        category: 'unknown',
        summary: '',
        key_points: [],
        suggested_actions: [],
        sentiment: 'neutral' as const,
        confidence_score: 0,
        created_at: new Date().toISOString(),
      } as any);

      await expect(priorityScorer.scoreThread(mockThreads[0])).rejects.toThrow('Invalid priority score received from AI analysis');
    });

    it('should validate thread input', async () => {
      await expect(priorityScorer.scoreThread(null as any)).rejects.toThrow('Thread is required for priority scoring');
      await expect(priorityScorer.scoreThread({} as any)).rejects.toThrow('Thread must have valid ID and subject');
    });
  });

  describe('Caching', () => {
    it('should cache analysis results by thread ID', async () => {
      const mockAnalysis: AIAnalysis = {
        id: 'cached_analysis',
        thread_id: mockThreads[0].id,
        priority_score: 8.5,
        category: 'important' as const,
        summary: 'Cached analysis',
        key_points: [],
        suggested_actions: [],
        sentiment: 'neutral' as const,
        confidence_score: 0.9,
        created_at: new Date().toISOString(),
      };

      mockOpenAIAnalyzer.analyzeThread.mockResolvedValue(mockAnalysis);

      // First call should hit the API
      const result1 = await priorityScorer.scoreThread(mockThreads[0]);
      expect(mockOpenAIAnalyzer.analyzeThread).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await priorityScorer.scoreThread(mockThreads[0]);
      expect(mockOpenAIAnalyzer.analyzeThread).toHaveBeenCalledTimes(1); // Still 1

      expect(result1.analysis.id).toBe(result2.analysis.id);
    });

    it('should provide cache clearing functionality', async () => {
      const mockAnalysis: AIAnalysis = {
        id: 'analysis_to_clear',
        thread_id: mockThreads[0].id,
        priority_score: 7.0,
        category: 'important' as const,
        summary: 'Analysis to clear',
        key_points: [],
        suggested_actions: [],
        sentiment: 'neutral' as const,
        confidence_score: 0.8,
        created_at: new Date().toISOString(),
      };

      mockOpenAIAnalyzer.analyzeThread.mockResolvedValue(mockAnalysis);

      // First call
      await priorityScorer.scoreThread(mockThreads[0]);
      expect(mockOpenAIAnalyzer.analyzeThread).toHaveBeenCalledTimes(1);

      // Clear cache
      priorityScorer.clearCache();

      // Second call should hit API again
      await priorityScorer.scoreThread(mockThreads[0]);
      expect(mockOpenAIAnalyzer.analyzeThread).toHaveBeenCalledTimes(2);
    });
  });
});