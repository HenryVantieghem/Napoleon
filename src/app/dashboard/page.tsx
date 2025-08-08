'use client';
import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs';

interface Message {
  id: string;
  content: string;
  sender: string;
  platform: 'gmail' | 'slack';
  timestamp: string;
  isUrgent: boolean;
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  // Fetch and stream messages
  useEffect(() => {
    if (!user) return;
    
    const fetchMessages = async () => {
      try {
        // Fetch Gmail messages
        const gmailRes = await fetch('/api/clerk/gmail/messages');
        const gmailData = gmailRes.ok ? await gmailRes.json() : { messages: [] };
        
        // Fetch Slack messages  
        const slackRes = await fetch('/api/clerk/slack/messages');
        const slackData = slackRes.ok ? await slackRes.json() : { messages: [] };
        
        // Transform and combine messages
        const transformedMessages: Message[] = [];
        
        // Transform Gmail messages
        if (gmailData.messages && Array.isArray(gmailData.messages)) {
          gmailData.messages.forEach((msg: any) => {
            transformedMessages.push({
              id: `gmail_${msg.id}`,
              content: msg.snippet || msg.subject || 'No content',
              sender: msg.from || 'Unknown',
              platform: 'gmail',
              timestamp: new Date(parseInt(msg.internalDate)).toISOString(),
              isUrgent: (msg.snippet || '').toLowerCase().includes('urgent') || (msg.snippet || '').includes('?')
            });
          });
        }
        
        // Transform Slack messages
        if (slackData.messages && Array.isArray(slackData.messages)) {
          slackData.messages.forEach((msg: any) => {
            transformedMessages.push({
              id: `slack_${msg.ts}`,
              content: msg.text || 'No content',
              sender: msg.user || 'Unknown',
              platform: 'slack',
              timestamp: new Date(parseFloat(msg.ts) * 1000).toISOString(),
              isUrgent: (msg.text || '').toLowerCase().includes('urgent') || (msg.text || '').includes('?')
            });
          });
        }
        
        // Sort messages by priority
        const sortedMessages = prioritizeMessages(transformedMessages);
        setMessages(sortedMessages);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Priority sorting logic (EXACT requirement)
  const prioritizeMessages = (messages: Message[]) => {
    return messages.sort((a, b) => {
      const aIsUrgent = a.content.toLowerCase().includes('urgent') || a.content.includes('?');
      const bIsUrgent = b.content.toLowerCase().includes('urgent') || b.content.includes('?');
      
      if (aIsUrgent && !bIsUrgent) return -1;
      if (!aIsUrgent && bIsUrgent) return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  };

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gray-900 text-white p-6">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Napoleon AI Dashboard</h1>
            <p className="text-gray-400">Streaming message intelligence for {user?.emailAddresses[0]?.emailAddress}</p>
          </header>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-xl">Loading messages...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-400">No messages found from the past 7 days</p>
                  <p className="text-sm text-gray-500 mt-2">Connect your Gmail and Slack accounts to see messages</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div 
                    key={message.id} 
                    className={`p-4 rounded-lg border-l-4 ${
                      message.isUrgent 
                        ? 'bg-red-900/20 border-red-500' 
                        : 'bg-gray-800 border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          message.platform === 'gmail' 
                            ? 'bg-blue-600' 
                            : 'bg-purple-600'
                        }`}>
                          {message.platform.toUpperCase()}
                        </span>
                        <span className="font-semibold">{message.sender}</span>
                        {message.isUrgent && (
                          <span className="px-2 py-1 bg-red-600 text-xs rounded">URGENT</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-400">{message.timestamp}</span>
                    </div>
                    <p className="text-gray-200">{message.content}</p>
                    {index < messages.length - 1 && <hr className="mt-4 border-gray-700" />}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}