'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Crown, Zap, Brain, Target, Clock, Users, ChevronRight, 
  Command, ArrowUp, ArrowDown, Filter, Search, Star,
  CheckCircle, AlertTriangle, MessageSquare, Calendar,
  Briefcase, Globe, Shield, TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LinearButton, LinearCard, LinearBadge, LinearInput } from './LinearComponents'

/**
 * Superhuman Executive Intelligence System
 * AI-powered email prioritization with executive context awareness
 * $30/month value justification through extreme productivity optimization
 */

interface SuperhumanEmail {
  id: string
  subject: string
  sender: string
  snippet: string
  timestamp: Date
  priority: 'vip' | 'team' | 'tools' | 'noise'
  aiScore: number
  executiveContext: {
    category: 'board' | 'strategic' | 'operational' | 'informational'
    urgency: 'critical' | 'high' | 'medium' | 'low'
    actionRequired: boolean
    estimatedReadTime: number
    keyTopics: string[]
    suggestedActions: string[]
  }
  metadata: {
    isRead: boolean
    hasAttachments: boolean
    threadLength: number
    lastReply?: Date
  }
}

interface SuperhumanInboxProps {
  emails: SuperhumanEmail[]
  onEmailSelect: (email: SuperhumanEmail) => void
  className?: string
}

/**
 * Superhuman Split Inbox - VIP/Team/Tools segregation
 */
