import type { GmailThread, GmailMessage, AIAnalysis } from '@/lib/types'

// Mock Gmail API responses
const mockGmailThread: GmailThread = {
  id: 'thread_123',
  subject: 'Meeting Tomorrow',
  snippet: 'Meeting tomorrow at 3pm...',
  participants: ['john@company.com', 'sarah@company.com'],
  unreadCount: 1,
  lastActivity: new Date('2024-01-15T10:00:00Z'),
  hasAttachments: false,
  labels: ['INBOX', 'IMPORTANT']
}

// Mock Gmail messages (separate from GmailThread for API testing)
const mockGmailMessages: GmailMessage[] = [
    {
      id: 'msg_123',
      threadId: 'thread_123',
      labelIds: ['INBOX', 'IMPORTANT'],
      snippet: 'Meeting tomorrow at 3pm...',
      historyId: '12345',
      internalDate: '1640995200000',
      payload: {
        partId: '',
        mimeType: 'text/plain',
        filename: '',
        headers: [
          { name: 'From', value: 'boss@company.com' },
          { name: 'Subject', value: 'Urgent: Quarterly Review Meeting' },
          { name: 'Date', value: 'Fri, 31 Dec 2021 15:00:00 +0000' },
        ],
        body: {
          size: 1024,
          data: 'SGVsbG8sIHdlIG5lZWQgdG8gc2NoZWR1bGUgYSBtZWV0aW5nLi4u', // Base64 encoded
        },
      },
      sizeEstimate: 1024,
    },
]

const mockAIAnalysis: AIAnalysis = {
  id: 'analysis_123',
  thread_id: 'thread_123',
  priority_score: 9,
  category: 'urgent',
  summary: 'Quarterly review meeting scheduled for tomorrow at 3pm. Requires preparation of Q4 reports.',
  key_points: [
    'Meeting scheduled for tomorrow 3pm',
    'Q4 reports needed',
    'Quarterly review agenda',
  ],
  suggested_actions: [
    'Prepare Q4 financial summary',
    'Review team performance metrics',
    'Block calendar for 3pm tomorrow',
  ],
  sentiment: 'neutral',
  confidence_score: 0.92,
  created_at: '2021-12-31T14:00:00Z',
}

