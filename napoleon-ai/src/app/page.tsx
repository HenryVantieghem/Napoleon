'use client'
import { motion } from 'framer-motion'
import { 
  Shield, 
  ArrowRight, 
  Check,
  Star,
  Crown,
  Sparkles,
  Lock,
  Cpu
} from 'lucide-react'
import ClerkAuthButton from '@/components/auth/ClerkAuthButton'
import { ParticleBackground, FloatingElements, LuxuryGradientBackground } from '@/components/ui/particle-background'

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
      icon: Crown,
      title: 'Executive Intelligence',
      description: 'AI-powered analysis that identifies C-level communications and executive priorities with military-grade precision.',
      gradient: 'from-yellow-400 to-yellow-600'
    },
    {
      icon: Cpu,
      title: 'Neural Prioritization',
      description: 'Advanced machine learning algorithms automatically surface mission-critical communications before they become urgent.',
      gradient: 'from-blue-400 to-purple-600'
    },
    {
      icon: Lock,
      title: 'Fort Knox Security',
      description: 'Zero-knowledge architecture with end-to-end encryption. Your data never touches our servers, ever.',
      gradient: 'from-green-400 to-teal-600'
    },
    {
      icon: Sparkles,
      title: 'Luxury Experience',
      description: 'Handcrafted interface designed for Fortune 500 executives who demand perfection in every interaction.',
      gradient: 'from-purple-400 to-pink-600'
    }
  ]

  const benefits = [
    'Reclaim 3+ hours daily for strategic work',
    'Never miss board-level communications',
    'AI-generated executive summaries in seconds',
    'Automatic VIP and investor prioritization',
    'Military-grade security with OAuth 2.0',
    'White-glove onboarding in under 60 seconds'
  ]

  const testimonials = [
    {
      quote: "Napoleon AI has transformed how I manage communications. It's like having a world-class EA for my inbox.",
      author: "Sarah Chen",
      title: "CEO, TechVentures",
      company: "Fortune 500"
    },
    {
      quote: "The AI prioritization is uncanny. It surfaces exactly what I need to see, when I need to see it.",
      author: "Marcus Rodriguez", 
      title: "Managing Partner",
      company: "Goldman Sachs"
    },
    {
      quote: "Finally, an email client that understands the executive mindset. Worth every penny.",
      author: "Dr. Amanda Foster",
      title: "Chief Innovation Officer",
      company: "Microsoft"
    }
  ]

  return (
    <div className="min-h-screen bg-luxury-black text-luxury overflow-x-hidden">
      {/* Luxury Background Effects */}
      <LuxuryGradientBackground />
      <ParticleBackground particleCount={80} />
      <FloatingElements />
      
      {/* Navigation */}
      <nav className="glass-card-elevated border-0 sticky top-0 z-50 backdrop-blur-premium">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-10 h-10 gradient-luxury rounded-2xl flex items-center justify-center shadow-glass-lg">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-luxury-display text-2xl font-bold">Napoleon AI</span>
                <div className="text-luxury-caption">Executive Intelligence</div>
              </div>
            </motion.div>
            
            <motion.div 
              className="hidden md:flex items-center gap-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <a href="#features" className="text-elegant hover:text-luxury transition-all duration-300 hover:scale-105">
                Intelligence
              </a>
              <a href="#testimonials" className="text-elegant hover:text-luxury transition-all duration-300 hover:scale-105">
                Executives
              </a>
              <a href="#security" className="text-elegant hover:text-luxury transition-all duration-300 hover:scale-105">
                Security
              </a>
              <div className="btn-luxury-secondary py-2 px-4 text-sm">
                <Lock className="w-4 h-4" />
                Enterprise
              </div>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Luxury Hero Section */}
      <section className="relative py-32 md:py-40 min-h-screen flex items-center">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Premium Status Badge */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-3 glass-card px-6 py-3 rounded-full border-luxury mb-12 animate-luxury-glow"
            >
              <div className="w-3 h-3 gradient-gold rounded-full animate-pulse" />
              <span className="text-luxury-caption text-luxury">Trusted by Fortune 500 CEOs</span>
              <Crown className="w-4 h-4 text-luxury-gold" />
            </motion.div>

            {/* Luxury Main Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-6xl md:text-8xl font-bold mb-8 leading-tight font-display"
            >
              <span className="text-luxury-display">Transform</span>
              <br />
              <span className="bg-gradient-to-r from-luxury-indigo via-luxury-indigo-light to-luxury-gold bg-clip-text text-transparent">
                Executive
              </span>
              <br />
              <span className="text-luxury-display">Communications</span>
            </motion.h1>

            {/* Premium Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="text-2xl md:text-3xl text-elegant mb-16 max-w-4xl mx-auto leading-relaxed font-light"
            >
              Military-grade AI transforms email chaos into executive clarity. 
              <span className="text-luxury-gold font-medium"> Designed exclusively for Fortune 500 leaders.</span>
            </motion.p>

            {/* Luxury CTA Section */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20"
            >
              <ClerkAuthButton 
                variant="primary" 
                size="lg" 
                className="btn-luxury-primary text-lg px-12 py-4 animate-luxury-glow"
              >
                Begin Executive Experience
              </ClerkAuthButton>
              
              <button className="btn-luxury-secondary text-lg px-8 py-4 group">
                <Sparkles className="w-5 h-5" />
                Private Demo
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
              </button>
            </motion.div>

            {/* Executive Social Proof */}
            <motion.div
              variants={fadeInUp}
              className="glass-panel p-8 max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-luxury-gold" />
                    <span className="text-3xl font-bold text-luxury">2,000+</span>
                  </div>
                  <p className="text-elegant">Fortune 500 Executives</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-luxury-gold" />
                    <span className="text-3xl font-bold text-luxury">4.9/5</span>
                  </div>
                  <p className="text-elegant">Executive Satisfaction</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-luxury-gold" />
                    <span className="text-3xl font-bold text-luxury">SOC 2</span>
                  </div>
                  <p className="text-elegant">Enterprise Certified</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Luxury Features Section */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-luxury-headline mb-6">
              Executive-Grade Intelligence Platform
            </h2>
            <p className="text-luxury-body max-w-3xl mx-auto">
              Each capability meticulously crafted for Fortune 500 decision-makers who demand 
              <span className="text-luxury-gold"> perfection in every interaction.</span>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="glass-card p-8 group hover:glass-card-elevated transition-all duration-500 animate-luxury-float"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-3xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-glass-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-luxury-headline text-2xl mb-4">{feature.title}</h3>
                    <p className="text-elegant leading-relaxed text-lg">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Executive Testimonials Section */}
      <section id="testimonials" className="py-32 relative">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-luxury-headline mb-6">
              Trusted by Global Leaders
            </h2>
            <p className="text-luxury-body max-w-3xl mx-auto">
              Fortune 500 CEOs and industry titans trust Napoleon AI to transform their 
              <span className="text-luxury-gold"> most critical communications.</span>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="glass-card p-8 text-center group hover:glass-card-elevated transition-all duration-500 animate-luxury-float"
                style={{ animationDelay: `${index * 0.3}s` }}
              >
                <div className="mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-luxury-gold inline-block mx-1 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-elegant text-lg mb-8 leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                
                <div className="border-t border-elegant pt-6">
                  <div className="text-luxury font-semibold text-lg mb-1">
                    {testimonial.author}
                  </div>
                  <div className="text-subtle text-sm mb-1">
                    {testimonial.title}
                  </div>
                  <div className="text-luxury-gold text-sm font-medium">
                    {testimonial.company}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Executive Benefits Showcase */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-luxury-headline mb-8">
                Executive Advantage
              </h2>
              <p className="text-luxury-body mb-12">
                Join the elite circle of executives who have already revolutionized their 
                communication workflows with military-grade AI intelligence.
              </p>
              
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-8 h-8 gradient-gold rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Check className="w-4 h-4 text-luxury-black font-bold" />
                    </div>
                    <span className="text-luxury text-lg font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="glass-panel relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-luxury-indigo/10 to-luxury-gold/10" />
                
                <div className="relative space-y-6">
                  {/* Executive Email Preview */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 gradient-gold rounded-full flex items-center justify-center">
                      <Crown className="w-6 h-6 text-luxury-black" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-luxury">Board Strategy Session</div>
                        <div className="bg-luxury-gold/20 text-luxury-gold px-3 py-1 rounded-full text-xs font-medium">
                          EXECUTIVE
                        </div>
                      </div>
                      <div className="text-subtle text-sm mb-3">From: chairman@boardroom.com</div>
                      
                      <div className="glass-card p-4 space-y-3">
                        <div className="text-elegant text-sm">
                          <span className="text-luxury-indigo font-medium">AI Executive Summary:</span> 
                          Confidential board strategy session moved to executive suite. Q4 acquisition 
                          proposal requires immediate C-level review.
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <span className="bg-luxury-gold/20 text-luxury-gold px-3 py-1 rounded-full text-xs">Priority 1</span>
                          <span className="bg-luxury-indigo/20 text-luxury-indigo px-3 py-1 rounded-full text-xs">Board Level</span>
                          <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">Action Required</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Executive CTA Section */}
      <section className="py-40 relative">
        <div className="container mx-auto px-6">
          <motion.div 
            className="glass-panel p-16 text-center max-w-5xl mx-auto relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Luxury background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-luxury-indigo/20 via-luxury-gold/10 to-luxury-indigo-light/20" />
            
            <div className="relative">
              <motion.div
                className="w-20 h-20 gradient-gold rounded-full flex items-center justify-center mx-auto mb-8 animate-luxury-glow"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Crown className="w-10 h-10 text-luxury-black" />
              </motion.div>
              
              <h2 className="text-luxury-display text-5xl md:text-6xl mb-8">
                Join the Elite
              </h2>
              
              <p className="text-luxury-body text-2xl mb-12 max-w-3xl mx-auto">
                Transform your executive communications with military-grade AI intelligence. 
                <span className="text-luxury-gold font-medium"> Reserved for Fortune 500 decision-makers.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
                <ClerkAuthButton 
                  variant="primary" 
                  size="lg" 
                  className="btn-luxury-gold text-xl px-16 py-6 animate-luxury-glow"
                >
                  Begin Executive Access
                </ClerkAuthButton>
                
                <button className="btn-luxury-secondary text-xl px-12 py-6 group">
                  <Sparkles className="w-6 h-6" />
                  White-Glove Demo
                  <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-8 text-elegant">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-luxury-gold" />
                  <span>60-Second Setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-luxury-gold" />
                  <span>Military-Grade Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-luxury-gold" />
                  <span>Executive Priority</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Luxury Footer */}
      <footer className="relative py-20">
        <div className="container mx-auto px-6">
          <div className="glass-card p-12">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <motion.div 
                className="flex items-center gap-4 mb-6 md:mb-0"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-12 h-12 gradient-luxury rounded-2xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-luxury-display text-2xl font-bold">Napoleon AI</span>
                  <div className="text-luxury-caption">Executive Intelligence Platform</div>
                </div>
              </motion.div>
              
              <div className="flex items-center gap-8 text-elegant">
                <a href="/privacy" className="hover:text-luxury transition-all duration-300 hover:scale-105">
                  Privacy Policy
                </a>
                <a href="/terms" className="hover:text-luxury transition-all duration-300 hover:scale-105">
                  Terms of Service
                </a>
                <a href="/enterprise" className="hover:text-luxury transition-all duration-300 hover:scale-105">
                  Enterprise
                </a>
                <a href="/support" className="btn-luxury-secondary py-2 px-4 text-sm">
                  <Crown className="w-4 h-4" />
                  Executive Support
                </a>
              </div>
            </div>
            
            <div className="border-t border-elegant pt-8 flex flex-col md:flex-row items-center justify-between">
              <div className="text-subtle text-sm mb-4 md:mb-0">
                © 2024 Napoleon AI. Crafted for executive excellence.
              </div>
              
              <div className="flex items-center gap-6 text-subtle text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-luxury-gold" />
                  <span>SOC 2 Type II Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-luxury-gold" />
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