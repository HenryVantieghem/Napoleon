'use client';

import { useRouter } from 'next/navigation';
import { Mail, RefreshCw, LogOut } from 'lucide-react';
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
      className="border-b border-gray-800 bg-black/80 backdrop-blur-xl sticky top-0 z-50"
      data-testid="dashboard-header"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Napoleon AI Branding */}
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
              data-testid="napoleon-logo"
            >
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                Napoleon AI
              </h1>
              <p className="text-xs text-gray-400">
                Smart Email Dashboard
              </p>
            </div>
          </div>

          {/* User Information & Actions */}
          <div className="flex items-center gap-6">
            {/* User Profile */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">
                {userName}
              </p>
              <p className="text-xs text-gray-400">
                {userEmail}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Refresh Button */}
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                aria-label="Refresh inbox"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="btn-secondary text-sm py-2 px-3 gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}