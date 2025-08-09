# 🎖️ Napoleon AI - Executive Email Intelligence Platform

> *Transform executive communications into strategic clarity with military-grade AI intelligence*

**Napoleon AI** is a luxury Gmail intelligence platform designed exclusively for Fortune 500 C-suite executives, priced at $25,000/year. Built with Next.js 14, TypeScript, and cutting-edge AI, it delivers unparalleled email prioritization and analysis.

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/HenryVantieghem/Napoleon.git
cd Napoleon
npm install

# Configure environment
cp .env.example .env.local
# Add your Clerk and OpenAI API keys

# Start development
npm run dev
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── gmail/         # Gmail API integration
│   │   ├── health/        # Health checks
│   │   └── metrics/       # Performance metrics
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Executive dashboard
│   └── globals.css        # Global styles
├── components/            # Organized component library
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Core dashboard components
│   ├── email/             # Email display components
│   ├── luxury-ui/         # Premium UI components
│   └── shared/            # Reusable components
└── lib/                   # Utility libraries
    ├── ai/                # OpenAI integration
    ├── auth/              # Clerk authentication
    ├── gmail-api/         # Gmail API clients
    ├── constants/         # App constants
    ├── types/             # TypeScript definitions
    └── utils/             # Helper functions
```

## 🔧 Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 14 | React framework with App Router |
| **Language** | TypeScript | Type-safe development |
| **Authentication** | Clerk | User auth & Gmail OAuth |
| **AI** | OpenAI GPT-4 | Email analysis & prioritization |
| **Styling** | Tailwind CSS | Utility-first styling |
| **UI** | Framer Motion | Luxury animations |
| **Testing** | Jest + RTL | Component & unit testing |
| **Deployment** | Vercel | Production hosting |

## 🔐 Environment Setup

Create `.env.local` with these required variables:

```bash
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# OpenAI API (Required)  
OPENAI_API_KEY=sk-...

# Analytics (Optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-...
```

### Clerk Configuration

1. **Create Application**: Go to [clerk.com](https://clerk.com) → Create Application
2. **Google OAuth**: Enable Google provider in Social Connections
3. **Gmail Scopes**: Add `https://www.googleapis.com/auth/gmail.readonly`
4. **Hosted Pages**: Configure hosted sign-in/up at `https://accounts.napoleonai.app`
5. **Redirect URLs**: Configure for your domain
6. **Environment Variables**: Copy keys to `.env.local`

#### Clerk Hosted Pages Setup

**Allowed Origins:**
- `https://napoleonai.app`
- `https://*.vercel.app` (for preview deployments)

**Sign-in/up URLs:**
- `https://accounts.napoleonai.app/sign-in`
- `https://accounts.napoleonai.app/sign-up`

**After Auth Redirects:**
- After sign-in: `/dashboard`
- After sign-up: `/dashboard`

**Environment Variables:**
```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=https://accounts.napoleonai.app/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=https://accounts.napoleonai.app/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📚 Component Documentation

### Authentication Components

```typescript
import { ClerkAuthButton } from '@/components/auth'

<ClerkAuthButton 
  variant="primary" 
  size="lg" 
  mode="signin" 
/>
```

### Email Components

```typescript
import { EmailList, ThreadCard, PriorityBadge } from '@/components/email'

<EmailList maxEmails={20} />
<ThreadCard thread={threadData} />
<PriorityBadge tier="gold" score={9.2} />
```

### Luxury UI Components

```typescript
import { KineticParticles, Starfield, GlassCard } from '@/components/luxury-ui'

<KineticParticles count={50} />
<Starfield starCount={150} />
<GlassCard className="luxury-card">Content</GlassCard>
```

## 🔧 API Endpoints

### Gmail Integration
- `GET /api/gmail/threads` - Fetch prioritized email threads
- `GET /api/health` - Service health check
- `GET /api/metrics` - Performance metrics

### Request Example
```typescript
const response = await fetch('/api/gmail/threads?count=10')
const { threads, stats } = await response.json()
```

### Response Schema
```typescript
interface ThreadWithPriority {
  thread: GmailThread
  analysis: AIAnalysis
  priorityScore: number
  priorityTier: 'gold' | 'silver' | 'bronze' | 'standard'
  boostedScore?: number
  boostReason?: string
}
```

## 🎨 Design System

### Color Palette
```css
--imperial-dark: #000000;      /* Primary background */
--executive-white: #ffffff;    /* Primary text */
--imperial-gold: #fbbf24;      /* Accent highlights */
--orbital-blue: #6366f1;       /* Interactive elements */
--glass-border: rgba(255, 255, 255, 0.1); /* Glass effects */
```

### Typography
- **Headers**: Playfair Display (luxury serif)
- **Body**: Inter (clean sans-serif)
- **Code**: Crimson Text (readable monospace)

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
Configure in Vercel Dashboard:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `OPENAI_API_KEY`

### Build Optimization
- **Bundle Size**: ~171KB optimized
- **Load Time**: <3s on 3G networks
- **Performance**: Core Web Vitals optimized

## 🔒 Security

- **Authentication**: Clerk-managed OAuth with Google
- **API Security**: Server-side auth validation
- **Data Privacy**: No email data stored permanently
- **HTTPS**: TLS 1.3 encryption in production

## 📈 Performance

- **Priority Scoring**: Sub-200ms AI analysis
- **Caching**: 10-minute analysis cache
- **Animations**: 60fps luxury animations
- **Bundle**: Code splitting and lazy loading

## 🛠️ Development

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js + Prettier configuration
- **Testing**: >80% unit test coverage
- **Documentation**: JSDoc for complex functions

### Git Workflow
```bash
# Feature development
git checkout -b feature/executive-dashboard
git commit -m "feat: add executive dashboard"
git push origin feature/executive-dashboard
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Proprietary software for Fortune 500 executives. Unauthorized use prohibited.

## Support

For enterprise support: [support@napoleon-ai.com](mailto:support@napoleon-ai.com)

---

**Napoleon AI** - Where executive communication meets artificial intelligence. 🎖️