export function SuperhumanSplitInbox({ emails = [], onEmailSelect, className }: SuperhumanInboxProps) {
  const [activeTab, setActiveTab] = useState<'vip' | 'team' | 'tools'>('vip')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Keyboard-first navigation (Superhuman pattern)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            setActiveTab('vip')
            break
          case '2':
            e.preventDefault()
            setActiveTab('team')
            break
          case '3':
            e.preventDefault()
            setActiveTab('tools')
            break
          case 'k':
            e.preventDefault()
            setSelectedIndex(prev => Math.max(0, prev - 1))
            break
          case 'j':
            e.preventDefault()
            setSelectedIndex(prev => Math.min(filteredEmails.length - 1, prev + 1))
            break
          case 'Enter':
            e.preventDefault()
            if (filteredEmails[selectedIndex]) {
              onEmailSelect(filteredEmails[selectedIndex])
            }
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, activeTab])

  // Filter emails by tab and search
  const filteredEmails = emails
    .filter(email => email.priority === activeTab)
    .filter(email => 
      searchQuery === '' || 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const tabs = [
    { 
      key: 'vip' as const, 
      label: 'VIP', 
      icon: <Crown className="w-4 h-4" />, 
      count: emails.filter(e => e.priority === 'vip').length,
      shortcut: '⌘1'
    },
    { 
      key: 'team' as const, 
      label: 'Team', 
      icon: <Users className="w-4 h-4" />, 
      count: emails.filter(e => e.priority === 'team').length,
      shortcut: '⌘2'
    },
    { 
      key: 'tools' as const, 
      label: 'Tools', 
      icon: <Briefcase className="w-4 h-4" />, 
      count: emails.filter(e => e.priority === 'tools').length,
      shortcut: '⌘3'
    }
  ]

  return (
    <div className={cn('superhuman-inbox space-y-6', className)}>
      {/* Executive Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
        <LinearInput
          placeholder="Search executive communications... (⌘K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Split Inbox Tabs */}
      <div className="flex space-x-1 p-1 bg-lch-neutral-800 rounded-lg">
        {tabs.map((tab) => (
          <motion.button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-medium text-sm transition-all duration-200',
              activeTab === tab.key
                ? 'bg-lch-primary-500 text-lch-neutral-50 shadow-lg'
                : 'text-text-secondary hover:text-text-primary hover:bg-lch-neutral-700'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <LinearBadge variant={activeTab === tab.key ? 'default' : 'ghost'} size="xs">
              {tab.count}
            </LinearBadge>
            <span className="text-xs opacity-60">{tab.shortcut}</span>
          </motion.button>
        ))}
      </div>

      {/* Email List */}
      <div className="space-y-2">
        <AnimatePresence mode="wait">
          {filteredEmails.map((email, index) => (
            <SuperhumanEmailRow
              key={email.id}
              email={email}
              isSelected={index === selectedIndex}
              onClick={() => onEmailSelect(email)}
              index={index}
            />
          ))}
        </AnimatePresence>
        
        {filteredEmails.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-lch-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-lch-success-500" />
            </div>
            <h3 className="executive-heading text-lg mb-2">Inbox Zero Achieved</h3>
            <p className="text-text-secondary">Your {activeTab} communications are perfectly managed.</p>
          </motion.div>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <SuperhumanShortcuts />
    </div>
  )
}

/**
 * Superhuman Email Row with Executive Context
 */
interface SuperhumanEmailRowProps {
  email: SuperhumanEmail
  isSelected: boolean
  onClick: () => void
  index: number
}

function SuperhumanEmailRow({ email, isSelected, onClick, index }: SuperhumanEmailRowProps) {
  const priorityColors = {
    vip: 'border-l-lch-gold-500 bg-lch-gold-500/5',
    team: 'border-l-lch-primary-500 bg-lch-primary-500/5',
    tools: 'border-l-lch-neutral-500 bg-lch-neutral-500/5',
    noise: 'border-l-lch-neutral-700 bg-lch-neutral-700/5'
  }

  const urgencyIcons = {
    critical: <AlertTriangle className="w-4 h-4 text-lch-danger-500" />,
    high: <TrendingUp className="w-4 h-4 text-lch-warning-500" />,
    medium: <Clock className="w-4 h-4 text-lch-primary-500" />,
    low: <MessageSquare className="w-4 h-4 text-text-tertiary" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        'superhuman-email-row p-4 border-l-4 rounded-r-lg cursor-pointer transition-all duration-200',
        priorityColors[email.priority],
        isSelected && 'ring-2 ring-lch-primary-500 bg-lch-primary-500/10',
        !email.metadata.isRead && 'font-semibold'
      )}
      onClick={onClick}
      whileHover={{ scale: 1.01, x: 4 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-3">
          {urgencyIcons[email.executiveContext.urgency]}
          <div className="flex-1">
            <h4 className="text-text-primary font-medium text-sm mb-1">
              {email.sender}
            </h4>
            <h3 className="text-text-primary font-semibold mb-1">
              {email.subject}
            </h3>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-xs">
          <LinearBadge variant="primary" size="xs">
            {Math.round(email.aiScore * 100)}% AI
          </LinearBadge>
          <span className="text-text-tertiary">
            {email.executiveContext.estimatedReadTime}m read
          </span>
        </div>
      </div>

      <p className="text-text-secondary text-sm mb-3 line-clamp-2">
        {email.snippet}
      </p>

      {/* Executive Context Tags */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {(email.executiveContext.keyTopics || []).slice(0, 3).map((topic, i) => (
            <LinearBadge key={i} variant="ghost" size="xs">
              {topic}
            </LinearBadge>
          ))}
          {email.executiveContext.actionRequired && (
            <LinearBadge variant="secondary" size="xs">
              Action Required
            </LinearBadge>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-text-tertiary">
          {email.metadata.hasAttachments && <span>📎</span>}
          {email.metadata.threadLength > 1 && (
            <span>{email.metadata.threadLength}</span>
          )}
          <span>{email.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Executive AI Assistant Panel
 */
interface ExecutiveAIAssistantProps {
  selectedEmail?: SuperhumanEmail
  className?: string
}

export function ExecutiveAIAssistant({ selectedEmail, className }: ExecutiveAIAssistantProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeEmail = async () => {
    setIsAnalyzing(true)
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsAnalyzing(false)
  }

  if (!selectedEmail) {
    return (
      <LinearCard variant="elevated" padding="lg" className={cn('h-full', className)}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Brain className="w-16 h-16 text-lch-primary-400 mx-auto opacity-50" />
            <h3 className="executive-heading text-xl">AI Assistant Ready</h3>
            <p className="text-text-secondary">
              Select an email to view executive intelligence analysis
            </p>
          </div>
        </div>
      </LinearCard>
    )
  }

  return (
    <LinearCard variant="elevated" padding="lg" className={cn('space-y-6', className)}>
      {/* AI Analysis Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-lch-primary-500/20 rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5 text-lch-primary-400" />
          </div>
          <div>
            <h3 className="executive-heading text-lg">Executive Intelligence</h3>
            <p className="text-text-secondary text-sm">AI-powered analysis & recommendations</p>
          </div>
        </div>
        
        <LinearButton
          variant="primary"
          size="sm"
          loading={isAnalyzing}
          onClick={analyzeEmail}
          leftIcon={<Zap className="w-4 h-4" />}
        >
          {isAnalyzing ? 'Analyzing...' : 'Deep Analysis'}
        </LinearButton>
      </div>

      {/* Executive Context */}
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-text-primary mb-2">Executive Context</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-text-tertiary uppercase tracking-wide">Category</span>
              <LinearBadge variant="primary" className="mt-1">
                {selectedEmail.executiveContext.category}
              </LinearBadge>
            </div>
            <div>
              <span className="text-xs text-text-tertiary uppercase tracking-wide">Urgency</span>
              <LinearBadge 
                variant={selectedEmail.executiveContext.urgency === 'critical' ? 'destructive' : 'secondary'} 
                className="mt-1"
              >
                {selectedEmail.executiveContext.urgency}
              </LinearBadge>
            </div>
          </div>
        </div>

        {/* Key Topics */}
        <div>
          <h4 className="font-semibold text-text-primary mb-2">Key Topics</h4>
          <div className="flex flex-wrap gap-2">
            {(selectedEmail.executiveContext.keyTopics || []).map((topic, i) => (
              <LinearBadge key={i} variant="outline" size="sm">
                {topic}
              </LinearBadge>
            ))}
          </div>
        </div>

        {/* Suggested Actions */}
        <div>
          <h4 className="font-semibold text-text-primary mb-2">Suggested Actions</h4>
          <div className="space-y-2">
            {(selectedEmail.executiveContext.suggestedActions || []).map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center space-x-3 p-2 rounded-lg bg-lch-neutral-800/50"
              >
                <Target className="w-4 h-4 text-lch-primary-400 flex-shrink-0" />
                <span className="text-sm text-text-primary">{action}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Confidence Score */}
        <div>
          <h4 className="font-semibold text-text-primary mb-2">AI Confidence</h4>
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-lch-neutral-700 rounded-full h-2">
              <motion.div
                className="h-2 bg-lch-primary-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${selectedEmail.aiScore * 100}%` }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
            <span className="text-sm font-medium text-text-primary">
              {Math.round(selectedEmail.aiScore * 100)}%
            </span>
          </div>
        </div>
      </div>
    </LinearCard>
  )
}

/**
 * Superhuman Keyboard Shortcuts Panel
 */
function SuperhumanShortcuts() {
  const [isVisible, setIsVisible] = useState(false)

  const shortcuts = [
    { keys: ['⌘', '1'], action: 'Switch to VIP' },
    { keys: ['⌘', '2'], action: 'Switch to Team' },
    { keys: ['⌘', '3'], action: 'Switch to Tools' },
    { keys: ['⌘', 'K'], action: 'Search emails' },
    { keys: ['J'], action: 'Next email' },
    { keys: ['K'], action: 'Previous email' },
    { keys: ['Enter'], action: 'Open email' },
    { keys: ['⌘', 'Enter'], action: 'AI Analysis' }
  ]

  return (
    <div className="relative">
      <LinearButton
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        leftIcon={<Command className="w-4 h-4" />}
      >
        Keyboard Shortcuts
      </LinearButton>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 mb-2 p-4 bg-lch-neutral-900 border border-lch-neutral-700 rounded-lg shadow-2xl z-50 min-w-64"
          >
            <h4 className="font-semibold text-text-primary mb-3">Keyboard Shortcuts</h4>
            <div className="space-y-2">
              {shortcuts.map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{shortcut.action}</span>
                  <div className="flex items-center space-x-1">
                    {shortcut.keys.map((key, j) => (
                      <kbd
                        key={j}
                        className="px-2 py-1 text-xs bg-lch-neutral-800 rounded border border-lch-neutral-600"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Fortune 500 Executive Dashboard Integration
 */
interface Fortune500DashboardProps {
  executiveMetrics: {
    emailVelocity: number
    responseTime: number
    priorityAccuracy: number
    teamProductivity: number
    decisionSpeed: number
    stakeholderSatisfaction: number
  }
  className?: string
}

export function Fortune500Dashboard({ executiveMetrics, className }: Fortune500DashboardProps) {
  const kpiCards = [
    {
      title: 'Email Velocity',
      value: `${executiveMetrics.emailVelocity}/hr`,
      change: { value: 15, direction: 'up' as const },
      icon: <Zap className="w-5 h-5" />,
      color: 'lch-primary-500'
    },
    {
      title: 'Response Time',
      value: `${executiveMetrics.responseTime}m`,
      change: { value: 23, direction: 'down' as const },
      icon: <Clock className="w-5 h-5" />,
      color: 'lch-success-500'
    },
    {
      title: 'Priority Accuracy',
      value: `${executiveMetrics.priorityAccuracy}%`,
      change: { value: 8, direction: 'up' as const },
      icon: <Target className="w-5 h-5" />,
      color: 'lch-warning-500'
    },
    {
      title: 'Team Productivity',
      value: `${executiveMetrics.teamProductivity}%`,
      change: { value: 12, direction: 'up' as const },
      icon: <Users className="w-5 h-5" />,
      color: 'lch-gold-500'
    }
  ]

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="executive-heading text-2xl">Fortune 500 Executive KPIs</h2>
          <p className="text-text-secondary mt-1">Real-time leadership performance metrics</p>
        </div>
        <LinearBadge variant="primary">Live Dashboard</LinearBadge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <LinearCard variant="elevated" padding="md" className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`} 
                   style={{ backgroundColor: `var(--${kpi.color})/0.2` }}>
                <span style={{ color: `var(--${kpi.color})` }}>
                  {kpi.icon}
                </span>
              </div>
              
              <h3 className="executive-heading text-2xl mb-1">{kpi.value}</h3>
              <p className="text-text-secondary text-sm mb-2">{kpi.title}</p>
              
              <div className={cn(
                'flex items-center justify-center space-x-1 text-xs',
                kpi.change.direction === 'up' ? 'text-lch-success-500' : 'text-lch-danger-500'
              )}>
                {kpi.change.direction === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                <span>{kpi.change.value}%</span>
              </div>
            </LinearCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}