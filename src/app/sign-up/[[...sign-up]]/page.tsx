import { SignUp } from '@clerk/nextjs'
import { Brain } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <Link href="/" className="inline-flex items-center gap-4 group">
            <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 shadow-xl">
              <Brain className="h-12 w-12 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Napoleon AI
              </h1>
              <p className="text-gray-400 text-sm">Enterprise Intelligence Platform</p>
            </div>
          </Link>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Join Napoleon AI</h2>
            <p className="text-gray-400">
              Create your account and start streaming intelligent communications
            </p>
          </div>
        </div>

        {/* Clerk Sign-Up Component */}
        <div className="flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl rounded-2xl",
                headerTitle: "text-white",
                headerSubtitle: "text-gray-400", 
                socialButtonsBlockButton: "bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl",
                dividerLine: "bg-white/20",
                dividerText: "text-gray-400",
                formFieldInput: "bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl",
                formButtonPrimary: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl",
                footerActionLink: "text-purple-400 hover:text-purple-300"
              }
            }}
            redirectUrl="/prototype"
          />
        </div>

        {/* Value Props */}
        <div className="text-center space-y-6">
          <div className="text-sm text-purple-400">
            🚀 What you'll get with Napoleon AI:
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-300">
            <div className="space-y-2">
              <div>📧 Gmail message streaming</div>
              <div>🔔 Urgent message alerts</div>
            </div>
            <div className="space-y-2">
              <div>💬 Slack channel monitoring</div>
              <div>❓ Question prioritization</div>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            🔒 Enterprise security • SOC 2 compliant • 7-day message history
          </div>
        </div>
      </div>
    </div>
  )
}
