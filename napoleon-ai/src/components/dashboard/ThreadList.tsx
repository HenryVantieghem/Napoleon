import { ThreadCard } from './ThreadCard';
import type { GmailThread } from '@/lib/types';

interface ThreadListProps {
  threads: GmailThread[];
}

export function ThreadList({ threads }: ThreadListProps) {
  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      data-testid="thread-list"
      role="main"
      aria-label="Email threads"
    >
      {threads.map((thread) => (
        <ThreadCard key={thread.id} thread={thread} />
      ))}
    </div>
  );
}