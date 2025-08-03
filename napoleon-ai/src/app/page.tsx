'use client';

import { motion } from 'framer-motion';
import { EnvelopeIcon, StarIcon, BoltIcon } from '@heroicons/react/24/outline';
import GmailOAuthButton from '@/components/auth/GmailOAuthButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-background via-primary-background to-slate-900">
      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-silver/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="inline-flex items-center rounded-full border border-accent-gold/20 bg-accent-gold/10 px-4 py-2 text-sm text-accent-gold">
                <BoltIcon className="w-4 h-4 mr-2" />
                AI-Powered Email Intelligence
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-warm-ivory mb-8"
            >
              Transform Email{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-neutral-silver">
                Chaos
              </span>{' '}
              <br />
              Into Strategic{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-silver to-accent-gold">
                Clarity
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl sm:text-2xl text-neutral-silver/80 max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              Napoleon AI analyzes your Gmail threads with military precision, 
              delivering intelligent summaries and priority scoring that transforms 
              how you command your communication.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-16"
            >
              <GmailOAuthButton />
            </motion.div>

            {/* Feature Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              <div className="text-center p-6 rounded-xl bg-warm-ivory/5 backdrop-blur-sm border border-neutral-silver/10">
                <div className="w-12 h-12 mx-auto mb-4 bg-accent-gold/20 rounded-full flex items-center justify-center">
                  <BoltIcon className="w-6 h-6 text-accent-gold" />
                </div>
                <h3 className="text-lg font-semibold text-warm-ivory mb-2">AI Analysis</h3>
                <p className="text-neutral-silver/70 text-sm">
                  Advanced GPT-4 powered summaries and priority scoring
                </p>
              </div>

              <div className="text-center p-6 rounded-xl bg-warm-ivory/5 backdrop-blur-sm border border-neutral-silver/10">
                <div className="w-12 h-12 mx-auto mb-4 bg-accent-gold/20 rounded-full flex items-center justify-center">
                  <StarIcon className="w-6 h-6 text-accent-gold" />
                </div>
                <h3 className="text-lg font-semibold text-warm-ivory mb-2">Smart Prioritization</h3>
                <p className="text-neutral-silver/70 text-sm">
                  Intelligent filtering and categorization of your messages
                </p>
              </div>

              <div className="text-center p-6 rounded-xl bg-warm-ivory/5 backdrop-blur-sm border border-neutral-silver/10">
                <div className="w-12 h-12 mx-auto mb-4 bg-accent-gold/20 rounded-full flex items-center justify-center">
                  <EnvelopeIcon className="w-6 h-6 text-accent-gold" />
                </div>
                <h3 className="text-lg font-semibold text-warm-ivory mb-2">Gmail Integration</h3>
                <p className="text-neutral-silver/70 text-sm">
                  Seamless OAuth connection with secure data handling
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
