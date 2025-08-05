import { render, screen, waitFor, within, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '@/app/dashboard/page';
import { ThreadList } from '@/components/dashboard/ThreadList';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ThreadCard } from '@/components/dashboard/ThreadCard';
import type { GmailThread } from '@/lib/types';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/dashboard',
}));

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isSignedIn: true,
    user: {
      emailAddresses: [{ emailAddress: 'executive@company.com' }],
      firstName: 'John',
      lastName: 'Executive',
    },
    isLoaded: true,
  }),
  useAuth: () => ({
    isSignedIn: true,
    userId: 'test-user-id',
    getToken: jest.fn().mockResolvedValue('mock-token'),
  }),
  useClerk: () => ({
    signOut: jest.fn(),
  }),
  UserButton: () => <div>User Button</div>,
}));

// Mock Gmail Client
jest.mock('@/lib/gmail-client', () => {
  return jest.fn().mockImplementation(() => ({
    fetchLatestThreads: jest.fn().mockResolvedValue([
      {
        id: 'thread-1',
        subject: 'Q4 Financial Report',
        snippet: 'Please review the attached Q4 financial report...',
        participants: ['cfo@company.com', 'executive@company.com'],
        unreadCount: 1,
        lastActivity: new Date('2024-01-10T10:00:00'),
        hasAttachments: true,
        labels: ['INBOX', 'IMPORTANT'],
      },
      {
        id: 'thread-2',
        subject: 'Board Meeting Tomorrow',
        snippet: 'Reminder: Board meeting tomorrow at 2 PM...',
        participants: ['board@company.com', 'executive@company.com'],
        unreadCount: 0,
        lastActivity: new Date('2024-01-10T09:00:00'),
        hasAttachments: false,
        labels: ['INBOX'],
      },
    ]),
  }));
});

// Mock Gmail Auth
jest.mock('@/lib/auth', () => ({
  createAuthenticatedGmailClient: jest.fn().mockResolvedValue({
    fetchLatestThreads: jest.fn().mockResolvedValue([]),
  }),
}));

// Mock OpenAI Analyzer
jest.mock('@/lib/ai', () => {
  return jest.fn().mockImplementation(() => ({
    analyzeThread: jest.fn().mockResolvedValue({
      priority_score: 8.5,
      category: 'urgent',
      summary: 'Important financial report requiring immediate review',
      key_points: ['Q4 results', 'Revenue growth', 'Action required'],
      suggested_actions: ['Review report', 'Prepare response', 'Schedule meeting'],
      sentiment: 'neutral',
      confidence_score: 0.9,
    }),
  }));
});

// Mock Priority Scorer
jest.mock('@/lib/ai', () => ({
  PriorityScorer: jest.fn().mockImplementation(() => ({
    scoreThreads: jest.fn().mockResolvedValue([
      {
        thread: {
          id: 'thread-1',
          subject: 'Q4 Financial Report',
          snippet: 'Please review the attached Q4 financial report...',
          participants: ['cfo@company.com', 'executive@company.com'],
          unreadCount: 1,
          lastActivity: new Date('2024-01-10T10:00:00'),
          hasAttachments: true,
          labels: ['INBOX', 'IMPORTANT'],
        },
        analysis: {
          id: 'analysis-1',
          thread_id: 'thread-1',
          priority_score: 8.5,
          category: 'urgent',
          summary: 'Important financial report requiring immediate review',
          key_points: ['Q4 results', 'Revenue growth', 'Action required'],
          suggested_actions: ['Review report', 'Prepare response', 'Schedule meeting'],
          sentiment: 'neutral',
          confidence_score: 0.9,
          created_at: new Date().toISOString(),
        },
        priorityScore: 8.5,
        priorityTier: 'gold',
        boostedScore: 9.2,
        boostReason: 'CFO communication + Financial report',
      },
    ]),
  })),
}));

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Icons
jest.mock('lucide-react', () => ({
  Mail: () => <div>Mail Icon</div>,
  RefreshCw: () => <div>Refresh Icon</div>,
  LogOut: () => <div>Logout Icon</div>,
  Crown: () => <div>Crown Icon</div>,
  Shield: () => <div>Shield Icon</div>,
  Zap: () => <div>Zap Icon</div>,
  Star: () => <div>Star Icon</div>,
  Award: () => <div>Award Icon</div>,
  TrendingUp: () => <div>TrendingUp Icon</div>,
  Clock: () => <div>Clock Icon</div>,
  Paperclip: () => <div>Paperclip Icon</div>,
}));

