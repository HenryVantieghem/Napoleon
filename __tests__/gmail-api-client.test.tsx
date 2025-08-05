import GmailClient from '@/lib/gmail-client';
import type { 
  GmailThread, 
  GmailApiThread, 
  GmailApiMessage, 
  GmailApiListResponse,
  GmailClientError 
} from '@/lib/types';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock console to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Gmail API Client', () => {
  const mockAccessToken = 'mock-access-token';
  let gmailClient: GmailClient;

  // Mock data used across tests
  const mockGmailApiThread: GmailApiThread = {
    id: 'thread_123',
    historyId: '12345',
    snippet: 'Meeting tomorrow at 3pm...',
    messages: [{
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
          { name: 'To', value: 'user@example.com' },
          { name: 'Subject', value: 'Urgent: Quarterly Review Meeting' },
          { name: 'Date', value: 'Fri, 31 Dec 2021 15:00:00 +0000' },
        ],
        body: { size: 1024 },
      },
      sizeEstimate: 1024,
    }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    gmailClient = new GmailClient(mockAccessToken);
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('Constructor', () => {
    it('should create client with access token', () => {
      expect(gmailClient).toBeInstanceOf(GmailClient);
    });

    it('should throw error for invalid access token', () => {
      expect(() => new GmailClient('')).toThrow('Access token is required');
      expect(() => new GmailClient(null as any)).toThrow('Access token is required');
    });
  });

  describe('fetchLatestThreads', () => {
    const expectedThread: GmailThread = {
      id: 'thread_123',
      subject: 'Urgent: Quarterly Review Meeting',
      snippet: 'Meeting tomorrow at 3pm...',
      participants: ['boss@company.com', 'user@example.com'],
      unreadCount: 0, // IMPORTANT label doesn't mean unread, need UNREAD label
      lastActivity: new Date(1640995200000), // Direct timestamp conversion
      hasAttachments: false,
      labels: ['INBOX', 'IMPORTANT'],
    };

    it('should fetch and transform threads successfully', async () => {
      // Mock the list threads response
      const mockListResponse: GmailApiListResponse<{ id: string }> = {
        threads: [{ id: 'thread_123' }],
        resultSizeEstimate: 1,
      };

      // Mock the detailed thread response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockListResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGmailApiThread,
        });

      const threads = await gmailClient.fetchLatestThreads(10);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(1,
        'https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=10',
        {
          headers: {
            'Authorization': 'Bearer mock-access-token',
            'Content-Type': 'application/json',
          },
        }
      );
      expect(mockFetch).toHaveBeenNthCalledWith(2,
        'https://gmail.googleapis.com/gmail/v1/users/me/threads/thread_123',
        {
          headers: {
            'Authorization': 'Bearer mock-access-token',
            'Content-Type': 'application/json',
          },
        }
      );

      expect(threads).toHaveLength(1);
      expect(threads[0]).toEqual(expectedThread);
    });

    it('should handle default count parameter', async () => {
      const mockResponse: GmailApiListResponse<{ id: string }> = {
        threads: [],
        resultSizeEstimate: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await gmailClient.fetchLatestThreads();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=10',
        expect.any(Object)
      );
    });

    it('should handle custom count parameter', async () => {
      const mockResponse: GmailApiListResponse<GmailApiThread> = {
        threads: [],
        resultSizeEstimate: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await gmailClient.fetchLatestThreads(25);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=25',
        expect.any(Object)
      );
    });

    it('should sort threads by last activity descending', async () => {
      const thread1 = {
        ...mockGmailApiThread,
        id: 'thread_1',
        messages: [{
          ...mockGmailApiThread.messages![0],
          id: 'msg_1',
          threadId: 'thread_1',
          internalDate: '1640995200000', // Dec 31, 2021
        }],
      };

      const thread2 = {
        ...mockGmailApiThread,
        id: 'thread_2',
        messages: [{
          ...mockGmailApiThread.messages![0],
          id: 'msg_2',
          threadId: 'thread_2',
          internalDate: '1641081600000', // Jan 1, 2022
        }],
      };

      // Mock list response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            threads: [{ id: 'thread_1' }, { id: 'thread_2' }],
            resultSizeEstimate: 2 
          }),
        })
        // Mock detailed thread responses
        .mockResolvedValueOnce({
          ok: true,
          json: async () => thread1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => thread2,
        });

      const threads = await gmailClient.fetchLatestThreads(10);

      expect(threads).toHaveLength(2);
      expect(threads[0].id).toBe('thread_2'); // More recent first
      expect(threads[1].id).toBe('thread_1');
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 Unauthorized errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: { code: 401, message: 'Invalid Credentials' }
        }),
      });

      await expect(gmailClient.fetchLatestThreads(10))
        .rejects.toThrow('Gmail API Error (401): Invalid Credentials');
    });

    it('should handle 403 Forbidden errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: { code: 403, message: 'Insufficient Permission' }
        }),
      });

      await expect(gmailClient.fetchLatestThreads(10))
        .rejects.toThrow('Gmail API Error (403): Insufficient Permission');
    });

    it('should handle 429 Rate Limit errors with retry', async () => {
      // First call fails with rate limit
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: async () => ({
            error: { code: 429, message: 'Rate Limit Exceeded' }
          }),
        })
        // Second call succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ threads: [], resultSizeEstimate: 0 }),
        });

      const threads = await gmailClient.fetchLatestThreads(10);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(threads).toEqual([]);
    });

    it('should handle 500 Server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: { code: 500, message: 'Internal Server Error' }
        }),
      });

      await expect(gmailClient.fetchLatestThreads(10))
        .rejects.toThrow('Gmail API Error (500): Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(gmailClient.fetchLatestThreads(10))
        .rejects.toThrow('Network error occurred while fetching Gmail threads');
    });

    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); },
      });

      await expect(gmailClient.fetchLatestThreads(10))
        .rejects.toThrow('Failed to parse Gmail API response');
    });

    it('should handle empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const threads = await gmailClient.fetchLatestThreads(10);
      expect(threads).toEqual([]);
    });
  });

  describe('Data Transformation', () => {
    it('should extract subject from headers correctly', async () => {
      const threadWithSubject = {
        ...mockGmailApiThread,
        messages: [{
          ...mockGmailApiThread.messages![0],
          payload: {
            ...mockGmailApiThread.messages![0].payload,
            headers: [
              { name: 'Subject', value: 'Test Subject Line' },
              { name: 'From', value: 'test@example.com' },
            ],
          },
        }],
      };

      // Mock list response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ threads: [{ id: 'thread_123' }] }),
        })
        // Mock detailed thread response
        .mockResolvedValueOnce({
          ok: true,
          json: async () => threadWithSubject,
        });

      const threads = await gmailClient.fetchLatestThreads(10);
      expect(threads[0].subject).toBe('Test Subject Line');
    });

    it('should extract unique participants correctly', async () => {
      const threadWithMultipleParticipants = {
        ...mockGmailApiThread,
        messages: [{
          ...mockGmailApiThread.messages![0],
          payload: {
            ...mockGmailApiThread.messages![0].payload,
            headers: [
              { name: 'From', value: 'alice@example.com' },
              { name: 'To', value: 'bob@example.com, charlie@example.com' },
              { name: 'Cc', value: 'alice@example.com' }, // Duplicate
            ],
          },
        }],
      };

      // Mock list response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ threads: [{ id: 'thread_123' }] }),
        })
        // Mock detailed thread response
        .mockResolvedValueOnce({
          ok: true,
          json: async () => threadWithMultipleParticipants,
        });

      const threads = await gmailClient.fetchLatestThreads(10);
      expect(threads[0].participants).toEqual([
        'alice@example.com',
        'bob@example.com', 
        'charlie@example.com'
      ]);
    });

    it('should detect attachments correctly', async () => {
      const threadWithAttachment = {
        ...mockGmailApiThread,
        messages: [{
          ...mockGmailApiThread.messages![0],
          payload: {
            ...mockGmailApiThread.messages![0].payload,
            parts: [{
              partId: '1',
              mimeType: 'application/pdf',
              filename: 'document.pdf',
              headers: [],
              body: { size: 5000 },
            }],
          },
        }],
      };

      // Mock list response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ threads: [{ id: 'thread_123' }] }),
        })
        // Mock detailed thread response
        .mockResolvedValueOnce({
          ok: true,
          json: async () => threadWithAttachment,
        });

      const threads = await gmailClient.fetchLatestThreads(10);
      expect(threads[0].hasAttachments).toBe(true);
    });

    it('should calculate unread count correctly', async () => {
      const threadWithUnread = {
        ...mockGmailApiThread,
        messages: [{
          ...mockGmailApiThread.messages![0],
          labelIds: ['INBOX', 'UNREAD'],
        }],
      };

      // Mock list response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ threads: [{ id: 'thread_123' }] }),
        })
        // Mock detailed thread response
        .mockResolvedValueOnce({
          ok: true,
          json: async () => threadWithUnread,
        });

      const threads = await gmailClient.fetchLatestThreads(10);
      expect(threads[0].unreadCount).toBe(1);
    });
  });

  describe('Caching', () => {
    beforeEach(() => {
      // Clear cache before each test
      gmailClient.clearCache();
    });

    it('should cache successful responses for 5 minutes', async () => {
      const mockListResponse = {
        threads: [{ id: 'thread_123' }],
        resultSizeEstimate: 1,
      };

      // Mock both API calls for first request
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockListResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGmailApiThread,
        });

      // First call
      const threads1 = await gmailClient.fetchLatestThreads(10);
      
      // Second call should use cache (no additional API calls)
      const threads2 = await gmailClient.fetchLatestThreads(10);

      expect(mockFetch).toHaveBeenCalledTimes(2); // Only the initial list + details calls
      expect(threads1).toEqual(threads2);
    });

    it('should bypass cache after 5 minutes', async () => {
      const mockListResponse = {
        threads: [{ id: 'thread_123' }],
        resultSizeEstimate: 1,
      };

      // Mock alternating responses for list and detail calls
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockListResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGmailApiThread,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockListResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGmailApiThread,
        });

      // First call (makes 2 API calls: list + details)
      await gmailClient.fetchLatestThreads(10);

      // Mock time passage (5+ minutes)
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 6 * 60 * 1000);

      // Second call should make new requests (another 2 API calls)
      await gmailClient.fetchLatestThreads(10);

      expect(mockFetch).toHaveBeenCalledTimes(4); // 2 calls for first request + 2 calls for second request

      // Restore Date.now
      (Date.now as jest.Mock).mockRestore();
    });

    it('should not cache error responses', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: { code: 500, message: 'Server Error' }}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ threads: [], resultSizeEstimate: 0 }),
        });

      // First call fails
      await expect(gmailClient.fetchLatestThreads(10)).rejects.toThrow();

      // Second call should make new request
      const threads = await gmailClient.fetchLatestThreads(10);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(threads).toEqual([]);
    });

    it('should provide cache clearing method', () => {
      expect(typeof gmailClient.clearCache).toBe('function');
      expect(() => gmailClient.clearCache()).not.toThrow();
    });
  });

  describe('Rate Limiting', () => {
    let sleepSpy: jest.SpyInstance;

    beforeEach(() => {
      // Mock the sleep function to resolve immediately
      sleepSpy = jest.spyOn(gmailClient as any, 'sleep').mockResolvedValue(undefined);
    });

    afterEach(() => {
      sleepSpy.mockRestore();
    });

    it('should implement exponential backoff for retries', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: async () => ({ error: { code: 429, message: 'Rate Limit' }}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ threads: [], resultSizeEstimate: 0 }),
        });

      await gmailClient.fetchLatestThreads(10);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(sleepSpy).toHaveBeenCalledWith(1000); // 1 second delay for first retry
    });

    it('should give up after maximum retries', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: { code: 429, message: 'Rate Limit' }}),
      });

      await expect(gmailClient.fetchLatestThreads(10))
        .rejects.toThrow('Gmail API Error (429): Rate Limit');

      expect(mockFetch).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
      expect(sleepSpy).toHaveBeenCalledTimes(3); // 3 retry delays
      expect(sleepSpy).toHaveBeenNthCalledWith(1, 1000); // 1s
      expect(sleepSpy).toHaveBeenNthCalledWith(2, 2000); // 2s  
      expect(sleepSpy).toHaveBeenNthCalledWith(3, 4000); // 4s
    });
  });
});