'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase-client';
import type { User, Session } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  requireGmailScope?: boolean;
}

export default function AuthProvider({ 
  children, 
  redirectTo = '/dashboard',
  requireAuth = true,
  requireGmailScope = false 
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientSupabase();

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
    }
  }, [supabase, router]);

  const verifyGmailScope = async (accessToken: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
      if (!response.ok) return false;
      
      const tokenInfo = await response.json();
      return tokenInfo.scope?.includes('https://www.googleapis.com/auth/gmail.readonly') || false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setError('Authentication error: ' + error.message);
          if (requireAuth) {
            router.push('/');
          }
          return;
        }

        if (!session || !session.user) {
          if (requireAuth) {
            router.push('/');
          }
          return;
        }

        // Verify Gmail scope if required
        if (requireGmailScope && session.provider_token) {
          const hasGmailScope = await verifyGmailScope(session.provider_token);
          if (!hasGmailScope) {
            setError('Gmail access permission required');
            await signOut();
            return;
          }
        }

        if (mounted) {
          setSession(session);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at || new Date().toISOString(),
            updated_at: session.user.updated_at || new Date().toISOString(),
          });

          // Redirect to dashboard if on auth callback page
          if (window.location.pathname === '/auth/callback') {
            router.push(redirectTo);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Session error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session) {
          setSession(session);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at || new Date().toISOString(),
            updated_at: session.user.updated_at || new Date().toISOString(),
          });
          router.push(redirectTo);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          if (requireAuth) {
            router.push('/');
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setSession(session);
        }
      }
    );

    getSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router, requireAuth, requireGmailScope, redirectTo, signOut]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-primary-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-warm-ivory">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-primary-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <p className="text-red-400">Authentication error</p>
            <p className="text-red-300 text-sm mt-2">{error}</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-accent-gold text-primary-background rounded-full hover:bg-accent-gold/90 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated but auth not required
  if (!user && !requireAuth) {
    return <>{children}</>;
  }

  // Not authenticated and auth required
  if (!user && requireAuth) {
    return null; // Will redirect to landing page
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}