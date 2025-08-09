# NAPOLEON AI - PROTOTYPE CONFIGURATION

## IMMEDIATE CONTEXT
Building simplified prototype with 3 requirements:
1. Single page showing messages chronologically
2. Gmail messages from past 7 days
3. Slack messages from past 7 days

## TECH STACK
- Framework: Next.js 14.2.18
- Runtime: Node.js 18+
- Language: TypeScript 5.3 (strict mode)
- Styling: Tailwind CSS 3.4
- Auth: Clerk 5.12.0
- Database: PostgreSQL + Prisma
- APIs: Gmail API, Slack Web API
- Deployment: Vercel

## PROJECT STRUCTURE
app/                # Next.js App Router
├── prototype/      # Prototype pages (CREATE THIS)
components/         # React components
├── prototype/      # Prototype components (CREATE THIS)
lib/               # Utilities and clients
├── gmail/         # Gmail integration
├── slack/         # Slack integration
actions/           # Server actions
hooks/             # Custom React hooks
types/             # TypeScript definitions

## CRITICAL COMMANDS
npm run dev         # Start on port 3000
npm run build       # Production build
npm run test        # Run existing tests
npm run lint        # Check code quality
npx prisma studio   # Database GUI

## CODE STANDARDS
- ES modules only (import/export)
- Arrow functions for components
- Async/await over promises
- Destructure imports
- Handle all errors explicitly
- Add TypeScript types for everything

## GIT WORKFLOW
- Work ONLY on prototype-simple-v1 branch
- Commit after EVERY phase completion
- Format: type(scope): message
- Types: feat, fix, chore, docs, test
- Push after major milestones

## ENVIRONMENT VARIABLES
Required in .env.local:
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- DATABASE_URL
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI
- SLACK_BOT_TOKEN
- SLACK_SIGNING_SECRET
- OPENAI_API_KEY (optional for prototype)

## TESTING PROTOCOL
After each phase:
1. Run npm run lint - fix any issues
2. Run npm run test - ensure no breaks
3. Test manually in browser
4. Commit working code

## DO NOT MODIFY
- Main branch files
- Core authentication logic
- Database migrations
- Node_modules
- .env.local without backup

## CURRENT TASK
Phase-by-phase prototype implementation focusing on:
- Simplification over features
- Functionality over aesthetics
- Data display over processing

## MEMORY
- to memorize