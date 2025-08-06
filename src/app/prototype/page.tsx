'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { MessageList } from '@/components/prototype/MessageList';
import { MessageHeader } from '@/components/prototype/MessageHeader';
import type { UnifiedMessage } from '@/types/message';

export default function PrototypePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [slackConnected, setSlackConnected] = useState(false);
  const [gmailAuthUrl, setGmailAuthUrl] = useState<string>('');
  
  const getGmailAuthUrl = useCallback(async () => {
    try {
      const response = await fetch('/api/prototype/gmail-auth-url');
      const data = await response.json();
      if (response.ok) {
        setGmailAuthUrl(data.authUrl);
      }
    } catch (error) {
      console.error('Error getting Gmail auth URL:', error);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!isSignedIn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/prototype/messages?days=7');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch messages');
      }
      
      setMessages(data.messages.map((msg: UnifiedMessage) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
      
      setGmailConnected(data.gmailConnected);
      setSlackConnected(data.slackConnected);
      
      if (data.errors && data.errors.length > 0) {
        console.warn('Some services had errors:', data.errors);
      }
      
      if (data.messages.length === 0 && !data.gmailConnected && !data.slackConnected) {
        setError('Unable to connect to Gmail or Slack. Please check your configuration.');
      }
      
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);
  
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadMessages();
      getGmailAuthUrl();
      
      // Check for OAuth callback parameters
      const params = new URLSearchParams(window.location.search);
      if (params.get('gmail') === 'connected') {
        console.log('Gmail connected successfully');
        window.history.replaceState({}, '', '/prototype');
      }
    }
  }, [isLoaded, isSignedIn, loadMessages, getGmailAuthUrl]);
  
  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4">Napoleon AI Prototype</h1>
        <p className="text-gray-600 mb-8">Please sign in to access your unified inbox</p>
        <SignInButton mode="modal">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Sign In
          </button>
        </SignInButton>
      </div>
    );
  }
  
  const gmailCount = messages.filter(m => m.source === 'gmail').length;
  const slackCount = messages.filter(m => m.source === 'slack').length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <MessageHeader
        totalMessages={messages.length}
        gmailCount={gmailCount}
        slackCount={slackCount}
        onRefresh={loadMessages}
        isRefreshing={loading}
      />
      
      {/* Connection Status */}
      {!loading && (!gmailConnected || !slackConnected) && (
        <div className="mx-6 mt-4">
          {!gmailConnected && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-2">
              Gmail not connected. 
              {gmailAuthUrl && (
                <a 
                  href={gmailAuthUrl} 
                  className="underline ml-2 font-medium"
                >
                  Connect Gmail
                </a>
              )}
            </div>
          )}
          {!slackConnected && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
              Slack not connected. Please add SLACK_BOT_TOKEN to environment variables.
            </div>
          )}
        </div>
      )}
      
      {/* Message List */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <MessageList 
          messages={messages} 
          loading={loading} 
          error={error || undefined}
        />
      </div>
    </div>
  );
}