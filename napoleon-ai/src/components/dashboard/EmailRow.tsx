'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useState } from 'react'
import { format } from 'date-fns'
import { 
  PaperClipIcon, 
  UserGroupIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline'
import { Crown, Star, Medal, FileText } from 'lucide-react'
import type { ThreadWithPriority } from '@/lib/types'

interface EmailRowProps {
  thread: ThreadWithPriority
  index: number
  onSelect?: (thread: ThreadWithPriority) => void
}

export function EmailRow({ thread, index, onSelect }: EmailRowProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Kinetic Luxury: Mouse tracking for parallax tilt effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const rotateX = useTransform(mouseY, [-100, 100], [2, -2])
  const rotateY = useTransform(mouseX, [-100, 100], [-2, 2])
  
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    mouseX.set(event.clientX - centerX)
    mouseY.set(event.clientY - centerY)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }

  const getPriorityIcon = (tier: string) => {
    switch (tier) {
      case 'gold': return <Crown className="w-4 h-4" />
      case 'silver': return <Star className="w-4 h-4" />
      case 'bronze': return <Medal className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getPriorityColors = (tier: string) => {
    switch (tier) {
      case 'gold':
        return {
          bg: 'bg-gradient-to-r from-yellow-500/10 via-yellow-400/5 to-yellow-600/10',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          glow: 'shadow-yellow-500/20'
        }
      case 'silver':
        return {
          bg: 'bg-gradient-to-r from-gray-300/10 via-gray-200/5 to-gray-400/10',
          border: 'border-gray-300/30',
          text: 'text-gray-300',
          glow: 'shadow-gray-300/20'
        }
      case 'bronze':
        return {
          bg: 'bg-gradient-to-r from-orange-600/10 via-orange-500/5 to-orange-700/10',
          border: 'border-orange-500/30',
          text: 'text-orange-400',
          glow: 'shadow-orange-500/20'
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-600/5 via-gray-500/3 to-gray-700/5',
          border: 'border-gray-500/20',
          text: 'text-gray-400',
          glow: 'shadow-gray-500/10'
        }
    }
  }

  const colors = getPriorityColors(thread.priorityTier)
  const isUnread = thread.thread.unreadCount > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1]
      }}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
      }}
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect?.(thread)}
      className={`
        relative cursor-pointer group
        ${colors.bg} ${colors.border}
        backdrop-blur-md border rounded-xl p-4 mb-3
        transition-all duration-300 ease-out
        ${isHovered ? `${colors.glow} shadow-2xl` : 'shadow-lg'}
        transform-gpu perspective-1000
      `}
    >
      {/* Kinetic Luxury: Animated background gradient on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5"
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10 flex items-start gap-4">
        {/* Priority Badge with reveal animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: index * 0.05 + 0.2,
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
          }}
          className={`
            flex-shrink-0 w-10 h-10 rounded-full
            flex items-center justify-center
            ${colors.text} ${colors.bg}
            border ${colors.border}
            shadow-lg
          `}
        >
          {getPriorityIcon(thread.priorityTier)}
        </motion.div>

        {/* Email Content */}
        <div className="flex-1 min-w-0">
          {/* Header with participants and timestamp */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <UserGroupIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-300 truncate">
                {thread.thread.participants.slice(0, 2).join(', ')}
                {thread.thread.participants.length > 2 && 
                  ` +${thread.thread.participants.length - 2} more`
                }
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {thread.thread.hasAttachments && (
                <PaperClipIcon className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-xs text-gray-500">
                {format(new Date(thread.thread.lastActivity), 'MMM d, HH:mm')}
              </span>
            </div>
          </div>

          {/* Subject */}
          <h3 className={`
            text-lg font-medium mb-2 line-clamp-1
            ${isUnread ? 'text-white font-semibold' : 'text-gray-200'}
          `}>
            {thread.thread.subject}
          </h3>

          {/* AI Summary */}
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {thread.analysis.summary}
          </p>

          {/* Priority Score and Category */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + 0.3 }}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${colors.bg} ${colors.text} ${colors.border} border
                `}
              >
                Score: {thread.priorityScore}
              </motion.div>
              <span className={`
                text-xs px-2 py-1 rounded-full
                ${thread.analysis.category === 'urgent' ? 'bg-red-500/20 text-red-400' :
                  thread.analysis.category === 'important' ? 'bg-blue-500/20 text-blue-400' :
                  thread.analysis.category === 'follow_up' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }
              `}>
                {thread.analysis.category}
              </span>
            </div>

            {/* Unread indicator */}
            {isUnread && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 + 0.4 }}
                className="flex items-center gap-1"
              >
                <div className="w-2 h-2 bg-luxury-indigo rounded-full animate-pulse" />
                <span className="text-xs text-luxury-indigo font-medium">
                  {thread.thread.unreadCount} unread
                </span>
              </motion.div>
            )}
          </div>

          {/* Boost reason if available */}
          {thread.boostReason && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 + 0.5 }}
              className="mt-2 flex items-center gap-1"
            >
              <SparklesIcon className="w-3 h-3 text-luxury-gold" />
              <span className="text-xs text-luxury-gold">
                Boosted: {thread.boostReason}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Kinetic Luxury: Hover glow effect */}
      <motion.div
        className={`
          absolute inset-0 rounded-xl pointer-events-none
          bg-gradient-to-r ${colors.bg} opacity-0
        `}
        animate={{
          opacity: isHovered ? 0.3 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}