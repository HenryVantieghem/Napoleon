import OpenAI from 'openai';
import type { GmailThread, AIAnalysis } from '@/lib/types';

export class OpenAIAnalyzer {
  private openai: OpenAI;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    this.openai = new OpenAI({
      apiKey,
      // Use edge runtime compatible settings
      maxRetries: this.MAX_RETRIES,
      timeout: 30000, // 30 seconds
    });
  }

  async analyzeThread(thread: GmailThread): Promise<AIAnalysis> {
    if (!thread?.id || !thread?.subject) {
      throw new Error('Thread must have valid ID and subject');
    }

    try {
      const prompt = this.buildAnalysisPrompt(thread);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Use cost-effective model for production
        messages: [
          {
            role: 'system',
            content: `You are Napoleon AI, an executive email prioritization assistant. 
            Your role is to analyze email threads and provide priority scoring for C-level executives.
            
            PRIORITY SCORING CRITERIA (0-10 scale):
            - 9-10 (GOLD): Urgent matters requiring immediate executive action (board issues, crises, legal deadlines)
            - 7-8 (SILVER): Important business matters requiring timely attention (financial reports, strategic decisions)
            - 4-6 (BRONZE): Routine business communications that should be reviewed (team updates, vendor communications)
            - 0-3 (STANDARD): Informational content with no immediate action required
            
            BOOST FACTORS:
            - CEO/C-level participants: +1.0 to score
            - Time-sensitive keywords (urgent, deadline, today, asap): +0.5 to score
            - Legal/compliance matters: +0.5 to score
            - Financial/revenue impact: +0.5 to score
            - Crisis/emergency indicators: +1.0 to score
            
            Respond ONLY with valid JSON matching this exact structure - no additional text:`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent scoring
        max_tokens: 800,
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('Empty response from OpenAI');
      }

      try {
        const analysis = JSON.parse(response);
        return this.validateAndFormatAnalysis(analysis, thread.id);
      } catch {
        console.error('Failed to parse OpenAI response:', response);
        throw new Error('Invalid JSON response from OpenAI');
      }

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          throw new Error('OpenAI API rate limit exceeded. Please try again later.');
        }
        if (error.message.includes('insufficient_quota')) {
          throw new Error('OpenAI API quota exceeded. Please check your billing.');
        }
        if (error.message.includes('invalid_api_key')) {
          throw new Error('Invalid OpenAI API key. Please check your configuration.');
        }
        throw error;
      }
      throw new Error('Unknown error occurred during AI analysis');
    }
  }

  private buildAnalysisPrompt(thread: GmailThread): string {
    const recentTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const isRecent = new Date(thread.lastActivity) > new Date(recentTime);
    
    return `Analyze this executive email thread for priority scoring:

THREAD DETAILS:
- Subject: "${thread.subject}"
- Snippet: "${thread.snippet}"
- Participants: ${thread.participants.join(', ')}
- Unread Count: ${thread.unreadCount}
- Has Attachments: ${thread.hasAttachments}
- Labels: ${thread.labels.join(', ')}
- Last Activity: ${thread.lastActivity.toISOString()}
- Recent Activity: ${isRecent}

ANALYSIS REQUIRED:
{
  "priority_score": <number 0-10>,
  "category": "<urgent|important|follow_up|fyi|spam>",
  "summary": "<concise executive summary in 1-2 sentences>",
  "key_points": ["<3-5 key points from the email>"],
  "suggested_actions": ["<2-4 specific actions for the executive>"],
  "sentiment": "<positive|neutral|negative>",
  "confidence_score": <number 0-1>,
  "reasoning": "<brief explanation of priority score reasoning>"
}`;
  }

  private validateAndFormatAnalysis(analysis: unknown, threadId: string): AIAnalysis {
    // Type guard to ensure analysis is an object
    if (!analysis || typeof analysis !== 'object') {
      throw new Error('Invalid analysis response from AI');
    }

    const analysisObj = analysis as Record<string, unknown>;

    // Validate required fields
    if (analysisObj.priority_score === null || analysisObj.priority_score === undefined ||
        typeof analysisObj.priority_score !== 'number' || 
        analysisObj.priority_score < 0 || 
        analysisObj.priority_score > 10) {
      throw new Error('Invalid priority score received from AI analysis');
    }

    if (!analysisObj.category || 
        !['urgent', 'important', 'follow_up', 'fyi', 'spam'].includes(analysisObj.category as string)) {
      throw new Error('Invalid category received from AI analysis');
    }

    if (!analysisObj.summary || typeof analysisObj.summary !== 'string') {
      throw new Error('Invalid summary received from AI analysis');
    }

    if (!Array.isArray(analysisObj.key_points)) {
      analysisObj.key_points = [];
    }

    if (!Array.isArray(analysisObj.suggested_actions)) {
      analysisObj.suggested_actions = [];
    }

    if (!analysisObj.sentiment || 
        !['positive', 'neutral', 'negative'].includes(analysisObj.sentiment as string)) {
      analysisObj.sentiment = 'neutral';
    }

    if (typeof analysisObj.confidence_score !== 'number' || 
        analysisObj.confidence_score < 0 || 
        analysisObj.confidence_score > 1) {
      analysisObj.confidence_score = 0.5;
    }

    return {
      id: `analysis_${threadId}_${Date.now()}`,
      thread_id: threadId,
      priority_score: Math.round(analysisObj.priority_score as number * 10) / 10, // Round to 1 decimal
      category: analysisObj.category as 'urgent' | 'important' | 'follow_up' | 'fyi' | 'spam',
      summary: (analysisObj.summary as string).substring(0, 500), // Limit summary length
      key_points: (analysisObj.key_points as string[]).slice(0, 5), // Limit to 5 key points
      suggested_actions: (analysisObj.suggested_actions as string[]).slice(0, 4), // Limit to 4 actions
      sentiment: analysisObj.sentiment as 'positive' | 'neutral' | 'negative',
      confidence_score: Math.round(analysisObj.confidence_score as number * 100) / 100, // Round to 2 decimals
      created_at: new Date().toISOString(),
    };
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}