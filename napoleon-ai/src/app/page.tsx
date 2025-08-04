'use client'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Zap, 
  Shield, 
  Brain, 
  ArrowRight, 
  Check,
  Star,
  Users,
  TrendingUp 
} from 'lucide-react'
import GmailOAuthButton from '@/components/auth/GmailOAuthButton'

export default function Home() {

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'GPT-4 analyzes your emails and provides intelligent summaries with executive-level insights.'
    },
    {
      icon: TrendingUp,
      title: 'Smart Prioritization',
      description: '4-tier priority system with C-level participant detection and urgency analysis.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade OAuth 2.0 with read-only Gmail access and zero data storage.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process hundreds of emails in seconds with advanced caching and optimization.'
    }
  ]

  const benefits = [
    'Save 2+ hours daily on email management',
    'Never miss critical communications',
    'Get executive-level email summaries',
    'Automatic priority classification',
    'Secure Gmail integration',
    'Zero learning curve'
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-semibold">Napoleon AI</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#about" className="text-gray-400 hover:text-white transition-colors">
                About
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Status Badge */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-8"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Now available for Gmail
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Transform Email{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                Chaos
              </span>
              <br />
              Into Strategic{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-400 bg-clip-text text-transparent">
                Clarity
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Napoleon AI uses advanced AI to analyze, prioritize, and summarize your Gmail threads. 
              Get executive-level insights and never miss important communications again.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <GmailOAuthButton variant="primary" />
              
              <button className="btn-secondary group">
                Watch Demo
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center justify-center gap-8 text-gray-500 text-sm"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>500+ executives</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>SOC 2 compliant</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Executive Productivity
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Every feature designed to save time and improve decision-making for busy executives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="modern-card p-6 text-center group hover:border-blue-500/30"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Executives Choose Napoleon AI
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Join hundreds of C-level executives who have transformed their email workflow with AI-powered intelligence.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="glass-card p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Board Meeting Update</div>
                      <div className="text-xs text-gray-400">From: CEO@company.com</div>
                    </div>
                    <div className="ml-auto bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">
                      URGENT
                    </div>
                  </div>
                  
                  <div className="pl-11 space-y-2">
                    <div className="text-sm text-gray-300">
                      <span className="text-blue-400">AI Summary:</span> Critical board meeting rescheduled to tomorrow 9 AM. 
                      Quarterly results presentation required.
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">High Priority</span>
                      <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs">Action Required</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="glass-card p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Email Experience?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join the executives who have already revolutionized their email workflow with Napoleon AI.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GmailOAuthButton variant="primary" size="lg" />
              <button className="btn-secondary">
                Schedule Demo
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-6">
              Free to try • No credit card required • Setup in 2 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <Mail className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold">Napoleon AI</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              <a href="/support" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            © 2024 Napoleon AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}