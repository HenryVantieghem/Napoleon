import { ThreadCard } from './ThreadCard';
import type { GmailThread, ThreadWithPriority } from '@/lib/types';

interface ThreadListProps {
  threads: GmailThread[];
  priorityData?: ThreadWithPriority[];
}

export function ThreadList({ threads = [], priorityData }: ThreadListProps) {
  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      data-testid="thread-list"
      role="main"
      aria-label="Email threads"
    >
      {threads.map((thread) => {
        const priority = priorityData?.find(p => p.thread.id === thread.id);
        return (
          <ThreadCard 
            key={thread.id} 
            thread={thread} 
            priority={priority}
          />
        );
      })}
    </div>
  );
}