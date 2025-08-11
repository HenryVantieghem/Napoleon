# NAPOLEON AI - SIMPLE PROTOTYPE

## OBJECTIVE
Build minimal working prototype with 5 core features:
1. User authentication (Clerk)
2. Gmail messages from past 7 days
3. Slack messages from past 7 days  
4. Single chronological timeline view
5. Priority scoring (simple)

## TECH STACK
- Framework: Next.js 14.2.18
- Language: TypeScript (strict)
- Styling: Tailwind CSS
- Auth: Clerk 5.x
- APIs: Gmail API, Slack Web API

## PROJECT STRUCTURE
```
app/
├── page.tsx              # Landing/auth page
├── dashboard/
│   └── page.tsx          # Main prototype dashboard
components/
├── MessageCard.tsx       # Individual message display
├── MessageList.tsx       # Timeline of all messages
└── auth/                 # Auth components
lib/
├── gmail.ts              # Gmail API client
├── slack.ts              # Slack API client  
└── types.ts              # TypeScript types
```

## DEVELOPMENT PHASES
1. Basic Next.js setup ✅
2. Authentication with Clerk
3. Gmail API integration
4. Slack API integration  
5. Message timeline UI
6. Priority scoring

## REQUIREMENTS
- Minimal viable product approach
- No complex features or enterprise UI
- Focus on functionality over aesthetics
- Single page application
- Real data from APIs