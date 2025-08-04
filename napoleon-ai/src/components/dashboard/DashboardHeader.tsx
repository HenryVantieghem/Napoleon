'use client';

import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase-client';

interface DashboardHeaderProps {
  userEmail: string;
  userName: string;
}

export function DashboardHeader({ userEmail, userName }: DashboardHeaderProps) {
  const router = useRouter();
  const supabase = createClientSupabase();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header 
      className="border-b border-white/10 bg-primary-background/80 backdrop-blur-xl sticky top-0 z-50"
      data-testid="dashboard-header"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Napoleon AI Branding */}
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 bg-accent-gold rounded-full flex items-center justify-center"
              data-testid="napoleon-logo"
            >
              <span className="text-primary-background font-bold text-lg">N</span>
            </div>
            <div>
              <h1 className="text-xl font-serif text-accent-gold font-semibold">
                Napoleon AI
              </h1>
              <p className="text-xs text-neutral-silver">
                Executive Intelligence
              </p>
            </div>
          </div>

          {/* User Information & Actions */}
          <div className="flex items-center space-x-6">
            {/* User Profile */}
            <div className="text-right">
              <p className="text-sm font-medium text-warm-ivory">
                {userName}
              </p>
              <p className="text-xs text-neutral-silver">
                {userEmail}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Refresh Button */}
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-neutral-silver hover:text-accent-gold transition-colors rounded-lg hover:bg-accent-gold/10"
                aria-label="Refresh inbox"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm text-neutral-silver hover:text-warm-ivory border border-white/20 rounded-lg hover:bg-accent-gold/10 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}