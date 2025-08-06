'use client';

import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Mail, Clock } from 'lucide-react';
import type { UnifiedMessage } from '@/types/message';

interface PriorityMessageProps {
  message: UnifiedMessage;
}

export function PriorityMessage({ message }: PriorityMessageProps) {
  const isHighPriority = message.priority === 'high';
  
  return (
    <div className={`rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${
      isHighPriority 
        ? 'bg-red-50 border-2 border-red-200 hover:border-red-300' 
        : 'bg-white border border-gray-200 hover:border-gray-300'
    }`}>
      {/* Priority Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div className="flex items-center gap-3">
          {/* Priority Icon and Badge */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
            isHighPriority 
              ? 'bg-red-100 text-red-800' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {isHighPriority ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                HIGH
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                NORMAL
              </>
            )}
          </div>
          
          {/* Source Badge */}
          <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
            message.source === 'gmail' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-purple-100 text-purple-800'
          }`}>
            {message.source}
          </span>
        </div>
        
        {/* Timestamp */}
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </div>
      </div>
      
      {/* Message Content */}
      <div className="space-y-3">
        {/* Subject */}
        <h3 className={`font-semibold leading-tight ${
          isHighPriority ? 'text-red-900' : 'text-gray-900'
        }`}>
          {message.subject || '(No subject)'}
        </h3>
        
        {/* From */}
        <p className="text-sm font-medium text-gray-700">
          From: {message.from}
        </p>
        
        {/* Snippet */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
          {message.snippet}
        </p>
        
        {/* Priority Reason */}
        {isHighPriority && message.priorityReason && (
          <div className="flex items-center gap-2 text-xs text-red-700 bg-red-100 px-3 py-2 rounded-md">
            <AlertTriangle className="w-3 h-3" />
            <span>{message.priorityReason}</span>
          </div>
        )}
      </div>
    </div>
  );
}