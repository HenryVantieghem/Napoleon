# Napoleon AI MVP - Development Guide

## Project Overview
Luxury Gmail-only Smart Inbox MVP using Next.js 14, TypeScript, Tailwind CSS, Supabase, OpenAI GPT-4.

## Design Tokens
colors:
  primaryBackground: '#0B0D11'
  accentGold: '#D4AF37'
  neutralSilver: '#C7CAD1'
  warmIvory: '#F6F6F4'
typography:
  display: 'Shelley Script'
  heading: 'Canela'  
  body: 'Inter'
spacing: [4,8,16,24,32]
motion:
  hoverEasing: 'cubic-bezier(0.4,0,0.2,1)'
  rippleDuration: '600ms'

## Code Style
- Use TypeScript for all files
- Use ES modules (import/export), not CommonJS
- Destructure imports when possible
- Use Tailwind CSS classes, not custom CSS
- Follow luxury/minimal design principles

## Workflow Rules
- Always run `npm run typecheck` after code changes
- Always run tests before committing
- Use conventional commits format
- Test-driven development preferred

## MVP Scope (Phase 1)
1. Landing page with luxury design
2. Gmail OAuth authentication  
3. Fetch 10 latest Gmail threads
4. AI summarization + priority scoring
5. Clean dashboard display

## Folders
/app - Next.js 14 App Router pages
/components - Reusable UI components
/lib - Utilities and configurations  
/types - TypeScript type definitions

## Dependencies
Core:
- next@14
- react@18
- typescript
- tailwindcss
- @supabase/supabase-js
- openai

Development:
- jest
- @testing-library/react
- @testing-library/jest-dom
- @types/node
- eslint
- prettier

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OPENAI_API_KEY=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build production
- `npm run typecheck` - Run TypeScript checks
- `npm run test` - Run test suite
- `npm run lint` - Run ESLint

## Testing Strategy
- Unit tests for utilities and components
- Integration tests for Gmail API flows
- E2E tests for critical user journeys
- TDD approach - write tests first

## Git Workflow
- Conventional commits: `feat:`, `fix:`, `test:`, `docs:`
- Feature branches from main
- Squash and merge PRs
- No direct commits to main