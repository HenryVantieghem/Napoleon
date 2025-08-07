import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Brain, Mail, MessageSquare, Zap, Shield, TrendingUp, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
  return (
    <>
      <SignedIn>
        {/* Redirect authenticated users directly to prototype */}
        {redirect('/prototype')}
      </SignedIn>
      
      <SignedOut>
        {/* Professional landing page with complete onboarding flow */}
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black">
          {/* Hero Section */}
          <div className="container mx-auto px-6 py-16">
            <div className="text-center space-y-12 max-w-6xl mx-auto">
              {/* Logo & Branding */}
              <div className="flex items-center justify-center gap-6">
                <div className="p-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl">
                  <Brain className="h-20 w-20 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    Napoleon AI
                  </h1>
                  <p className="text-3xl text-blue-200 mt-2">Enterprise Intelligence Platform</p>
                </div>
              </div>
              
              {/* Value Proposition */}
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-white max-w-4xl mx-auto leading-tight">
                  Transform Executive Communications into Strategic Clarity with 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"> Military-Grade AI Intelligence</span>
                </h2>
                <p className="text-xl text-blue-300 max-w-3xl mx-auto leading-relaxed">
                  Stream Gmail and Slack messages, automatically prioritize urgent communications, 
                  and never miss critical executive decisions again.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid md:grid-cols-3 gap-8 mt-16">
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="p-4 bg-blue-500/20 rounded-full w-fit mx-auto mb-6">
                      <Mail className="h-12 w-12 text-blue-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Smart Gmail Integration</h3>
                    <p className="text-blue-200">
                      Automatically stream and analyze Gmail messages from the past 7 days with intelligent prioritization.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="p-4 bg-purple-500/20 rounded-full w-fit mx-auto mb-6">
                      <MessageSquare className="h-12 w-12 text-purple-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Slack Intelligence</h3>
                    <p className="text-blue-200">
                      Monitor team communications and identify urgent discussions across all your Slack channels.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="p-4 bg-yellow-500/20 rounded-full w-fit mx-auto mb-6">
                      <Zap className="h-12 w-12 text-yellow-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Priority Detection</h3>
                    <p className="text-blue-200">
                      Messages containing "urgent" or questions are automatically elevated for immediate attention.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Call to Action */}
              <div className="space-y-8 mt-16">
                <Link href="/sign-in" className="inline-block">
                  <Button size="lg" className="px-16 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-2xl font-semibold rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105">
                    Start Streaming Messages
                  </Button>
                </Link>
                
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-blue-400 text-lg">
                    🔒 Secured by Clerk Social Connections • Enterprise-grade OAuth
                  </p>
                  <div className="flex items-center gap-8 text-sm text-blue-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Gmail Integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Slack Integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Real-time Streaming</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Smart Prioritization</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="container mx-auto px-6 py-16 border-t border-white/10">
            <div className="text-center space-y-12 max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-white">How Napoleon AI Works</h2>
              
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center space-y-4">
                  <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-fit mx-auto">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Sign In</h3>
                  <p className="text-blue-300">Create your account with enterprise-grade security</p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-fit mx-auto">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Connect</h3>
                  <p className="text-blue-300">Link your Gmail and Slack accounts securely</p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-fit mx-auto">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Stream</h3>
                  <p className="text-blue-300">Watch messages flow in real-time with smart filtering</p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-fit mx-auto">
                    <span className="text-3xl font-bold text-white">4</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Prioritize</h3>
                  <p className="text-blue-300">Focus on urgent messages and questions first</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="container mx-auto px-6 py-16 border-t border-white/10">
            <div className="text-center space-y-8">
              <h3 className="text-2xl font-bold text-white">Trusted by Fortune 500 Executives</h3>
              <div className="flex flex-wrap items-center justify-center gap-8 text-blue-300">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span>GDPR Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span>Enterprise Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>99.9% Uptime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  )
}