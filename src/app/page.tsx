'use client'

import { motion } from 'framer-motion'
import { 
  Shield, 
  ArrowRight, 
  Star,
  Crown,
  Sparkles,
  Lock,
  Play,
  ChevronDown
} from 'lucide-react'
import { ClerkAuthButton } from '@/components/auth'
import { OrbitalGlow } from '@/components/luxury-ui'
import { Starfield } from '@/components/luxury-ui'

export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  // Executive button handlers
  const handleWatchDemo = () => {
    window.open('https://calendly.com/napoleon-ai/demo', '_blank')
  }

  const handleWhiteGloveDemo = () => {
    window.open('https://calendly.com/napoleon-ai/white-glove-demo', '_blank')
  }

  const handleExecutiveSupport = () => {
    window.open('mailto:support@napoleon-ai.com?subject=Executive Support Request', '_blank')
  }

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  const features = [
    {
      icon: Crown,
      title: 'Executive Intelligence',
      description: 'AI-powered analysis that identifies C-level communications and executive priorities with military-grade precision.',
    },
    {
      icon: Sparkles,
      title: 'Neural Prioritization',
      description: 'Advanced machine learning algorithms automatically surface mission-critical communications before they become urgent.',
    },
    {
      icon: Lock,
      title: 'Fort Knox Security',
      description: 'Zero-knowledge architecture with end-to-end encryption. Your data never touches our servers, ever.',
    },
    {
      icon: Shield,
      title: 'Luxury Experience',
      description: 'Handcrafted interface designed for Fortune 500 executives who demand perfection in every interaction.',
    }
  ]

  const testimonials = [
    {
      quote: "Napoleon AI has transformed how I manage communications. It's like having a world-class EA for my inbox.",
      author: "Sarah Chen",
      title: "CEO, TechVentures"
    },
    {
      quote: "The AI prioritization is uncanny. It surfaces exactly what I need to see, when I need to see it.",
      author: "Marcus Rodriguez", 
      title: "Managing Partner, Goldman Sachs"
    },
    {
      quote: "Finally, an email client that understands the executive mindset. Worth every penny.",
      author: "Dr. Amanda Foster",
      title: "Chief Innovation Officer, Microsoft"
    }
  ]

  return (
    <div className="min-h-screen bg-imperial-dark text-white overflow-x-hidden relative">
      {/* Imperial Background Effects */}
      <Starfield starCount={150} className="imperial-starfield" />
      
      {/* Navigation */}
      <nav className="glass-nav fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-8 py-4 w-11/12 max-w-6xl">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <span className="text-napoleon text-2xl font-playfair font-bold italic">Napoleon</span>
          </motion.div>
          
          <motion.div 
            className="hidden md:flex items-center gap-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <a href="#features" className="text-luxury-body hover:text-white transition-all duration-300 font-crimson">
              Features
            </a>
            <a href="#testimonials" className="text-luxury-body hover:text-white transition-all duration-300 font-crimson">
              Testimonials
            </a>
            <a href="#pricing" className="text-luxury-body hover:text-white transition-all duration-300 font-crimson">
              Pricing
            </a>
            <a href="#contact" className="text-luxury-body hover:text-white transition-all duration-300 font-crimson">
              Contact
            </a>
            <ClerkAuthButton className="btn-luxury-primary font-inter text-sm px-6 py-2">
              Get started
            </ClerkAuthButton>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section - Orbital Centerpiece */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        {/* Central Orbital Glow Effect */}
        <OrbitalGlow size="lg" className="hero-orbital" />
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            {/* Feature Announcement */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-sm"
            >
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-luxury-body font-inter">Trusted by Fortune 500 executives</span>
            </motion.div>

            {/* Main Headline - Cartier Style Typography */}
            <motion.h1
              variants={fadeInUp}
              className="text-6xl md:text-8xl font-bold leading-tight"
            >
              <span className="text-napoleon font-playfair font-bold italic text-7xl md:text-9xl block mb-4 bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
                Napoleon AI
              </span>
              <span className="text-luxury-headline font-crimson text-4xl md:text-6xl block font-semibold">
                Transform communication chaos 
                <br />
                into strategic clarity
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="text-luxury-body font-inter text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
            >
              The future of executive email intelligence. Military-grade AI transforms your inbox 
              into a strategic command center.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
            >
              <button 
                onClick={handleWatchDemo}
                className="btn-luxury-outline flex items-center gap-3 text-lg px-8 py-4 font-inter font-medium hover:bg-white/10 transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
              
              <ClerkAuthButton 
                variant="primary" 
                size="lg" 
                className="btn-luxury-primary text-lg px-8 py-4 font-inter font-semibold"
              >
                Get started for free
              </ClerkAuthButton>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={fadeInUp}
              className="pt-16 flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-luxury-body font-inter"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Fortune 500 Approved</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-luxury-body" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-luxury-headline font-crimson text-4xl md:text-6xl mb-6 font-semibold">
              Executive-Grade Intelligence
            </h2>
            <p className="text-luxury-body font-inter text-xl max-w-3xl mx-auto">
              Every capability meticulously crafted for Fortune 500 decision-makers who demand 
              perfection in every interaction.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-8 will-change-transform hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-luxury-headline font-crimson text-2xl mb-4 font-semibold">{feature.title}</h3>
                    <p className="text-luxury-body font-inter leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-luxury-headline font-crimson text-4xl md:text-6xl mb-6 font-semibold">
              Trusted by Global Leaders
            </h2>
            <p className="text-luxury-body font-inter text-xl max-w-3xl mx-auto">
              Fortune 500 CEOs and industry titans trust Napoleon AI to transform their 
              most critical communications.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="glass-card p-8 text-center will-change-transform hover:scale-105 transition-transform duration-300"
              >
                <div className="mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 inline-block mx-1 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-luxury-body font-inter text-lg mb-8 leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                
                <div className="border-t border-white/10 pt-6">
                  <div className="text-white font-semibold text-lg mb-1 font-inter">
                    {testimonial.author}
                  </div>
                  <div className="text-luxury-body text-sm font-inter">
                    {testimonial.title}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative">
        <motion.div 
          className="glass-card p-16 text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-8"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ duration: 0.3 }}
          >
            <Crown className="w-8 h-8 text-white" />
          </motion.div>
          
          <h2 className="text-napoleon font-playfair font-bold italic text-5xl md:text-6xl mb-8 bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
            Join the Elite
          </h2>
          
          <p className="text-luxury-body font-inter text-xl mb-12 max-w-2xl mx-auto">
            Transform your executive communications with military-grade AI intelligence. 
            Reserved for Fortune 500 decision-makers.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <ClerkAuthButton 
              variant="primary" 
              size="lg" 
              className="btn-luxury-primary text-xl px-12 py-4 font-inter font-semibold"
            >
              Begin Executive Access
            </ClerkAuthButton>
            
            <button 
              onClick={handleWhiteGloveDemo}
              className="btn-luxury-outline text-xl px-12 py-4 flex items-center gap-3 font-inter font-medium hover:bg-white/10 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
              White-Glove Demo
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-luxury-body mt-12 text-sm font-inter">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>60-Second Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              <span>Military-Grade Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Executive Priority</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card p-12">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <motion.div 
                className="flex items-center gap-4 mb-6 md:mb-0"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-napoleon font-playfair font-bold italic text-xl bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">Napoleon AI</span>
                  <div className="text-luxury-body font-inter text-sm">Executive Intelligence Platform</div>
                </div>
              </motion.div>
              
              <div className="flex items-center gap-8 text-luxury-body font-inter">
                <a href="/privacy" className="hover:text-white transition-all duration-300">
                  Privacy Policy
                </a>
                <a href="/terms" className="hover:text-white transition-all duration-300">
                  Terms of Service
                </a>
                <a href="/enterprise" className="hover:text-white transition-all duration-300">
                  Enterprise
                </a>
                <button 
                  onClick={handleExecutiveSupport}
                  className="btn-luxury-outline py-2 px-4 text-sm flex items-center gap-2 hover:bg-white/10 transition-all duration-300"
                >
                  <Crown className="w-3 h-3" />
                  Executive Support
                </button>
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between">
              <div className="text-luxury-body font-inter text-sm mb-4 md:mb-0">
                © 2024 Napoleon AI. Crafted for executive excellence.
              </div>
              
              <div className="flex items-center gap-6 text-luxury-body font-inter text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-blue-400" />
                  <span>SOC 2 Type II Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-blue-400" />
                  <span>GDPR Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}