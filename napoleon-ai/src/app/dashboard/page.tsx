'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase-client';
import GmailClient from '@/lib/gmail-client';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ThreadList } from '@/components/dashboard/ThreadList';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import type { GmailThread } from '@/lib/types';

export default function Dashboard() {
  const [threads, setThreads] = useState<GmailThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const router = useRouter();
  const supabase = createClientSupabase();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/');
          return;
        }

        // Set user information
        setUserEmail(session.user.email || '');
        setUserName(session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Executive');

        // Check for Gmail access token
        if (!session.provider_token) {
          setError('Gmail access token not found. Please reconnect your account.');
          setLoading(false);
          return;
        }

        // Initialize Gmail client and fetch threads
        const gmailClient = new GmailClient(session.provider_token);
        const fetchedThreads = await gmailClient.fetchLatestThreads(10);
        
        setThreads(fetchedThreads);
      } catch (err) {
        console.error('Dashboard initialization error:', err);
        if (err instanceof Error) {
          if (err.message.includes('Gmail API Error (401)')) {
            setError('Your Gmail access has expired. Please reconnect your account.');
          } else if (err.message.includes('Gmail API Error (403)')) {
            setError('Insufficient Gmail permissions. Please grant full access to your emails.');
          } else if (err.message.includes('Network error')) {
            setError('Unable to connect to Gmail. Please check your internet connection.');
          } else {
            setError('Unable to load your emails. Please try refreshing the page.');
          }
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router, supabase]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleReconnect = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-background" data-testid="dashboard-container">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-background" data-testid="dashboard-container">
        <DashboardHeader userEmail={userEmail} userName={userName} />
        <ErrorState 
          message={error} 
          onRefresh={handleRefresh}
          onReconnect={handleReconnect}
        />
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="min-h-screen bg-primary-background" data-testid="dashboard-container">
        <DashboardHeader userEmail={userEmail} userName={userName} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-background" data-testid="dashboard-container">
      <DashboardHeader userEmail={userEmail} userName={userName} />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-warm-ivory mb-2">
            Executive Inbox
          </h1>
          <p className="text-neutral-silver">
            {threads.length} conversation{threads.length !== 1 ? 's' : ''} • 
            {threads.filter(t => t.unreadCount > 0).length} unread
          </p>
        </div>
        <ThreadList threads={threads} />
      </main>
    </div>
  );
}