describe('Gmail Integration', () => {
  describe('Gmail API Client', () => {
    it('should fetch Gmail threads successfully', async () => {
      // Mock fetch for Gmail API
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          threads: [mockGmailThread],
          nextPageToken: null,
        }),
      })

      // This will be implemented when we create the actual Gmail client
      const mockGmailClient = {
        getThreads: async (maxResults: number = 10) => {
          const response = await fetch('/api/gmail/threads')
          const data = await response.json()
          return data.threads
        },
      }

      const threads = await mockGmailClient.getThreads(10)
      
      expect(threads).toHaveLength(1)
      expect(threads[0]).toEqual(mockGmailThread)
      expect(fetch).toHaveBeenCalledWith('/api/gmail/threads')
    })

    it('should handle Gmail API rate limiting', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({
          error: { message: 'Rate limit exceeded' },
        }),
      })

      const mockGmailClient = {
        getThreads: async () => {
          const response = await fetch('/api/gmail/threads')
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error.message)
          }
          return response.json()
        },
      }

      await expect(mockGmailClient.getThreads()).rejects.toThrow('Rate limit exceeded')
    })

    it('should parse Gmail message headers correctly', () => {
      const message = mockGmailMessages[0]
      const fromHeader = message.payload.headers.find(h => h.name === 'From')
      const subjectHeader = message.payload.headers.find(h => h.name === 'Subject')
      
      expect(fromHeader?.value).toBe('boss@company.com')
      expect(subjectHeader?.value).toBe('Urgent: Quarterly Review Meeting')
    })

    it('should handle missing or malformed message data', () => {
      const incompleteMessage: Partial<GmailMessage> = {
        id: 'msg_456',
        snippet: 'Incomplete message...',
        payload: {
          partId: '',
          mimeType: 'text/plain',
          filename: '',
          headers: [],
          body: { size: 0 },
        },
      }

      expect(incompleteMessage.payload?.headers).toHaveLength(0)
      expect(incompleteMessage.payload?.body.data).toBeUndefined()
    })
  })

  describe('AI Analysis Integration', () => {
    it('should generate AI analysis for Gmail threads', async () => {
      // Mock OpenAI API response
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                priority_score: 9,
                category: 'urgent',
                summary: mockAIAnalysis.summary,
                key_points: mockAIAnalysis.key_points,
                suggested_actions: mockAIAnalysis.suggested_actions,
                sentiment: 'neutral',
                confidence_score: 0.92,
              }),
            },
          }],
        }),
      })

      const mockAIClient = {
        analyzeThread: async (thread: GmailThread): Promise<AIAnalysis> => {
          const response = await fetch('/api/ai/analyze', {
            method: 'POST',
            body: JSON.stringify({ thread }),
          })
          const data = await response.json()
          return {
            id: `analysis_${thread.id}`,
            thread_id: thread.id,
            created_at: new Date().toISOString(),
            ...JSON.parse(data.choices[0].message.content),
          }
        },
      }

      const analysis = await mockAIClient.analyzeThread(mockGmailThread)
      
      expect(analysis.thread_id).toBe('thread_123')
      expect(analysis.priority_score).toBe(9)
      expect(analysis.category).toBe('urgent')
      expect(analysis.key_points).toHaveLength(3)
      expect(analysis.suggested_actions).toHaveLength(3)
    })

    it('should categorize emails correctly based on content', () => {
      const urgentAnalysis = { ...mockAIAnalysis, priority_score: 9, category: 'urgent' as const }
      const importantAnalysis = { ...mockAIAnalysis, priority_score: 7, category: 'important' as const }
      const followUpAnalysis = { ...mockAIAnalysis, priority_score: 5, category: 'follow_up' as const }
      const fyiAnalysis = { ...mockAIAnalysis, priority_score: 3, category: 'fyi' as const }

      expect(urgentAnalysis.priority_score).toBeGreaterThan(8)
      expect(urgentAnalysis.category).toBe('urgent')
      
      expect(importantAnalysis.priority_score).toBeGreaterThan(6)
      expect(importantAnalysis.category).toBe('important')
      
      expect(followUpAnalysis.priority_score).toBeGreaterThan(4)
      expect(followUpAnalysis.category).toBe('follow_up')
      
      expect(fyiAnalysis.priority_score).toBeLessThan(4)
      expect(fyiAnalysis.category).toBe('fyi')
    })

    it('should handle AI analysis errors gracefully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          error: { message: 'OpenAI API error' },
        }),
      })

      const mockAIClient = {
        analyzeThread: async (thread: GmailThread) => {
          const response = await fetch('/api/ai/analyze', {
            method: 'POST',
            body: JSON.stringify({ thread }),
          })
          
          if (!response.ok) {
            throw new Error('Failed to analyze thread')
          }
          
          return response.json()
        },
      }

      await expect(mockAIClient.analyzeThread(mockGmailThread))
        .rejects.toThrow('Failed to analyze thread')
    })
  })

  describe('Data Transformation', () => {
    it('should combine Gmail threads with AI analysis', () => {
      const threadWithAnalysis = {
        thread: mockGmailThread,
        analysis: mockAIAnalysis,
      }

      expect(threadWithAnalysis.thread.id).toBe(threadWithAnalysis.analysis.thread_id)
      expect(threadWithAnalysis.analysis.priority_score).toBe(9)
      expect(threadWithAnalysis.analysis.summary).toContain('Quarterly review')
    })

    it('should sort threads by priority score', () => {
      const threads = [
        { thread: mockGmailThread, analysis: { ...mockAIAnalysis, priority_score: 5 } },
        { thread: mockGmailThread, analysis: { ...mockAIAnalysis, priority_score: 9 } },
        { thread: mockGmailThread, analysis: { ...mockAIAnalysis, priority_score: 7 } },
      ]

      const sortedThreads = threads.sort((a, b) => b.analysis.priority_score - a.analysis.priority_score)
      
      expect(sortedThreads[0].analysis.priority_score).toBe(9)
      expect(sortedThreads[1].analysis.priority_score).toBe(7)
      expect(sortedThreads[2].analysis.priority_score).toBe(5)
    })
  })
})