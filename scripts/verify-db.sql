-- Verification script for Napoleon AI database setup
-- Run this in Supabase SQL Editor to verify migration success

-- Check if tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'nango_connections', 'message_cache')
ORDER BY table_name;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'nango_connections', 'message_cache')
ORDER BY tablename;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'nango_connections', 'message_cache')
ORDER BY tablename, policyname;

-- Check indexes
SELECT indexname, tablename, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'nango_connections', 'message_cache')
ORDER BY tablename, indexname;

-- Check enum type
SELECT typname, enumlabel 
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE typname = 'provider_enum'
ORDER BY enumsortorder;

-- Test profile insert (will fail without auth context, which is expected)
-- This demonstrates RLS is working
-- SELECT * FROM profiles;