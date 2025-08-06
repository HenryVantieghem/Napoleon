'use client';

import { Crown, RefreshCw } from 'lucide-react';

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
    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-4 sm:px-6 py-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <Crown className="w-6 h-6 text-yellow-300" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Napoleon AI Executive Intelligence
            </h1>
          </div>
          <p className="text-sm text-indigo-100">
            {totalMessages} priority-classified messages from the last 7 days
            {gmailCount > 0 && ` • ${gmailCount} Gmail`}
            {slackCount > 0 && ` • ${slackCount} Slack`}
          </p>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/20 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-w-[120px]"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}