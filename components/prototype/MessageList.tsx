'use client';

import { formatDistanceToNow } from 'date-fns';
import type { MessageListProps } from '@/types/message';

export function MessageList({ messages, loading, error }: MessageListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No messages found in the last 7 days
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  message.source === 'gmail' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {message.source.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1">
                {message.subject || '(No subject)'}
              </h3>
              
              <p className="text-sm text-gray-600 mb-2">
                From: {message.from}
              </p>
              
              <p className="text-sm text-gray-700 line-clamp-2">
                {message.snippet}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}