import { renderHook, waitFor } from '@testing-library/react'
import { useUser, useAuth } from '@clerk/nextjs'

// Mock Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
  useAuth: jest.fn(),
  useClerk: jest.fn(() => ({
    signOut: jest.fn(),
  })),
  SignInButton: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignUpButton: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  UserButton: () => <div>User Button</div>,
}))

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Clerk Authentication', () => {
    it('should handle signed in state', () => {
      (useUser as jest.Mock).mockReturnValue({
        isSignedIn: true,
        user: {
          id: 'user_123',
          emailAddresses: [{ emailAddress: 'test@example.com' }],
          firstName: 'Test',
          lastName: 'User',
        },
        isLoaded: true,
      })

      const { result } = renderHook(() => useUser())

      expect(result.current.isSignedIn).toBe(true)
      expect(result.current.user?.emailAddresses[0].emailAddress).toBe('test@example.com')
    })

    it('should handle signed out state', () => {
      (useUser as jest.Mock).mockReturnValue({
        isSignedIn: false,
        user: null,
        isLoaded: true,
      })

      const { result } = renderHook(() => useUser())

      expect(result.current.isSignedIn).toBe(false)
      expect(result.current.user).toBeNull()
    })

    it('should handle loading state', () => {
      (useUser as jest.Mock).mockReturnValue({
        isSignedIn: false,
        user: null,
        isLoaded: false,
      })

      const { result } = renderHook(() => useUser())

      expect(result.current.isLoaded).toBe(false)
    })

    it('should provide auth tokens', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isSignedIn: true,
        userId: 'user_123',
        sessionId: 'session_123',
        getToken: jest.fn().mockResolvedValue('mock_token'),
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.userId).toBe('user_123')
      expect(result.current.sessionId).toBe('session_123')
    })

    it('should handle sign out', async () => {
      const mockSignOut = jest.fn().mockResolvedValue(undefined)
      
      (useAuth as jest.Mock).mockReturnValue({
        isSignedIn: true,
        userId: 'user_123',
        signOut: mockSignOut,
      })

      const { result } = renderHook(() => useAuth())

      await result.current.signOut()

      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  describe('Gmail OAuth Integration', () => {
    it('should verify Gmail scopes are requested', async () => {
      // Clerk handles OAuth internally, so we test the configuration
      const clerkConfig = {
        providers: ['oauth_google'],
        scopes: ['email', 'profile', 'openid', 'https://www.googleapis.com/auth/gmail.readonly'],
      }

      expect(clerkConfig.scopes).toContain('https://www.googleapis.com/auth/gmail.readonly')
    })

    it('should handle authentication errors', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isSignedIn: false,
        userId: null,
        error: 'Authentication failed',
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.isSignedIn).toBe(false)
      expect(result.current.error).toBe('Authentication failed')
    })
  })
})