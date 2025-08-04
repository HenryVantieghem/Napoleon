// Napoleon AI MVP - Core TypeScript Interfaces

import type { Session } from '@supabase/supabase-js';

export type { Session };

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface GmailThread {
  id: string;
  subject: string;
  snippet: string;
  participants: string[];
  unreadCount: number;
  lastActivity: Date;
  hasAttachments: boolean;
  labels: string[];
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: {
    partId: string;
    mimeType: string;
    filename: string;
    headers: GmailHeader[];
    body: {
      size: number;
      data?: string;
    };
    parts?: GmailMessagePart[];
  };
  sizeEstimate: number;
}

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailMessagePart {
  partId: string;
  mimeType: string;
  filename: string;
  headers: GmailHeader[];
  body: {
    size: number;
    data?: string;
  };
}

// Raw Gmail API Types
export interface GmailApiThread {
  id: string;
  historyId: string;
  messages?: GmailApiMessage[];
  snippet?: string;
}

export interface GmailApiMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: GmailApiPayload;
  sizeEstimate: number;
}

export interface GmailApiPayload {
  partId: string;
  mimeType: string;
  filename: string;
  headers: GmailHeader[];
  body: {
    size: number;
    data?: string;
  };
  parts?: GmailApiPayload[];
}

export interface GmailApiListResponse<T> {
  threads?: T[];
  messages?: T[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

// Gmail API Client Types
export interface GmailClientOptions {
  accessToken: string;
  maxResults?: number;
  pageToken?: string;
}

export interface GmailClientError {
  code: number;
  message: string;
  details?: unknown;
}

export interface AIAnalysis {
  id: string;
  thread_id: string;
  priority_score: number; // 1-10 scale
  category: 'urgent' | 'important' | 'follow_up' | 'fyi' | 'spam';
  summary: string;
  key_points: string[];
  suggested_actions: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence_score: number; // 0-1 scale
  created_at: string;
}

export interface ThreadWithAnalysis {
  thread: GmailThread;
  analysis: AIAnalysis;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export interface DashboardStats {
  total_threads: number;
  urgent_count: number;
  important_count: number;
  follow_up_count: number;
  processed_today: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: 'success' | 'error';
}

export interface GmailOAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
  scope: string;
}

// Form Types
export interface SignInFormData {
  email: string;
  password: string;
}

export interface ConnectGmailFormData {
  consent: boolean;
}