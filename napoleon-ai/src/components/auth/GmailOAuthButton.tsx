'use client';

import { useState } from 'react';
import { createClientSupabase } from '@/lib/supabase-client';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

interface GmailOAuthButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function GmailOAuthButton({ className = '', children }: GmailOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientSupabase();

  const handleGmailOAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/gmail.readonly',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      // The user will be redirected to Google OAuth
      // No need to handle the redirect here as Supabase handles it
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleGmailOAuth}
        disabled={isLoading}
        className={`
          group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold 
          text-primary-background bg-accent-gold rounded-full transition-all duration-300 
          hover:bg-accent-gold/90 hover:scale-105 active:scale-95 disabled:opacity-50 
          disabled:cursor-not-allowed disabled:hover:scale-100 ${className}
        `}
      >
        <EnvelopeIcon className="w-6 h-6 mr-3 transition-transform group-hover:rotate-12" />
        {isLoading ? 'Connecting...' : children || 'Connect with Gmail'}
        <div className="absolute inset-0 rounded-full bg-accent-gold opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-ripple"></div>
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}