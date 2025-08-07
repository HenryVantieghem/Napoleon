'use client'

import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Brain, Mail, MessageCircle, Zap, ArrowRight, Loader2 } from "lucide-react"

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Redirect authenticated users to prototype
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setIsRedirecting(true)
      router.push('/prototype')
    }
  }, [isLoaded, isSignedIn, router])

  // Loading state while checking auth or redirecting
  if (!isLoaded || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading Napoleon AI...</p>
        </div>
      </div>
    )
  }

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-8 shadow-2xl">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Napoleon AI
          </h1>
          <p className="text-2xl text-blue-100 mb-8">
            Streaming Message Intelligence
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4 shadow-lg">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Gmail integration</h3>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4 shadow-lg">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Slack integration</h3>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4 shadow-lg">
              <Brain className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart prioritization</h3>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4 shadow-lg">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Real-time streaming</h3>
          </div>
        </div>

        {/* Call to Action - THIS IS THE CRITICAL MISSING PIECE */}
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto shadow-2xl border border-white/20">
            <p className="text-xl mb-6">Ready to access your streaming message dashboard?</p>
            <Button 
              onClick={() => router.push('/sign-in')}
              size="lg" 
              className="w-full bg-white text-blue-700 hover:bg-blue-50 font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Start Streaming Messages
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-blue-200 mt-4">
              Secure authentication with Gmail & Slack integration
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}