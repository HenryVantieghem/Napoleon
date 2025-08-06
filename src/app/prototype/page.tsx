'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { Shield } from 'lucide-react';
import { MessageList } from '@/components/prototype/MessageList';
import { MessageHeader } from '@/components/prototype/MessageHeader';
import { ConnectionStatus } from '@/components/prototype/ConnectionStatus';
import { DashboardStats } from '@/components/prototype/DashboardStats';
import type { UnifiedMessage } from '@/types/message';

export default function PrototypePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [slackConnected, setSlackConnected] = useState(false);

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
    // Debug environment on page load
    console.log('🌐 [PROTOTYPE] Environment debug:');
    console.log('  Window location:', window.location.href);
    console.log('  Expected app URL:', process.env.NEXT_PUBLIC_APP_URL || 'undefined');
    console.log('  Current domain:', window.location.origin);
    
    if (isLoaded && isSignedIn) {
      loadMessages();
      
      // Check for OAuth callback parameters
      const params = new URLSearchParams(window.location.search);
      const gmailStatus = params.get('gmail');
      const slackStatus = params.get('slack_connected');
      const slackError = params.get('slack_error');
      const oauthError = params.get('error');
      
      console.log('🔍 [PROTOTYPE] OAuth callback check:', { gmailStatus, slackStatus, slackError, oauthError });
      
      if (gmailStatus === 'connected') {
        console.log('✅ [PROTOTYPE] Gmail connected successfully');
        window.history.replaceState({}, '', '/prototype');
      } else if (slackStatus === 'true') {
        console.log('✅ [PROTOTYPE] Slack connected successfully');
        window.history.replaceState({}, '', '/prototype');
      } else if (slackError) {
        console.error('❌ [PROTOTYPE] Slack OAuth Error:', slackError);
        setError(`Slack OAuth Error: ${slackError}. Please try connecting again.`);
        window.history.replaceState({}, '', '/prototype');
      } else if (oauthError) {
        console.error('❌ [PROTOTYPE] OAuth Error:', oauthError);
        setError(`OAuth Error: ${oauthError}. Please check the browser console for details.`);
        window.history.replaceState({}, '', '/prototype');
      }
    }
  }, [isLoaded, isSignedIn, loadMessages]);
  
  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">Initializing Napoleon AI...</p>
        </div>
      </div>
    );
  }
  
  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Napoleon AI Executive Intelligence</h1>
          <p className="text-gray-600 mb-8">Please sign in to access your priority-classified unified inbox</p>
          <SignInButton mode="modal">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg">
              <Shield className="w-4 h-4" />
              Executive Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }
  
  const gmailCount = messages.filter(m => m.source === 'gmail').length;
  const slackCount = messages.filter(m => m.source === 'slack').length;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
      <MessageHeader
        totalMessages={messages.length}
        gmailCount={gmailCount}
        slackCount={slackCount}
        onRefresh={loadMessages}
        isRefreshing={loading}
      />
      
      {/* Executive Dashboard */}
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Connection Status - Executive Grade */}
        <ConnectionStatus
          gmailConnected={gmailConnected}
          slackConnected={slackConnected}
          onRefresh={loadMessages}
        />
        
        {/* Dashboard Stats */}
        <DashboardStats 
          messages={messages} 
          loading={loading}
        />
        
        {/* Message List */}
        <MessageList 
          messages={messages} 
          loading={loading} 
          error={error || undefined}
        />
      </div>
    </div>
  );
}