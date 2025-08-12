// Message normalization and priority scoring for Napoleon AI

export interface NormalizedMessage {
  id: string
  provider: 'google' | 'slack'
  subject: string
  sender: string
  snippet: string
  received_at: string
  priority_score: number
}

// Priority scoring algorithm
export function scorePriority(message: NormalizedMessage): number {
  let score = 0
  const subjectLower = message.subject.toLowerCase()
  const senderLower = message.sender.toLowerCase()
  const snippetLower = message.snippet.toLowerCase()
  const content = `${subjectLower} ${snippetLower}`

  // Time decay factor (newer messages get higher scores)
  const messageAge = Date.now() - new Date(message.received_at).getTime()
  const hoursOld = messageAge / (1000 * 60 * 60)
  const timeDecayFactor = Math.max(0.1, 1 - (hoursOld / 168)) // Decay over 7 days
  
  // Base priority scoring
  
  // URGENT indicators (+50-100 points)
  const urgentKeywords = [
    'urgent', 'asap', 'emergency', 'critical', 'immediate',
    'breaking', 'alert', 'action required', 'time sensitive',
    'deadline', 'overdue', 'escalation', 'issue', 'problem',
    'down', 'failing', 'broken', 'incident', 'outage'
  ]
  
  if (urgentKeywords.some(keyword => content.includes(keyword))) {
    score += 100
  }

  // VIP sender detection (+30-60 points)
  const vipTitles = [
    'ceo', 'cto', 'cfo', 'president', 'director', 'vp', 'vice president',
    'manager', 'lead', 'head', 'senior', 'chief', 'executive'
  ]
  
  const vipDomains = [
    'board', 'leadership', 'executive', 'c-suite'
  ]

  if (vipTitles.some(title => senderLower.includes(title))) {
    score += 60
  }
  
  if (vipDomains.some(domain => senderLower.includes(domain))) {
    score += 40
  }

  // Important channel/context detection for Slack (+20-40 points)
  if (message.provider === 'slack') {
    const importantChannels = [
      'general', 'announcements', 'alerts', 'incidents',
      'leadership', 'executive', 'board', 'all-hands'
    ]
    
    if (importantChannels.some(channel => senderLower.includes(channel))) {
      score += 40
    }
    
    if (senderLower.includes('dm with')) {
      score += 20 // Direct messages are more important
    }
  }

  // Question indicators (+15-25 points)
  const questionIndicators = [
    '?', 'please', 'can you', 'could you', 'would you',
    'help', 'question', 'how to', 'what is', 'how do',
    'where is', 'when is', 'why is', 'need assistance'
  ]
  
  if (questionIndicators.some(indicator => content.includes(indicator))) {
    score += 25
  }

  // Meeting/Calendar related (+20 points)
  const meetingKeywords = [
    'meeting', 'calendar', 'schedule', 'appointment',
    'call', 'zoom', 'teams', 'conference'
  ]
  
  if (meetingKeywords.some(keyword => content.includes(keyword))) {
    score += 20
  }

  // Financial/Business critical terms (+30 points)
  const businessKeywords = [
    'revenue', 'budget', 'financial', 'quarterly', 'earnings',
    'contract', 'deal', 'client', 'customer', 'sales'
  ]
  
  if (businessKeywords.some(keyword => content.includes(keyword))) {
    score += 30
  }

  // Security/Compliance (+40 points)
  const securityKeywords = [
    'security', 'breach', 'compliance', 'audit', 'risk',
    'vulnerability', 'threat', 'privacy', 'gdpr', 'hipaa'
  ]
  
  if (securityKeywords.some(keyword => content.includes(keyword))) {
    score += 40
  }

  // Reduce score for automated/promotional content (-10 to -30 points)
  const spamIndicators = [
    'unsubscribe', 'newsletter', 'promotion', 'marketing',
    'automated', 'no-reply', 'noreply', 'do not reply'
  ]
  
  if (spamIndicators.some(indicator => content.includes(indicator))) {
    score -= 30
  }

  // Apply time decay
  score = Math.floor(score * timeDecayFactor)
  
  // Ensure minimum score of 0
  return Math.max(0, score)
}

// Normalize Gmail messages
export function normalizeGmail(gmailData: any): NormalizedMessage[] {
  const messages: NormalizedMessage[] = []
  
  if (!gmailData.messages || !Array.isArray(gmailData.messages)) {
    return messages
  }

  for (const msg of gmailData.messages) {
    const normalized: NormalizedMessage = {
      id: msg.id,
      provider: 'google',
      subject: msg.subject || 'No Subject',
      sender: msg.sender || 'Unknown Sender',
      snippet: msg.snippet || '',
      received_at: msg.received_at,
      priority_score: 0 // Will be calculated below
    }
    
    // Calculate priority score
    normalized.priority_score = scorePriority(normalized)
    messages.push(normalized)
  }

  return messages
}

// Normalize Slack messages  
export function normalizeSlack(slackData: any): NormalizedMessage[] {
  const messages: NormalizedMessage[] = []
  
  if (!slackData.messages || !Array.isArray(slackData.messages)) {
    return messages
  }

  for (const msg of slackData.messages) {
    const normalized: NormalizedMessage = {
      id: msg.id,
      provider: 'slack',
      subject: msg.subject || `Message from ${msg.sender}`,
      sender: msg.sender || 'Unknown Channel',
      snippet: msg.snippet || '',
      received_at: msg.received_at,
      priority_score: 0 // Will be calculated below
    }
    
    // Calculate priority score
    normalized.priority_score = scorePriority(normalized)
    messages.push(normalized)
  }

  return messages
}

// Unified normalization function
export function normalizeMessages(
  gmailData?: any, 
  slackData?: any
): NormalizedMessage[] {
  const allMessages: NormalizedMessage[] = []
  
  if (gmailData) {
    allMessages.push(...normalizeGmail(gmailData))
  }
  
  if (slackData) {
    allMessages.push(...normalizeSlack(slackData))
  }
  
  // Sort by priority score (highest first), then by recency
  allMessages.sort((a, b) => {
    if (a.priority_score !== b.priority_score) {
      return b.priority_score - a.priority_score
    }
    return new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
  })
  
  return allMessages
}