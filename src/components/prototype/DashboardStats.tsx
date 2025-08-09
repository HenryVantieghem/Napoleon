'use client';

import { AlertTriangle, Mail, Clock, TrendingUp } from 'lucide-react';
import type { UnifiedMessage } from '@/types/message';

interface DashboardStatsProps {
  messages: UnifiedMessage[];
  loading?: boolean;
}

export function DashboardStats({ messages, loading }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-8 w-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-1"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  
  const highPriorityCount = messages.filter(msg => msg.priority === 'high').length;
  const normalPriorityCount = messages.filter(msg => msg.priority === 'normal').length;
  const gmailCount = messages.filter(msg => msg.source === 'gmail').length;
  const slackCount = messages.filter(msg => msg.source === 'slack').length;
  
  const stats = [
    {
      icon: AlertTriangle,
      label: 'High Priority',
      value: highPriorityCount,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    {
      icon: Mail,
      label: 'Normal Priority',
      value: normalPriorityCount,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200'
    },
    {
      icon: Mail,
      label: 'Gmail',
      value: gmailCount,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    {
      icon: TrendingUp,
      label: 'Slack',
      value: slackCount,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className={`${stat.bg} ${stat.border} border rounded-lg p-4 transition-transform hover:scale-105`}
        >
          <div className="flex items-center justify-between mb-2">
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          
          <p className="text-sm font-medium text-gray-600 mb-1">
            {stat.label}
          </p>
          
          <p className={`text-2xl font-bold ${stat.color}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}