import type { 
  GmailThread, 
  GmailApiThread, 
  GmailApiMessage,
  GmailApiListResponse
} from '@/lib/types';

interface CacheEntry {
  data: GmailThread[];
  timestamp: number;
}

export default class GmailClient {
  private accessToken: string;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly BASE_URL = 'https://gmail.googleapis.com/gmail/v1';
  private readonly MAX_RETRIES = 3;

  constructor(accessToken: string) {
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Access token is required');
    }
    this.accessToken = accessToken;
  }

  async fetchLatestThreads(count: number = 10): Promise<GmailThread[]> {
    const cacheKey = `threads_${count}`;
    
    // Check cache first
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const url = `${this.BASE_URL}/users/me/threads?maxResults=${count}`;
      const response = await this.makeRequest(url) as GmailApiListResponse<{ id: string }>;
      
      if (!response.threads) {
        return [];
      }

      // Fetch full thread details for each thread
      const threadsWithDetails = await Promise.all(
        response.threads.map(thread => this.fetchThreadDetails(thread.id))
      );

      // Transform to our format
      const transformedThreads = threadsWithDetails
        .filter(thread => thread !== null)
        .map(thread => this.transformThread(thread!))
        .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

      // Cache the result
      this.setCachedData(cacheKey, transformedThreads);

      return transformedThreads;
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('Gmail API Error') ||
        error.message.includes('Failed to parse Gmail API response')
      )) {
        throw error;
      }
      throw new Error('Network error occurred while fetching Gmail threads');
    }
  }

  private async fetchThreadDetails(threadId: string): Promise<GmailApiThread | null> {
    try {
      const url = `${this.BASE_URL}/users/me/threads/${threadId}`;
      const response = await this.makeRequest(url) as GmailApiThread;
      return response;
    } catch (error) {
      console.error(`Failed to fetch thread details for ${threadId}:`, error);
      return null;
    }
  }

  private async makeRequest(url: string, retryCount: number = 0): Promise<unknown> {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = errorData.error || {};
        
        // Handle rate limiting with exponential backoff
        if (response.status === 429 && retryCount < this.MAX_RETRIES) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          await this.sleep(delay);
          return this.makeRequest(url, retryCount + 1);
        }

        throw new Error(`Gmail API Error (${response.status}): ${error.message || 'Unknown error'}`);
      }

      try {
        return await response.json();
      } catch {
        throw new Error('Failed to parse Gmail API response');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Gmail API Error')) {
        throw error;
      }
      
      if (error instanceof Error && error.message.includes('Failed to parse Gmail API response')) {
        throw error;
      }
      
      throw error;
    }
  }

  private transformThread(apiThread: GmailApiThread): GmailThread {
    const messages = apiThread.messages || [];
    
    return {
      id: apiThread.id,
      subject: this.extractSubject(messages),
      snippet: apiThread.snippet || '',
      participants: this.extractParticipants(messages),
      unreadCount: this.calculateUnreadCount(messages),
      lastActivity: this.extractLastActivity(messages),
      hasAttachments: this.hasAttachments(messages),
      labels: this.extractLabels(messages),
    };
  }

  private extractSubject(messages: GmailApiMessage[]): string {
    for (const message of messages) {
      const subjectHeader = message.payload.headers.find(
        header => header.name.toLowerCase() === 'subject'
      );
      if (subjectHeader?.value) {
        return subjectHeader.value;
      }
    }
    return '(No Subject)';
  }

  private extractParticipants(messages: GmailApiMessage[]): string[] {
    const participants = new Set<string>();
    
    for (const message of messages) {
      const headers = message.payload.headers;
      
      // Extract from From, To, Cc, Bcc headers
      ['from', 'to', 'cc', 'bcc'].forEach(headerName => {
        const header = headers.find(h => h.name.toLowerCase() === headerName);
        if (header?.value) {
          this.parseEmailAddresses(header.value).forEach(email => {
            if (email) participants.add(email);
          });
        }
      });
    }
    
    return Array.from(participants);
  }

  private parseEmailAddresses(headerValue: string): string[] {
    // Simple email extraction - handles "Name <email@domain.com>" and "email@domain.com"
    const emailRegex = /<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/g;
    const matches = [];
    let match;
    
    while ((match = emailRegex.exec(headerValue)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  }

  private calculateUnreadCount(messages: GmailApiMessage[]): number {
    return messages.filter(message => 
      message.labelIds.includes('UNREAD')
    ).length;
  }

  private extractLastActivity(messages: GmailApiMessage[]): Date {
    if (messages.length === 0) return new Date();
    
    const latestMessage = messages[messages.length - 1];
    return new Date(parseInt(latestMessage.internalDate));
  }

  private hasAttachments(messages: GmailApiMessage[]): boolean {
    return messages.some(message => {
      const payload = message.payload;
      
      // Check if message has parts with attachments
      if (payload.parts) {
        return payload.parts.some(part => 
          part.filename && part.filename.length > 0 && part.body.size > 0
        );
      }
      
      // Check if main payload has attachment
      return payload.filename && payload.filename.length > 0 && payload.body.size > 0;
    });
  }

  private extractLabels(messages: GmailApiMessage[]): string[] {
    const labels = new Set<string>();
    
    messages.forEach(message => {
      message.labelIds.forEach(label => labels.add(label));
    });
    
    return Array.from(labels);
  }

  private getCachedData(key: string): GmailThread[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCachedData(key: string, data: GmailThread[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearCache(): void {
    this.cache.clear();
  }
}