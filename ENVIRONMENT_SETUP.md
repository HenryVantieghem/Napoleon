# Environment Variables Setup for Prototype

## Required Variables in .env.local

### Clerk Authentication (REQUIRED)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/prototype
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/prototype
```

### Google OAuth (REQUIRED)
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### Slack Integration (REQUIRED)
```
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token
```

### Database (REQUIRED)
```
DATABASE_URL=postgresql://user:password@localhost:5432/napoleon
```

### OpenAI (OPTIONAL for prototype)
```
OPENAI_API_KEY=sk-...
```

### App Configuration
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Instructions

1. Copy your existing .env.local (already backed up)
2. Ensure all required variables are present
3. For prototype testing, Gmail and Slack tokens are critical
4. OpenAI can be omitted for basic message display prototype