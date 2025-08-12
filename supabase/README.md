# Napoleon AI Database Setup

## Migration Instructions

### Option 1: Using Supabase SQL Editor
1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `migrations/20250812_init.sql`
4. Click "Run" to execute the migration

### Option 2: Using Supabase CLI (if set up)
```bash
supabase db push
```

## Database Schema

### Tables Created

**profiles**
- Primary user profiles linked to Supabase Auth
- RLS enabled: users can only access their own profile
- Auto-backfilled on dashboard login

**nango_connections** 
- OAuth connections via Nango for Google/Slack
- RLS enabled: users can only access their own connections
- Primary key: (user_id, provider)

**message_cache**
- Cached messages from integrated providers
- RLS enabled: users can only access their own messages
- Optimized indexes for user queries

### Verification

Run the verification script in SQL Editor:
```sql
-- Copy contents of /scripts/verify-db.sql
```

Expected results:
- 3 tables exist with RLS enabled
- 3 RLS policies created (one per table)
- Performance indexes created
- provider_enum type with 'google' and 'slack' values

## Environment Variables Required

Add to your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing Authentication Flow

1. Run `npm run dev`
2. Visit `/login`
3. Enter email for magic link
4. Check email and click link
5. Should redirect to `/dashboard`
6. Profile should be auto-created in database