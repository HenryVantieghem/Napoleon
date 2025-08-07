import { SignUp } from '@clerk/nextjs'
import { Brain } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <Link href="/" className="inline-flex items-center gap-4 group">
            <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl">
              <Brain className="h-12 w-12 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Napoleon AI
              </h1>
              <p className="text-blue-200 text-sm">Enterprise Intelligence Platform</p>
            </div>
          </Link>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Join Napoleon AI</h2>
            <p className="text-blue-300">
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
                card: "bg-white/90 backdrop-blur-sm shadow-2xl",
                headerTitle: "text-gray-900",
                headerSubtitle: "text-gray-600", 
                socialButtonsBlockButton: "border-2 hover:bg-gray-50 transition-all duration-200",
                dividerLine: "bg-gray-300",
                dividerText: "text-gray-500",
                formFieldInput: "border-2 focus:border-blue-500",
                formButtonPrimary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                footerActionLink: "text-blue-600 hover:text-blue-700"
              }
            }}
            redirectUrl="/prototype"
          />
        </div>

        {/* Value Props */}
        <div className="text-center space-y-6">
          <div className="text-sm text-blue-400">
            🚀 What you'll get with Napoleon AI:
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-blue-300">
            <div className="space-y-2">
              <div>📧 Gmail message streaming</div>
              <div>🔔 Urgent message alerts</div>
            </div>
            <div className="space-y-2">
              <div>💬 Slack channel monitoring</div>
              <div>❓ Question prioritization</div>
            </div>
          </div>
          <div className="text-xs text-blue-400">
            🔒 Enterprise security • SOC 2 compliant • 7-day message history
          </div>
        </div>
      </div>
    </div>
  )
}
