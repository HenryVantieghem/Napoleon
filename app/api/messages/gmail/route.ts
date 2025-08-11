import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import { getValidGmailToken } from '@/lib/oauth-handlers';
import type { Message } from '@/types';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get valid Gmail token (handles refresh automatically)
    const accessToken = await getValidGmailToken(user.id);
    
    if (!accessToken) {
      return NextResponse.json({ 
        error: 'Gmail not connected',
        code: 'GMAIL_NOT_CONNECTED' 
      }, { status: 400 });
    }

    // Initialize Gmail API
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Calculate date range - last 7 days
    const sevenDaysAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
    
    // Fetch message list with date filter
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: `after:${sevenDaysAgo}`,
      maxResults: 50, // Limit to prevent timeouts
    });

    const messages: Message[] = [];
    
    if (listResponse.data.messages && listResponse.data.messages.length > 0) {
      // Process messages in smaller batches to prevent Edge Runtime timeout
      const messageIds = listResponse.data.messages.slice(0, 25); // Limit for performance
      
      // Fetch message details in parallel batches
      const batchSize = 5;
      for (let i = 0; i < messageIds.length; i += batchSize) {
        const batch = messageIds.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (msg) => {
          try {
            const details = await gmail.users.messages.get({
              userId: 'me',
              id: msg.id!,
              format: 'metadata',
              metadataHeaders: ['From', 'Subject', 'Date', 'To'],
            });

            const headers = details.data.payload?.headers || [];
            const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
            const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
            const date = headers.find(h => h.name === 'Date')?.value || '';
            const to = headers.find(h => h.name === 'To')?.value || '';

            // Parse sender email and name
            const senderMatch = from.match(/^(.+?)\s*<(.+)>$/) || from.match(/^(.+)$/);
            const senderName = senderMatch ? (senderMatch[1] || senderMatch[0]).trim().replace(/"/g, '') : 'Unknown';
            const senderEmail = senderMatch && senderMatch[2] ? senderMatch[2] : from;

            // Create message object
            const message: Message = {
              id: msg.id!,
              source: 'gmail',
              subject,
              content: subject, // Use subject as preview content
              sender: senderName,
              senderEmail: senderEmail || undefined,
              recipients: to || undefined,
              timestamp: date ? new Date(date).toISOString() : new Date().toISOString(),
              priority: getPriority(subject, senderEmail, senderName),
              metadata: {
                threadId: details.data.threadId || undefined,
                labelIds: details.data.labelIds || [],
              }
            };

            return message;
          } catch (msgError) {
            console.error(`Error fetching Gmail message ${msg.id}:`, msgError);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        const validMessages = batchResults.filter((msg): msg is Message => msg !== null);
        messages.push(...validMessages);
      }
    }

    // Sort messages by timestamp (newest first) and then by priority
    messages.sort((a, b) => {
      // Priority order: urgent > question > normal
      const priorityOrder = { urgent: 3, question: 2, normal: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      // If same priority, sort by timestamp (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return NextResponse.json({ 
      messages,
      totalCount: messages.length,
      source: 'gmail',
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gmail API error:', error);
    
    // Handle specific Gmail API errors
    if ((error as any)?.code === 401) {
      return NextResponse.json({ 
        error: 'Gmail authentication expired',
        code: 'GMAIL_AUTH_EXPIRED' 
      }, { status: 401 });
    }
    
    if ((error as any)?.code === 403) {
      return NextResponse.json({ 
        error: 'Gmail API access forbidden',
        code: 'GMAIL_FORBIDDEN' 
      }, { status: 403 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch Gmail messages',
      code: 'GMAIL_FETCH_ERROR'
    }, { status: 500 });
  }
}

// Priority detection algorithm for Gmail messages
function getPriority(subject: string, senderEmail: string, senderName: string): 'urgent' | 'question' | 'normal' {
  const subjectLower = subject.toLowerCase();
  const senderLower = senderEmail.toLowerCase();
  
  // Urgent indicators
  const urgentKeywords = [
    'urgent', 'asap', 'emergency', 'critical', 'immediate',
    'breaking', 'alert', 'action required', 'time sensitive',
    'deadline', 'overdue', 'escalation'
  ];
  
  // VIP sender domains (customize as needed)
  const vipDomains = [
    'ceo', 'cto', 'cfo', 'president', 'director', 'vp',
    'manager', 'lead', 'head', 'senior'
  ];
  
  // Check for urgent keywords in subject
  if (urgentKeywords.some(keyword => subjectLower.includes(keyword))) {
    return 'urgent';
  }
  
  // Check for VIP senders (by email or common titles)
  if (vipDomains.some(title => senderLower.includes(title) || senderName.toLowerCase().includes(title))) {
    return 'urgent';
  }
  
  // Check for questions
  if (subjectLower.includes('?') || 
      subjectLower.includes('please') ||
      subjectLower.includes('can you') ||
      subjectLower.includes('could you') ||
      subjectLower.includes('help') ||
      subjectLower.includes('question') ||
      subjectLower.includes('how to') ||
      subjectLower.includes('what is')) {
    return 'question';
  }
  
  // Default to normal priority
  return 'normal';
}