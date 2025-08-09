'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Bug, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export function ApiDebugger() {
  const [debugResults, setDebugResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDebugTests = async () => {
    setLoading(true)
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    }

    // Test Gmail API
    try {
      console.log('Testing Gmail API...')
      const gmailResponse = await fetch('/api/clerk/gmail/messages')
      const gmailData = await gmailResponse.json()
      results.tests.gmail = {
        status: gmailResponse.status,
        ok: gmailResponse.ok,
        data: gmailData
      }
      console.log('Gmail API result:', gmailData)
    } catch (error) {
      results.tests.gmail = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Test Slack API
    try {
      console.log('Testing Slack API...')
      const slackResponse = await fetch('/api/clerk/slack/messages')
      const slackData = await slackResponse.json()
      results.tests.slack = {
        status: slackResponse.status,
        ok: slackResponse.ok,
        data: slackData
      }
      console.log('Slack API result:', slackData)
    } catch (error) {
      results.tests.slack = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Test debug endpoint
    try {
      console.log('Testing debug endpoint...')
      const debugResponse = await fetch('/api/debug/clerk')
      const debugData = await debugResponse.json()
      results.tests.debug = {
        status: debugResponse.status,
        ok: debugResponse.ok,
        data: debugData
      }
      console.log('Debug API result:', debugData)
    } catch (error) {
      results.tests.debug = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    setDebugResults(results)
    setLoading(false)
  }

  const getStatusIcon = (test: any) => {
    if (test.error) return <XCircle className="w-4 h-4 text-red-400" />
    if (test.ok) return <CheckCircle className="w-4 h-4 text-green-400" />
    return <AlertTriangle className="w-4 h-4 text-yellow-400" />
  }

  const getStatusBadge = (test: any) => {
    if (test.error) return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Error</Badge>
    if (test.ok) return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Success</Badge>
    return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Warning</Badge>
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bug className="w-5 h-5 text-blue-400" />
          <span>API Debugger</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runDebugTests}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Bug className="w-4 h-4 mr-2" />
              Run Debug Tests
            </>
          )}
        </Button>

        {debugResults && (
          <div className="space-y-4">
            <div className="text-sm text-gray-400">
              Last run: {new Date(debugResults.timestamp).toLocaleString()}
            </div>

            {/* Gmail Test */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(debugResults.tests.gmail)}
                  <span className="font-medium">Gmail API</span>
                </div>
                {getStatusBadge(debugResults.tests.gmail)}
              </div>
              <div className="text-sm text-gray-400">
                Status: {debugResults.tests.gmail.status || 'Error'}
              </div>
              {debugResults.tests.gmail.data && (
                <div className="mt-2 text-xs bg-black/20 p-2 rounded font-mono overflow-x-auto">
                  <pre>{JSON.stringify(debugResults.tests.gmail.data, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* Slack Test */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(debugResults.tests.slack)}
                  <span className="font-medium">Slack API</span>
                </div>
                {getStatusBadge(debugResults.tests.slack)}
              </div>
              <div className="text-sm text-gray-400">
                Status: {debugResults.tests.slack.status || 'Error'}
              </div>
              {debugResults.tests.slack.data && (
                <div className="mt-2 text-xs bg-black/20 p-2 rounded font-mono overflow-x-auto">
                  <pre>{JSON.stringify(debugResults.tests.slack.data, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* Debug Test */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(debugResults.tests.debug)}
                  <span className="font-medium">Debug API</span>
                </div>
                {getStatusBadge(debugResults.tests.debug)}
              </div>
              <div className="text-sm text-gray-400">
                Status: {debugResults.tests.debug.status || 'Error'}
              </div>
              {debugResults.tests.debug.data && (
                <div className="mt-2 text-xs bg-black/20 p-2 rounded font-mono overflow-x-auto">
                  <pre>{JSON.stringify(debugResults.tests.debug.data, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
