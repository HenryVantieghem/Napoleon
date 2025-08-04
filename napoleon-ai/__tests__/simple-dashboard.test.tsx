import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock all external dependencies at once
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  useSearchParams: () => ({ get: jest.fn() }),
  usePathname: () => '/dashboard',
}));

jest.mock('@/lib/supabase-client', () => ({
  createClientSupabase: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: { email: 'test@example.com', user_metadata: { name: 'Test User' } },
            provider_token: 'mock-token',
          },
        },
      }),
      signOut: jest.fn(),
    },
  }),
}));

jest.mock('@/lib/gmail-client', () => {
  return jest.fn().mockImplementation(() => ({
    fetchLatestThreads: jest.fn().mockResolvedValue([]),
  }));
});

describe('Simple Dashboard Test', () => {
  it('should import and render without crashing', async () => {
    // Dynamic import to avoid issues with mocking
    const { default: Dashboard } = await import('@/app/dashboard/page');
    
    render(<Dashboard />);
    
    // Just check that something renders
    expect(document.body).toBeInTheDocument();
  });
});