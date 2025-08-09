'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EmailRow } from './EmailRow'
import { LoadingSkeleton } from '@/components/shared'
import { KineticParticles } from '@/components/luxury-ui'
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  EnvelopeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { Crown, Star, Medal, FileText } from 'lucide-react'
import type { ThreadWithPriority } from '@/lib/types'

interface EmailListProps {
  maxEmails?: number
}

interface EmailStats {
  total: number
  gold: number
  silver: number
  bronze: number
  standard: number
}

export function EmailList({ maxEmails = 10 }: EmailListProps) {
  const [threads, setThreads] = useState<ThreadWithPriority[]>([])
  const [stats, setStats] = useState<EmailStats>({ total: 0, gold: 0, silver: 0, bronze: 0, standard: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  const fetchEmails = async () => {
    try {
      const response = await fetch(`/api/gmail/threads?count=${maxEmails}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        if (response.status === 401 || response.status === 403) {
          throw new Error(errorData.error || 'Authentication required. Please reconnect your Gmail account.')
        }
        
        if (response.status === 503) {
          throw new Error(errorData.error || 'AI analysis temporarily unavailable. Please try again later.')
        }
        
        throw new Error(errorData.error || 'Failed to fetch emails')
      }

      const data = await response.json()
      setThreads(data.threads || [])
      setStats(data.stats || { total: 0, gold: 0, silver: 0, bronze: 0, standard: 0 })
      setError(null)
    } catch (err) {
      console.error('Failed to fetch emails:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch emails')
      setThreads([])
      setStats({ total: 0, gold: 0, silver: 0, bronze: 0, standard: 0 })
    } finally {
      setLoading(false)
      setRetrying(false)
    }
  }

  const handleRetry = async () => {
    setRetrying(true)
    setError(null)
    await fetchEmails()
  }

  useEffect(() => {
    fetchEmails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxEmails])

  const handleEmailSelect = (thread: ThreadWithPriority) => {
    // Future: Open email detail view
    console.log('Selected email:', thread)
  }

  if (loading) {
    return (
      <div className="relative">
        <KineticParticles particleCount={30} />
        <div className="relative z-10">
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative">
        <KineticParticles particleCount={20} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-md mx-auto text-center p-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Unable to Load Emails</h3>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">{error}</p>
          <motion.button
            onClick={handleRetry}
            disabled={retrying}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              inline-flex items-center gap-2 px-6 py-3
              bg-gradient-to-r from-luxury-indigo to-luxury-indigo/80
              text-white font-medium rounded-lg
              hover:shadow-lg hover:shadow-luxury-indigo/25
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            <ArrowPathIcon className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying...' : 'Try Again'}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (threads.length === 0) {
    return (
      <div className="relative">
        <KineticParticles particleCount={25} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-md mx-auto text-center p-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/10 flex items-center justify-center">
            <EnvelopeIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Emails Found</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your inbox appears to be empty or all emails have been processed.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Kinetic background particles */}
      <KineticParticles particleCount={35} mouseAttraction={true} />
      
      <div className="relative z-10">
        {/* Executive Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 grid grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {/* Total */}
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-md border border-gray-700/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ChartBarIcon className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">Total</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>

          {/* Gold */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 backdrop-blur-md border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-400 uppercase tracking-wider">Gold</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">{stats.gold}</div>
          </div>

          {/* Silver */}
          <div className="bg-gradient-to-br from-gray-300/10 to-gray-400/5 backdrop-blur-md border border-gray-300/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-gray-300" />
              <span className="text-xs text-gray-300 uppercase tracking-wider">Silver</span>
            </div>
            <div className="text-2xl font-bold text-gray-300">{stats.silver}</div>
          </div>

          {/* Bronze */}
          <div className="bg-gradient-to-br from-orange-600/10 to-orange-700/5 backdrop-blur-md border border-orange-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Medal className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-orange-400 uppercase tracking-wider">Bronze</span>
            </div>
            <div className="text-2xl font-bold text-orange-400">{stats.bronze}</div>
          </div>

          {/* Standard */}
          <div className="bg-gradient-to-br from-gray-600/5 to-gray-700/3 backdrop-blur-md border border-gray-500/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">Standard</span>
            </div>
            <div className="text-2xl font-bold text-gray-400">{stats.standard}</div>
          </div>
        </motion.div>

        {/* Email List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatePresence mode="popLayout">
            {threads.map((thread, index) => (
              <EmailRow
                key={thread.thread.id}
                thread={thread}
                index={index}
                onSelect={handleEmailSelect}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Load More Button (Future Enhancement) */}
        {threads.length >= maxEmails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6"
          >
            <button className="
              px-6 py-3 text-sm font-medium text-gray-400 
              border border-gray-600/30 rounded-lg
              hover:bg-gray-800/30 hover:text-white
              transition-all duration-200
            ">
              Load More Emails
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}