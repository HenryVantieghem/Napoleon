'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase-client';

function AuthCallbackContent() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientSupabase();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for error parameters
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          setError(errorDescription || errorParam);
          setStatus('error');
          return;
        }

        // Get the session after OAuth callback
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setError(sessionError.message);
          setStatus('error');
          return;
        }

        if (!session) {
          setError('No session found after authentication');
          setStatus('error');
          return;
        }

        // Verify Gmail scope
        if (session.provider_token) {
          try {
            const response = await fetch(
              `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${session.provider_token}`
            );
            
            if (response.ok) {
              const tokenInfo = await response.json();
              const hasGmailScope = tokenInfo.scope?.includes('https://www.googleapis.com/auth/gmail.readonly');
              
              if (!hasGmailScope) {
                setError('Gmail access permission was not granted. Please try again and grant Gmail access.');
                setStatus('error');
                return;
              }
            }
          } catch (scopeError) {
            console.warn('Could not verify Gmail scope:', scopeError);
            // Continue anyway - the scope verification is best effort
          }
        }

        setStatus('success');
        
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setStatus('error');
      }
    };

    handleAuthCallback();
  }, [searchParams, router, supabase]);

  const handleRetry = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-primary-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        {status === 'processing' && (
          <>
            <div className="w-12 h-12 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-2xl font-semibold text-warm-ivory mb-2">
              Connecting to Gmail
            </h1>
            <p className="text-neutral-silver">
              Please wait while we complete your authentication...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-6 h-6 text-primary-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-warm-ivory mb-2">
              Successfully Connected!
            </h1>
            <p className="text-neutral-silver">
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-warm-ivory mb-2">
              Authentication Failed
            </h1>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-accent-gold text-primary-background rounded-full font-semibold hover:bg-accent-gold/90 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-primary-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-warm-ivory">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}