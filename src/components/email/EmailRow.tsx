'use client'

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useState, useRef } from 'react'
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
  const cardRef = useRef<HTMLDivElement>(null)
  
  // Enhanced Kinetic Luxury: Mouse tracking for parallax tilt effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Spring animations for smoother, more luxurious feel
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 })
  
  const rotateX = useTransform(springY, [-100, 100], [3, -3])
  const rotateY = useTransform(springX, [-100, 100], [-3, 3])
  const scale = useTransform(springX, [-100, 100], [0.98, 1.02])
  
  // Enhanced glow effect based on mouse position (simplified for performance)
  const glowDistance = useTransform(springX, [-100, 100], [0, 1])
  
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // Enhanced mouse tracking with smooth interpolation
    const x = (event.clientX - centerX) * 0.8
    const y = (event.clientY - centerY) * 0.8
    
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    // Smooth return to center position
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
          bg: 'bg-gradient-to-r from-imperial-gold/10 via-imperial-gold/5 to-imperial-gold/10',
          border: 'border-imperial-gold/30',
          text: 'text-imperial-gold',
          glow: 'shadow-imperial-gold/20'
        }
      case 'silver':
        return {
          bg: 'bg-gradient-to-r from-text-secondary/10 via-text-secondary/5 to-text-secondary/10',
          border: 'border-text-secondary/30',
          text: 'text-secondary',
          glow: 'shadow-text-secondary/20'
        }
      case 'bronze':
        return {
          bg: 'bg-gradient-to-r from-accent-warning/10 via-accent-warning/5 to-accent-warning/10',
          border: 'border-accent-warning/30',
          text: 'text-accent-warning',
          glow: 'shadow-accent-warning/20'
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-glass-1 via-glass-0 to-glass-1',
          border: 'border-glass-border/20',
          text: 'text-tertiary',
          glow: 'shadow-glass-border/10'
        }
    }
  }

  const colors = getPriorityColors(thread.priorityTier)
  const isUnread = thread.thread.unreadCount > 0

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.08,
        ease: [0.4, 0, 0.2, 1]
      }}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        scale: isHovered ? scale : 1,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect?.(thread)}
      className={`
        relative cursor-pointer group
        ${colors.bg} ${colors.border}
        backdrop-blur-xl border rounded-2xl p-5 mb-4
        transition-all duration-500 ease-out
        ${isHovered ? `${colors.glow} shadow-2xl` : 'shadow-lg'}
        transform-gpu perspective-1000
        hover:backdrop-blur-2xl
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
        {/* Enhanced Priority Badge with spring-physics reveal animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ 
            delay: index * 0.08 + 0.3,
            type: "spring",
            stiffness: 260,
            damping: 20,
            mass: 1
          }}
          whileHover={{
            scale: 1.1,
            rotate: 5,
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 10
            }
          }}
          whileTap={{
            scale: 0.95,
            transition: {
              type: "spring",
              stiffness: 600,
              damping: 15
            }
          }}
          className={`
            flex-shrink-0 w-12 h-12 rounded-2xl
            flex items-center justify-center
            ${colors.text} ${colors.bg}
            border-2 ${colors.border}
            shadow-xl ${colors.glow}
            backdrop-blur-sm
            relative overflow-hidden
            group/badge
          `}
        >
          {/* Inner glow effect */}
          <motion.div
            className={`absolute inset-0 rounded-2xl ${colors.bg} opacity-0`}
            animate={{
              opacity: isHovered ? 0.6 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Priority icon with enhanced animation */}
          <motion.div
            animate={{
              rotate: isHovered ? [0, 10, -10, 0] : 0,
              scale: isHovered ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.6,
              ease: "easeInOut"
            }}
            className="relative z-10"
          >
            {getPriorityIcon(thread.priorityTier)}
          </motion.div>
          
          {/* Badge pulse effect for high priority */}
          {(thread.priorityTier === 'gold' || thread.priorityTier === 'silver') && (
            <motion.div
              className={`absolute inset-0 rounded-2xl ${colors.border} border-2`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
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