jest.mock('react-icons/fa', () => ({
  FaCrown: () => <div>Crown Icon</div>,
}));

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Dashboard Page', () => {
    it('renders the dashboard layout', async () => {
      render(<Dashboard />);

      // Check for main dashboard elements
      expect(screen.getByText(/Napoleon AI/i)).toBeInTheDocument();
      
      // The UserButton component should be rendered
      expect(screen.getByText('User Button')).toBeInTheDocument();
    });
  });

  describe('DashboardHeader', () => {
    it('displays user information', () => {
      render(
        <DashboardHeader 
          userEmail="executive@company.com" 
          userName="John Executive" 
        />
      );

      expect(screen.getByText('John Executive')).toBeInTheDocument();
      expect(screen.getByText('executive@company.com')).toBeInTheDocument();
    });

    it('renders Napoleon AI branding', () => {
      render(
        <DashboardHeader 
          userEmail="test@example.com" 
          userName="Test User" 
        />
      );

      expect(screen.getByText('Napoleon AI')).toBeInTheDocument();
      expect(screen.getByText('Smart Email Dashboard')).toBeInTheDocument();
    });

    it('includes action buttons', () => {
      render(
        <DashboardHeader 
          userEmail="test@example.com" 
          userName="Test User" 
        />
      );

      // Check for refresh button
      expect(screen.getByLabelText('Refresh inbox')).toBeInTheDocument();
      
      // Check for sign out button
      const signOutButton = screen.getByRole('button', { name: /Sign Out/i });
      expect(signOutButton).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('renders loading skeleton', () => {
      render(<LoadingState />);

      // Check for loading message
      expect(screen.getByText('Analyzing your executive communications...')).toBeInTheDocument();
      
      // Check for skeleton elements
      const skeletons = screen.getAllByTestId(/skeleton/i);
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('displays empty inbox message', () => {
      render(<EmptyState />);

      expect(screen.getByText(/Executive Inbox Zero Achieved/i)).toBeInTheDocument();
      expect(screen.getByText(/Your communications are perfectly managed/i)).toBeInTheDocument();
    });
  });

  describe('ThreadCard', () => {
    const mockThread: GmailThread = {
      id: 'thread-1',
      subject: 'Q4 Financial Report',
      snippet: 'Please review the attached Q4 financial report for the board meeting...',
      participants: ['cfo@company.com', 'executive@company.com'],
      unreadCount: 2,
      lastActivity: new Date('2024-01-10T10:00:00'),
      hasAttachments: true,
      labels: ['INBOX', 'IMPORTANT'],
    };

    it('renders thread information correctly', () => {
      render(<ThreadCard thread={mockThread} />);

      // Check subject
      expect(screen.getByText('Q4 Financial Report')).toBeInTheDocument();
      
      // Check snippet
      expect(screen.getByText(/Please review the attached Q4 financial report/)).toBeInTheDocument();
      
      // Check participants
      expect(screen.getByText(/cfo@company.com/)).toBeInTheDocument();
    });

    it('displays unread count when present', () => {
      render(<ThreadCard thread={mockThread} />);
      
      // Check for unread indicator
      const unreadBadge = screen.getByText('2');
      expect(unreadBadge).toBeInTheDocument();
    });

    it('shows attachment indicator when attachments exist', () => {
      render(<ThreadCard thread={mockThread} />);
      
      // Check for attachment icon
      expect(screen.getByText('Paperclip Icon')).toBeInTheDocument();
    });
  });

  describe('ThreadList', () => {
    it('renders multiple threads', async () => {
      const mockThreads = [
        {
          id: 'thread-1',
          subject: 'Q4 Financial Report',
          snippet: 'Please review the attached Q4 financial report...',
          participants: ['cfo@company.com'],
          unreadCount: 1,
          lastActivity: new Date(),
          hasAttachments: true,
          labels: ['INBOX'],
        },
        {
          id: 'thread-2',
          subject: 'Board Meeting Tomorrow',
          snippet: 'Reminder: Board meeting tomorrow at 2 PM...',
          participants: ['board@company.com'],
          unreadCount: 0,
          lastActivity: new Date(),
          hasAttachments: false,
          labels: ['INBOX'],
        },
      ];

      render(<ThreadList threads={mockThreads} />);

      await waitFor(() => {
        expect(screen.getByText('Q4 Financial Report')).toBeInTheDocument();
        expect(screen.getByText('Board Meeting Tomorrow')).toBeInTheDocument();
      });
    });

    it('shows empty state when no threads', () => {
      render(<ThreadList threads={[]} />);
      
      expect(screen.getByText(/Executive Inbox Zero Achieved/i)).toBeInTheDocument();
    });
  });
});