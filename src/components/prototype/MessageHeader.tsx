'use client';

interface MessageHeaderProps {
  totalMessages: number;
  gmailCount: number;
  slackCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function MessageHeader({ 
  totalMessages, 
  gmailCount, 
  slackCount, 
  onRefresh,
  isRefreshing 
}: MessageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Napoleon AI - Unified Inbox
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {totalMessages} messages from the last 7 days
            {gmailCount > 0 && ` • ${gmailCount} Gmail`}
            {slackCount > 0 && ` • ${slackCount} Slack`}
          </p>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}