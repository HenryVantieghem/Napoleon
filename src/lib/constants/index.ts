/**
 * Application Constants
 * Global constants and configuration values
 */

// Executive Priority Scoring
export const PRIORITY_TIERS = {
  GOLD: 'gold',
  SILVER: 'silver', 
  BRONZE: 'bronze',
  STANDARD: 'standard'
} as const;

export const PRIORITY_THRESHOLDS = {
  GOLD: 9.0,
  SILVER: 7.0,
  BRONZE: 4.0,
  STANDARD: 0.0
} as const;

// Gmail API Configuration
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly'
] as const;

// Executive Keywords for Priority Boosting
export const EXECUTIVE_KEYWORDS = {
  URGENT: [
    'urgent', 'asap', 'immediate', 'critical', 'emergency',
    'board', 'ceo', 'chairman', 'president', 'executive',
    'quarterly results', 'earnings', 'acquisition', 'merger'
  ],
  VIP_DOMAINS: [
    'board.', 'ceo@', 'president@', 'chairman@',
    'goldman', 'mckinsey', 'bcg', 'deloitte'
  ],
  FINANCIAL: [
    'quarterly', 'earnings', 'revenue', 'profit',
    'budget', 'forecast', 'investment', 'acquisition'
  ]
} as const;

// UI Configuration
export const ANIMATION_DURATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5
} as const;

export const LUXURY_COLORS = {
  IMPERIAL_DARK: '#000000',
  EXECUTIVE_WHITE: '#ffffff', 
  IMPERIAL_GOLD: '#fbbf24',
  ORBITAL_BLUE: '#6366f1',
  GLASS_BORDER: 'rgba(255, 255, 255, 0.1)'
} as const;