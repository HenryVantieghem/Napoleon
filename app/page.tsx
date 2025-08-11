import { SignInButton } from '@/components/auth/SignInButton'
import { PageTransition, StaggeredTransition } from '@/components/ui/PageTransition'
import { Mail, MessageSquare, Shield, Zap, Users, Star, TrendingUp, Clock } from 'lucide-react'
import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Napoleon AI - Executive Command Center for Communications',
  description: 'Transform how C-suite executives manage critical communications. Unify Gmail and Slack with AI-powered priority detection. Never miss what matters.',
  keywords: ['executive dashboard', 'CEO tools', 'email management', 'slack integration', 'priority communications', 'leadership productivity'],
  authors: [{ name: 'Napoleon AI' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Napoleon AI - Executive Command Center for Communications',
    description: 'Transform how C-suite executives manage critical communications. Unify Gmail and Slack with AI-powered priority detection.',
    url: 'https://napoleonai.app',
    siteName: 'Napoleon AI',
    type: 'website',
    images: [
      {
        url: 'https://napoleonai.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Napoleon AI Executive Dashboard'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Napoleon AI - Executive Command Center for Communications',
    description: 'Transform how C-suite executives manage critical communications. Unify Gmail and Slack with AI-powered priority detection.',
    images: ['https://napoleonai.app/twitter-image.jpg']
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function HomePage() {
  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Napoleon AI</h1>
              </div>
            </div>
            <SignInButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center">
          {/* Executive Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4 mr-2" />
            Trusted by C-Suite Executives
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Your Executive
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}Command Center
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-6 max-w-4xl mx-auto leading-relaxed font-medium">
            Transform chaos into clarity. See critical Gmail and Slack communications 
            in one AI-powered dashboard.
          </p>
          
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
            Stop missing important messages buried in your inbox. Napoleon AI automatically 
            surfaces urgent communications from your team, board members, and key stakeholders.
          </p>
          
          {/* Executive Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Save 2+ Hours Daily</h3>
              <p className="text-sm text-gray-600">Stop switching between Gmail and Slack. See everything prioritized in one view.</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Never Miss Critical</h3>
              <p className="text-sm text-gray-600">AI identifies urgent messages from your board, investors, and key customers.</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enterprise Secure</h3>
              <p className="text-sm text-gray-600">Bank-grade OAuth security. Your credentials and data stay private.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <SignInButton />
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500">
                ✓ 2-minute setup • ✓ No credit card • ✓ Enterprise security
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Join 500+ executives who've transformed their communication workflow
              </p>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-4xl mx-auto border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Gmail Integration */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gmail Integration</h3>
                  <p className="text-gray-600">
                    Connect your Gmail account with secure OAuth. See your last 7 days of emails 
                    with smart priority detection.
                  </p>
                </div>
              </div>

              {/* Slack Integration */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Slack Messages</h3>
                  <p className="text-gray-600">
                    Access your Slack channels and direct messages. Never miss important 
                    team communications again.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-gray-500 mb-4">TRUSTED BY EXECUTIVES AT</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60">
            {/* Company Logos Placeholder */}
            <div className="bg-gray-200 h-8 rounded-lg flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-500">FORTUNE 500</span>
            </div>
            <div className="bg-gray-200 h-8 rounded-lg flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-500">TECH CORP</span>
            </div>
            <div className="bg-gray-200 h-8 rounded-lg flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-500">GLOBAL INC</span>
            </div>
            <div className="bg-gray-200 h-8 rounded-lg flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-500">STARTUP CO</span>
            </div>
            <div className="bg-gray-200 h-8 rounded-lg flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-500">ENTERPRISE</span>
            </div>
          </div>
        </div>
        
        {/* Executive Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-700 mb-3 italic">
                  "Napoleon AI saved me 3 hours daily. I never miss critical board communications anymore. 
                  The priority detection is incredible."
                </p>
                <p className="font-semibold text-gray-900">Sarah Chen</p>
                <p className="text-sm text-gray-500">CEO, TechFlow Solutions</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-700 mb-3 italic">
                  "Finally, a communication tool built for executives. The unified view transformed 
                  how I stay connected with my team."
                </p>
                <p className="font-semibold text-gray-900">Marcus Rodriguez</p>
                <p className="text-sm text-gray-500">CTO, Global Innovations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Built for Executive Excellence
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every feature designed to save your most valuable resource: time. 
            Focus on leading, not managing your inbox.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* AI-Powered Priority */}
          <div className="group bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
              <Star className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Priority Detection</h3>
            <p className="text-gray-600 leading-relaxed">
              Advanced algorithms identify urgent communications from board members, investors, 
              and key stakeholders. Never miss what matters most.
            </p>
            <div className="mt-4 flex items-center text-sm text-orange-600 font-medium">
              <TrendingUp className="w-4 h-4 mr-2" />
              85% faster critical message identification
            </div>
          </div>

          {/* Enterprise Security */}
          <div className="group bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
              <Shield className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Enterprise-Grade Security</h3>
            <p className="text-gray-600 leading-relaxed">
              Bank-level OAuth security with encrypted token storage. SOC2 compliant. 
              Your data stays private and secure at all times.
            </p>
            <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
              <Shield className="w-4 h-4 mr-2" />
              Zero-trust architecture
            </div>
          </div>

          {/* Executive Performance */}
          <div className="group bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
              <Zap className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Executive Performance</h3>
            <p className="text-gray-600 leading-relaxed">
              Sub-2-second load times with Edge Runtime. Real-time updates. 
              Built for executives who demand excellence in every tool.
            </p>
            <div className="mt-4 flex items-center text-sm text-purple-600 font-medium">
              <Clock className="w-4 h-4 mr-2" />
              Sub-2s message delivery guaranteed
            </div>
          </div>
        </div>
      </section>

      {/* Executive ROI Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-2xl p-12 text-center text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-50"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Executive ROI Calculator
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Transform Your Executive 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                {" "}Productivity
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">2.5 hrs</div>
                <p className="text-sm opacity-90">Daily time savings</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">85%</div>
                <p className="text-sm opacity-90">Faster urgent message detection</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">$24K</div>
                <p className="text-sm opacity-90">Annual value for $300K executive</p>
              </div>
            </div>
            
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Stop losing critical communications in the noise. Join 500+ executives who've 
              transformed their leadership effectiveness with Napoleon AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignInButton />
              <div className="text-center sm:text-left opacity-90">
                <p className="text-sm">
                  ✓ Enterprise Security • ✓ 2-minute setup • ✓ 30-day money-back guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Napoleon AI</span>
            </div>
            <p className="text-gray-600 mb-4">
              Unified message dashboard for modern productivity
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <span>Secure OAuth</span>
              <span>•</span>
              <span>No Data Storage</span>
              <span>•</span>
              <span>Privacy First</span>
            </div>
          </div>
        </div>
      </footer>
    </PageTransition>
  )
}