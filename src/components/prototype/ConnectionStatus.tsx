'use client';

import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { GmailConnect } from '@/components/oauth/GmailConnect';
import { SlackConnect } from '@/components/oauth/SlackConnect';

interface ConnectionStatusProps {
  gmailConnected: boolean;
  slackConnected: boolean;
  onRefresh?: () => void;
}

export function ConnectionStatus({ 
  gmailConnected, 
  slackConnected, 
  onRefresh 
}: ConnectionStatusProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Executive Connection Center</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Gmail OAuth Component */}
        <GmailConnect 
          isConnected={gmailConnected}
          onRefresh={onRefresh}
        />
        
        {/* Slack OAuth Component */}
        <SlackConnect 
          isConnected={slackConnected}
          onRefresh={onRefresh}
        />
      </div>
      
      {/* Executive Status Summary */}
      <div className={`mt-4 p-3 rounded-lg border ${
        gmailConnected && slackConnected 
          ? 'border-green-200 bg-green-50' 
          : gmailConnected || slackConnected
            ? 'border-amber-200 bg-amber-50'
            : 'border-red-200 bg-red-50'
      }`}>
        <div className="flex items-center gap-2">
          {gmailConnected && slackConnected ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                ✅ All services connected - Ready for Fortune 500 executive intelligence
              </span>
            </>
          ) : gmailConnected || slackConnected ? (
            <>
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                ⚠️ Partial connectivity - Complete OAuth setup for full message access
              </span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                🚨 No services connected - Click buttons above to establish OAuth connections
              </span>
            </>
          )}
        </div>
        
        {/* Executive Instructions */}
        {!gmailConnected || !slackConnected ? (
          <div className="mt-2 text-xs text-gray-600">
            <p>💡 <strong>Executive Setup:</strong> Both OAuth connections enable self-service access without IT support</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}