import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClerkAuthButton from '@/components/auth/ClerkAuthButton'

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => children,
  SignUpButton: ({ children }: { children: React.ReactNode }) => children,
  UserButton: () => <div data-testid="user-button" />,
  useUser: () => ({ isSignedIn: false, user: null, isLoaded: true }),
}))

// Mock Next.js router
const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  pathname: '/',
  query: {},
  asPath: '/',
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => new URLSearchParams(),
}))

const mockSupabaseClient = {
  auth: {
    signInWithOAuth: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
  },
}

// Test component for AuthProvider tests
const TestChild = () => <div>Protected Content</div>

describe('Gmail OAuth Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClientSupabase as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  describe('GmailOAuthButton Component', () => {
    it('should render Connect with Gmail button', () => {
      render(<GmailOAuthButton />)
      
      const button = screen.getByRole('button', { name: /Connect with Gmail/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-accent-gold')
    })

    it('should initiate Gmail OAuth when clicked', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://accounts.google.com/oauth/authorize' },
        error: null,
      })

      render(<GmailOAuthButton />)
      
      const button = screen.getByRole('button', { name: /Connect with Gmail/i })
      await userEvent.click(button)

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/gmail.readonly',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
    })

    it('should show loading state during OAuth process', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<GmailOAuthButton />)
      
      const button = screen.getByRole('button', { name: /Connect with Gmail/i })
      await userEvent.click(button)

      expect(screen.getByText(/Connecting/i)).toBeInTheDocument()
    })

    it('should handle OAuth errors gracefully', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: 'OAuth failed' },
      })

      render(<GmailOAuthButton />)
      
      const button = screen.getByRole('button', { name: /Connect with Gmail/i })
      await userEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText(/OAuth failed/i)).toBeInTheDocument()
      })
    })
  })

  describe('AuthProvider Component', () => {

    it('should show loading state initially', () => {
      mockSupabaseClient.auth.getSession.mockReturnValue(
        new Promise(() => {}) // Never resolves to simulate loading
      )

      render(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      )

      expect(screen.getByText(/Loading/i)).toBeInTheDocument()
    })

    it('should render children when user is authenticated', async () => {
      const mockSession = {
        access_token: 'mock-token',
        user: { 
          id: '123', 
          email: 'test@gmail.com',
          app_metadata: {
            provider: 'google',
          },
        },
      }

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      render(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      })
    })

    it('should redirect to landing when user is not authenticated', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      render(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('should handle auth state changes', async () => {
      const mockCallback = jest.fn()
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        mockCallback.mockImplementation(callback)
        return {
          data: { subscription: { unsubscribe: jest.fn() } },
        }
      })

      render(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      )

      // Simulate auth state change
      const mockSession = {
        access_token: 'new-token',
        user: { id: '456', email: 'newuser@gmail.com' },
      }

      await waitFor(() => {
        expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled()
      })
    })
  })

  describe('OAuth Redirect Flow', () => {
    it('should redirect to dashboard after successful authentication', async () => {
      // Mock successful OAuth callback
      const mockSession = {
        access_token: 'oauth-token',
        refresh_token: 'refresh-token',
        user: {
          id: '789',
          email: 'success@gmail.com',
          app_metadata: { provider: 'google' },
        },
      }

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      // Simulate OAuth callback page
      render(
        <AuthProvider redirectTo="/dashboard">
          <TestChild />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should handle OAuth callback errors', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid OAuth state' },
      })

      render(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/Authentication error/i)).toBeInTheDocument()
      })
    })

    it('should verify Gmail scope permissions are granted', async () => {
      const mockSession = {
        access_token: 'token-with-gmail-scope',
        provider_token: 'google-access-token',
        user: {
          id: '999',
          email: 'test@gmail.com',
          app_metadata: { 
            provider: 'google',
            providers: ['google'],
          },
        },
      }

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      // Mock Gmail API scope verification
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          scope: 'https://www.googleapis.com/auth/gmail.readonly',
        }),
      })

      render(
        <AuthProvider requireGmailScope={true}>
          <TestChild />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      })
    })
  })

  describe('Session Management', () => {
    it('should refresh tokens when they expire', async () => {
      const expiredSession = {
        access_token: 'expired-token',
        expires_at: Date.now() / 1000 - 3600, // Expired 1 hour ago
        user: { id: '123', email: 'test@gmail.com' },
      }

      const refreshedSession = {
        access_token: 'new-token',
        expires_at: Date.now() / 1000 + 3600, // Expires in 1 hour
        user: { id: '123', email: 'test@gmail.com' },
      }

      mockSupabaseClient.auth.getSession
        .mockResolvedValueOnce({
          data: { session: expiredSession },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { session: refreshedSession },
          error: null,
        })

      render(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      })
    })

    it('should sign out user when refresh fails', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Refresh token expired' },
      })

      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null })

      render(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })
  })
})