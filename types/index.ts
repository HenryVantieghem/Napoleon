export interface Message {
  id: string
  source: 'gmail' | 'slack'
  subject?: string
  content: string
  sender: string
  senderEmail?: string
  recipients?: string
  channel?: string
  timestamp: string
  priority: 'urgent' | 'question' | 'normal'
  metadata?: {
    threadId?: string
    labelIds?: string[]
    channelType?: string
    teamId?: string
    hasAttachments?: boolean
  }
}

export interface UserTokens {
  gmail_access_token?: string
  gmail_refresh_token?: string
  gmail_expires_at?: number
  slack_access_token?: string
  slack_user_id?: string
  slack_team_id?: string
}

export interface OAuthState {
  userId: string
  source: 'gmail' | 'slack'
  redirectUrl?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ConnectionStatus {
  gmail: boolean
  slack: boolean
}

export type MessagePriority = 'urgent' | 'question' | 'normal'
export type MessageSource = 'gmail' | 'slack'