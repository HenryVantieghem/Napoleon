import { formatDistanceToNow } from 'date-fns';
import type { GmailThread } from '@/lib/types';

interface ThreadCardProps {
  thread: GmailThread;
}

export function ThreadCard({ thread }: ThreadCardProps) {
  const isUnread = thread.unreadCount > 0;
  const hasAttachments = thread.hasAttachments;
  const isImportant = thread.labels.includes('IMPORTANT');

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' })
      });
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <article
      className={`
        napoleon-thread-card
        relative p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl
        transition-all duration-300 ease-out cursor-pointer
        hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent-gold/10
        focus:outline-none focus:ring-2 focus:ring-accent-gold/50
        ${isUnread ? 'napoleon-thread-unread border-l-4 border-l-accent-gold shadow-lg shadow-accent-gold/5' : ''}
        ${isImportant ? 'ring-1 ring-accent-gold/20' : ''}
      `}
      data-testid={`thread-card-${thread.id}`}
      tabIndex={0}
      role="article"
      aria-label={`Email thread: ${thread.subject}. ${isUnread ? 'Unread. ' : ''}${thread.participants.length} participants.`}
    >
      {/* Header with metadata */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {/* Unread indicator */}
          {isUnread && (
            <div 
              className="w-2 h-2 bg-accent-gold rounded-full"
              aria-label="Unread message"
            />
          )}
          
          {/* Participant count */}
          <span className="text-xs text-neutral-silver">
            {thread.participants.length} participant{thread.participants.length !== 1 ? 's' : ''}
          </span>
          
          {/* Attachment indicator */}
          {hasAttachments && (
            <svg 
              className="w-4 h-4 text-accent-gold"
              data-testid="attachment-icon"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-label="Has attachments"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
        </div>

        {/* Timestamp */}
        <time 
          className="text-xs text-neutral-silver"
          dateTime={thread.lastActivity.toISOString()}
        >
          {formatTimestamp(thread.lastActivity)}
        </time>
      </div>

      {/* Subject line - elegant serif */}
      <h3 className="font-serif text-lg font-semibold text-warm-ivory mb-3 leading-tight">
        {truncateText(thread.subject, 60)}
      </h3>

      {/* Snippet - refined sans-serif */}
      <p className="font-sans text-sm text-neutral-silver leading-relaxed mb-4">
        {truncateText(thread.snippet, 120)}
      </p>

      {/* Footer with participants */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Primary participant */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-accent-gold/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-accent-gold">
                {thread.participants[0]?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-xs text-neutral-silver">
              {thread.participants[0]?.split('@')[0] || 'Unknown'}
            </span>
          </div>
          
          {/* Additional participants indicator */}
          {thread.participants.length > 1 && (
            <span className="text-xs text-neutral-silver">
              +{thread.participants.length - 1} more
            </span>
          )}
        </div>

        {/* Labels indicator */}
        {isImportant && (
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-accent-gold" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs text-accent-gold">Important</span>
          </div>
        )}
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent-gold/5 via-accent-gold/10 to-accent-gold/5"></div>
      </div>
    </article>
  );
}