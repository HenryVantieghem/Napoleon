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

// Mock Supabase client
jest.mock('@/lib/supabase-client', () => ({
  createClientSupabase: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: { email: 'executive@company.com', user_metadata: { name: 'John Executive' } },
            provider_token: 'mock-token',
          },
        },
      }),
      signOut: jest.fn(),
    },
  }),
}));

// Mock Gmail Client
jest.mock('@/lib/gmail-client', () => {
  return jest.fn().mockImplementation(() => ({
    fetchLatestThreads: jest.fn(),
  }));
});

describe('Executive Gmail Dashboard', () => {
  const mockThreads: GmailThread[] = [
    {
      id: 'thread_1',
      subject: 'Q4 Revenue Report - Action Required',
      snippet: 'Please review the attached quarterly revenue report and provide your feedback by EOD...',
      participants: ['cfo@company.com', 'executive@company.com'],
      unreadCount: 1,
      lastActivity: new Date('2024-01-15T10:00:00'),
      hasAttachments: true,
      labels: ['INBOX', 'IMPORTANT', 'UNREAD'],
    },
    {
      id: 'thread_2',
      subject: 'Board Meeting Minutes - January 2024',
      snippet: 'Attached are the minutes from yesterday\'s board meeting. Key decisions include...',
      participants: ['board@company.com', 'executive@company.com', 'ceo@company.com'],
      unreadCount: 0,
      lastActivity: new Date('2024-01-14T15:30:00'),
      hasAttachments: true,
      labels: ['INBOX', 'IMPORTANT'],
    },
    {
      id: 'thread_3',
      subject: 'Strategic Partnership Proposal',
      snippet: 'Following our discussion last week, I\'m pleased to present our partnership proposal...',
      participants: ['partner@external.com', 'executive@company.com'],
      unreadCount: 0,
      lastActivity: new Date('2024-01-13T09:15:00'),
      hasAttachments: false,
      labels: ['INBOX'],
    },
  ];

  describe('Dashboard Component', () => {
    it('should render dashboard with all core components', async () => {
      const GmailClient = require('@/lib/gmail-client');
      GmailClient.mockImplementation(() => ({
        fetchLatestThreads: jest.fn().mockResolvedValue(mockThreads),
      }));

      await act(async () => {
        render(<Dashboard />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
        expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
        expect(screen.getByTestId('thread-list')).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 15000);

    it('should display loading state initially', async () => {
      const GmailClient = require('@/lib/gmail-client');
      GmailClient.mockImplementation(() => ({
        fetchLatestThreads: jest.fn().mockImplementation(() => new Promise(() => {})),
      }));

      await act(async () => {
        render(<Dashboard />);
      });
      
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.getByText(/Loading your executive inbox/i)).toBeInTheDocument();
    });

    it('should display empty state when no threads', async () => {
      const GmailClient = require('@/lib/gmail-client');
      GmailClient.mockImplementation(() => ({
        fetchLatestThreads: jest.fn().mockResolvedValue([]),
      }));

      await act(async () => {
        render(<Dashboard />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        expect(screen.getByText(/Your inbox is clear/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 15000);

    it('should handle network errors gracefully', async () => {
      const GmailClient = require('@/lib/gmail-client');
      GmailClient.mockImplementation(() => ({
        fetchLatestThreads: jest.fn().mockRejectedValue(new Error('Network error')),
      }));

      await act(async () => {
        render(<Dashboard />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument();
        expect(screen.getByText(/Unable to load your emails/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 15000);
  });

  describe('DashboardHeader Component', () => {
    it('should display Napoleon AI branding', () => {
      render(<DashboardHeader userEmail="executive@company.com" userName="John Executive" />);
      
      expect(screen.getByText(/Napoleon AI/i)).toBeInTheDocument();
      expect(screen.getByTestId('napoleon-logo')).toHaveClass('bg-accent-gold');
    });

    it('should display user information', () => {
      render(<DashboardHeader userEmail="executive@company.com" userName="John Executive" />);
      
      expect(screen.getByText('John Executive')).toBeInTheDocument();
      expect(screen.getByText('executive@company.com')).toBeInTheDocument();
    });

    it('should have sign out button', () => {
      render(<DashboardHeader userEmail="executive@company.com" userName="John Executive" />);
      
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      expect(signOutButton).toBeInTheDocument();
      expect(signOutButton).toHaveClass('hover:bg-accent-gold/10');
    });
  });

  describe('ThreadList Component', () => {
    it('should render all threads as luxury cards', () => {
      render(<ThreadList threads={mockThreads} />);
      
      const threadCards = screen.getAllByTestId(/^thread-card-/);
      expect(threadCards).toHaveLength(3);
      
      threadCards.forEach(card => {
        expect(card).toHaveClass('napoleon-thread-card');
      });
    });

    it('should apply responsive grid layout', () => {
      render(<ThreadList threads={mockThreads} />);
      
      const container = screen.getByTestId('thread-list');
      expect(container).toHaveClass('grid');
      expect(container).toHaveClass('grid-cols-1');
      expect(container).toHaveClass('md:grid-cols-2');
      expect(container).toHaveClass('xl:grid-cols-3');
    });

    it('should maintain visual hierarchy with proper spacing', () => {
      render(<ThreadList threads={mockThreads} />);
      
      const container = screen.getByTestId('thread-list');
      expect(container).toHaveClass('gap-6');
    });
  });

  describe('ThreadCard Component', () => {
    const unreadThread = mockThreads[0];
    const readThread = mockThreads[1];

    it('should render thread with glassmorphic styling', () => {
      render(<ThreadCard thread={readThread} />);
      
      const card = screen.getByTestId(`thread-card-${readThread.id}`);
      expect(card).toHaveClass('backdrop-blur-xl');
      expect(card).toHaveClass('bg-white/5');
      expect(card).toHaveClass('border-white/10');
      expect(card).toHaveClass('rounded-2xl');
    });

    it('should highlight unread threads with gold accent', () => {
      render(<ThreadCard thread={unreadThread} />);
      
      const card = screen.getByTestId(`thread-card-${unreadThread.id}`);
      expect(card).toHaveClass('napoleon-thread-unread');
      expect(card).toHaveClass('border-l-accent-gold');
    });

    it('should display subject in elegant serif font', () => {
      render(<ThreadCard thread={readThread} />);
      
      const subject = screen.getByText(readThread.subject);
      expect(subject).toHaveClass('font-serif');
      expect(subject).toHaveClass('text-warm-ivory');
    });

    it('should display snippet in refined sans-serif', () => {
      render(<ThreadCard thread={readThread} />);
      
      const snippet = screen.getByText(readThread.snippet);
      expect(snippet).toHaveClass('font-sans');
      expect(snippet).toHaveClass('text-neutral-silver');
    });

    it('should show participant count', () => {
      render(<ThreadCard thread={readThread} />);
      
      expect(screen.getByText(`${readThread.participants.length} participants`)).toBeInTheDocument();
    });

    it('should indicate attachments with icon', () => {
      render(<ThreadCard thread={unreadThread} />);
      
      expect(screen.getByTestId('attachment-icon')).toBeInTheDocument();
      expect(screen.getByTestId('attachment-icon')).toHaveClass('text-accent-gold');
    });

    it('should format timestamp elegantly', () => {
      render(<ThreadCard thread={readThread} />);
      
      // Should show relative time for recent emails
      expect(screen.getByText(/Jan 14/i)).toBeInTheDocument();
    });

    it('should have hover effect with elevation', () => {
      render(<ThreadCard thread={readThread} />);
      
      const card = screen.getByTestId(`thread-card-${readThread.id}`);
      expect(card).toHaveClass('hover:-translate-y-1');
      expect(card).toHaveClass('hover:shadow-2xl');
    });

    it('should be keyboard accessible', () => {
      render(<ThreadCard thread={readThread} />);
      
      const card = screen.getByTestId(`thread-card-${readThread.id}`);
      expect(card).toHaveAttribute('tabIndex', '0');
      expect(card).toHaveAttribute('role', 'article');
      expect(card).toHaveAttribute('aria-label', expect.stringContaining(readThread.subject));
    });
  });

  describe('LoadingState Component', () => {
    it('should display luxury spinner with gold accent', () => {
      render(<LoadingState />);
      
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('border-t-accent-gold');
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should show executive-friendly loading message', () => {
      render(<LoadingState />);
      
      expect(screen.getByText(/Loading your executive inbox/i)).toBeInTheDocument();
      expect(screen.getByText(/Organizing your priorities/i)).toBeInTheDocument();
    });

    it('should have Napoleon-branded animation', () => {
      render(<LoadingState />);
      
      const container = screen.getByTestId('loading-state');
      expect(container).toHaveClass('animate-fadeIn');
    });
  });

  describe('EmptyState Component', () => {
    it('should display executive-appropriate empty message', () => {
      render(<EmptyState />);
      
      expect(screen.getByText(/Your inbox is clear/i)).toBeInTheDocument();
      expect(screen.getByText(/All communications have been processed/i)).toBeInTheDocument();
    });

    it('should show Napoleon AI icon', () => {
      render(<EmptyState />);
      
      const icon = screen.getByTestId('empty-state-icon');
      expect(icon).toBeInTheDocument();
      // Check that the SVG inside has the gold color
      const svg = icon.querySelector('svg');
      expect(svg).toHaveClass('text-accent-gold');
    });

    it('should maintain luxury styling', () => {
      render(<EmptyState />);
      
      const container = screen.getByTestId('empty-state');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt to mobile viewport', () => {
      global.innerWidth = 375;
      render(<ThreadList threads={mockThreads} />);
      
      const container = screen.getByTestId('thread-list');
      expect(container).toHaveClass('grid-cols-1');
    });

    it('should adapt to tablet viewport', () => {
      global.innerWidth = 768;
      render(<ThreadList threads={mockThreads} />);
      
      const container = screen.getByTestId('thread-list');
      expect(container).toHaveClass('md:grid-cols-2');
    });

    it('should adapt to desktop viewport', () => {
      global.innerWidth = 1440;
      render(<ThreadList threads={mockThreads} />);
      
      const container = screen.getByTestId('thread-list');
      expect(container).toHaveClass('xl:grid-cols-3');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ThreadList threads={mockThreads} />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByLabelText(/email threads/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<ThreadCard thread={mockThreads[0]} />);
      
      const card = screen.getByTestId(`thread-card-${mockThreads[0].id}`);
      card.focus();
      expect(document.activeElement).toBe(card);
    });

    it('should announce unread status to screen readers', () => {
      render(<ThreadCard thread={mockThreads[0]} />);
      
      // Check that the unread indicator has proper aria-label
      const unreadIndicator = screen.getByLabelText('Unread message');
      expect(unreadIndicator).toBeInTheDocument();
    });
  });
});