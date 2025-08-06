'use client';

import { PriorityMessage } from './PriorityMessage';
import { AlertTriangle, Mail } from 'lucide-react';
import type { MessageListProps } from '@/types/message';

export function MessageList({ messages, loading, error }: MessageListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">Error:</span>
          {error}
        </div>
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
        <p className="text-gray-500">
          No messages found in the last 7 days. Check your Gmail and Slack connections.
        </p>
      </div>
    );
  }
  
  // Separate messages by priority
  const highPriorityMessages = messages.filter(msg => msg.priority === 'high');
  const normalPriorityMessages = messages.filter(msg => msg.priority === 'normal');
  
  return (
    <div className="space-y-6">
      {/* High Priority Messages */}
      {highPriorityMessages.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-red-200">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-800">
              High Priority ({highPriorityMessages.length})
            </h2>
          </div>
          <div className="space-y-4">
            {highPriorityMessages.map((message) => (
              <PriorityMessage key={message.id} message={message} />
            ))}
          </div>
        </div>
      )}
      
      {/* Normal Priority Messages */}
      {normalPriorityMessages.length > 0 && (
        <div>
          {highPriorityMessages.length > 0 && (
            <div className="my-8 border-t border-gray-300"></div>
          )}
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
            <Mail className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Normal Priority ({normalPriorityMessages.length})
            </h2>
          </div>
          <div className="space-y-4">
            {normalPriorityMessages.map((message) => (
              <PriorityMessage key={message.id} message={message} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}