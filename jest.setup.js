import '@testing-library/jest-dom'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Inter: () => ({
    style: {
      fontFamily: 'mocked',
    },
    variable: '--font-inter',
  }),
  Playfair_Display: () => ({
    style: {
      fontFamily: 'mocked',
    },
    variable: '--font-playfair',
  }),
  Crimson_Text: () => ({
    style: {
      fontFamily: 'mocked',
    },
    variable: '--font-crimson',
  }),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock'
process.env.CLERK_SECRET_KEY = 'sk_test_mock'
process.env.OPENAI_API_KEY = 'test-openai-key'

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }) => <>{children}</>,
  SignInButton: ({ children }) => <div>{children}</div>,
  SignUpButton: ({ children }) => <div>{children}</div>,
  UserButton: () => <div>User Button</div>,
  useUser: jest.fn(() => ({
    isSignedIn: false,
    user: null,
    isLoaded: true,
  })),
  useAuth: jest.fn(() => ({
    isSignedIn: false,
    userId: null,
    sessionId: null,
    getToken: jest.fn(),
  })),
  useClerk: jest.fn(() => ({
    signOut: jest.fn(),
  })),
  auth: jest.fn(() => ({
    userId: 'test-user-id',
  })),
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => ({
    userId: 'test-user-id',
  })),
  getAuth: jest.fn(() => ({
    userId: 'test-user-id',
  })),
  currentUser: jest.fn(() => ({
    id: 'test-user-id',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
  })),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    set: jest.fn(),
  })),
}))

// Mock Gmail auth module
jest.mock('@/lib/gmail-auth', () => ({
  createAuthenticatedGmailClient: jest.fn(() => ({
    fetchLatestThreads: jest.fn(() => []),
  })),
}))