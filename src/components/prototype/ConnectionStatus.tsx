'use client';

import { CheckCircle, XCircle, ExternalLink, Mail, MessageSquare, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  gmailConnected: boolean;
  slackConnected: boolean;
  gmailAuthUrl?: string;
  onRefresh?: () => void;
}

export function ConnectionStatus({ 
  gmailConnected, 
  slackConnected, 
  gmailAuthUrl,
  onRefresh 
}: ConnectionStatusProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Gmail Connection Card */}
        <div className={`rounded-lg border-2 p-4 transition-colors ${
          gmailConnected 
            ? 'border-green-200 bg-green-50' 
            : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-red-600" />
              <span className="font-semibold text-gray-900">Gmail</span>
            </div>
            {gmailConnected ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
          </div>
          
          <p className={`text-sm mb-3 ${
            gmailConnected ? 'text-green-700' : 'text-red-700'
          }`}>
            {gmailConnected 
              ? 'Successfully connected. Messages are being synced.' 
              : 'Not connected. Click below to authorize Gmail access.'
            }
          </p>
          
          {!gmailConnected && gmailAuthUrl && (
            <a 
              href={gmailAuthUrl}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Connect Gmail
            </a>
          )}
          
          {gmailConnected && onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Refresh Messages
            </button>
          )}
        </div>
        
        {/* Slack Connection Card */}
        <div className={`rounded-lg border-2 p-4 transition-colors ${
          slackConnected 
            ? 'border-green-200 bg-green-50' 
            : 'border-amber-200 bg-amber-50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-purple-600" />
              <span className="font-semibold text-gray-900">Slack</span>
            </div>
            {slackConnected ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
          </div>
          
          <p className={`text-sm mb-3 ${
            slackConnected ? 'text-green-700' : 'text-amber-700'
          }`}>
            {slackConnected 
              ? 'Successfully connected. Workspace messages are being synced.' 
              : 'Connection requires environment configuration. Contact admin for setup.'
            }
          </p>
          
          {slackConnected && onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Refresh Messages
            </button>
          )}
          
          {!slackConnected && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 text-sm font-medium rounded-md">
              <AlertCircle className="w-4 h-4" />
              Admin Setup Required
            </div>
          )}
        </div>
      </div>
      
      {/* Overall Status */}
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
                All services connected - Ready for executive intelligence
              </span>
            </>
          ) : gmailConnected || slackConnected ? (
            <>
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                Partial connectivity - Some messages may not appear
              </span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                No services connected - Please establish connections to begin
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}