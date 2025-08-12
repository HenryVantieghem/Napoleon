# Nango Integration Setup

## Overview

Napoleon AI now uses Nango for OAuth integrations with Gmail and Slack. This provides a more robust and scalable approach to managing OAuth connections.

## Architecture

```
User clicks "Connect Gmail" → /api/integrations/start?provider=google 
→ Redirects to Nango OAuth flow → User authorizes → Nango webhook 
→ /api/integrations/webhook → Store in nango_connections table
```

## Setup Requirements

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Nango
NANGO_SERVER_URL=https://api.nango.dev
NANGO_SECRET_KEY=your_nango_secret_key
NANGO_WEBHOOK_SECRET=your_webhook_secret (optional)

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Nango Dashboard Setup

1. Create Nango account and project
2. Configure integrations:
   - **Google**: Provider config key `google` with Gmail scopes
   - **Slack**: Provider config key `slack` with appropriate scopes
3. Set webhook URL: `${YOUR_APP_URL}/api/integrations/webhook`
4. Copy secret key to environment variables

### 3. Database Migration

Run the Supabase migration:
```sql
-- Copy contents of supabase/migrations/20250812_init.sql
-- Run in Supabase SQL Editor
```

## API Endpoints

### `/api/integrations/start?provider=google|slack`
- Initiates OAuth flow
- Generates connection ID: `${user.id}-${provider}`
- Redirects to Nango OAuth endpoint

### `/api/integrations/webhook` (POST)
- Receives Nango webhook events
- Stores successful connections in `nango_connections` table
- Verifies webhook signature if configured

### `/api/user/connections` (GET)
- Returns user's connection status
- Replaces old `/api/user/tokens` endpoint
- Compatible with existing UI components

## Testing

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Login Flow**
   - Visit http://localhost:3000/login
   - Enter email for magic link
   - Click link in email
   - Should redirect to dashboard

3. **Test Connection Flow**
   - Click "Connect Gmail" button
   - Should redirect to Nango OAuth flow
   - Complete authorization
   - Should see connection saved in `nango_connections` table

## Database Schema

### `nango_connections` table
```sql
user_id uuid (FK to profiles.id)
provider provider_enum ('google'|'slack')  
connection_id text (${user.id}-${provider})
account_id text (from Nango metadata)
team_id text (for Slack connections)
created_at timestamptz
```

### RLS Policies
- Users can only access their own connections
- Enforced at database level for security

## Migration from Clerk

The integration maintains compatibility with existing UI components by:
- Keeping the same response format in `/api/user/connections`
- Using the same connection status structure
- Preserving button click handlers in `ConnectAccounts` component

## Troubleshooting

### Connection Not Saving
- Check webhook URL configuration in Nango dashboard
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check browser network tab for webhook request status

### OAuth Flow Errors
- Verify Nango provider configuration
- Check scopes match your application needs
- Ensure redirect URLs are configured correctly

### Database Errors
- Confirm migration ran successfully
- Check RLS policies are enabled
- Verify user profile exists in `profiles` table