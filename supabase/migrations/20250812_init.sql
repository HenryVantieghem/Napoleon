-- Napoleon AI Database Schema
-- Created: 2025-08-12
-- Initial migration with profiles, nango_connections, and message_cache tables

-- profiles table
create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- RLS policy for profiles - users can only see their own profile
create policy "own profile" on public.profiles
  for all using (auth.uid() = id);

-- Provider enum for integrations
create type provider_enum as enum ('google','slack');

-- nango_connections table for OAuth connections
create table if not exists public.nango_connections (
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider provider_enum not null,
  connection_id text not null,
  account_id text,
  team_id text,
  created_at timestamptz default now(),
  primary key (user_id, provider)
);

-- Enable RLS on nango_connections
alter table public.nango_connections enable row level security;

-- RLS policy for nango_connections - users can only see their own connections
create policy "owner nango" on public.nango_connections
  for all using (auth.uid() = user_id);

-- message_cache table for cached messages from providers
create table if not exists public.message_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider provider_enum not null,
  external_id text not null unique,
  subject text,
  sender text,
  snippet text,
  priority_score int,
  received_at timestamptz not null,
  created_at timestamptz default now()
);

-- Enable RLS on message_cache
alter table public.message_cache enable row level security;

-- RLS policy for message_cache - users can only see their own messages
create policy "owner messages" on public.message_cache
  for all using (auth.uid() = user_id);

-- Performance indexes
create index if not exists idx_nango_connections_user_provider on public.nango_connections (user_id, provider);
create index if not exists idx_message_cache_user_provider on public.message_cache (user_id, provider);
create index if not exists idx_message_cache_received_at on public.message_cache (received_at desc);
create unique index if not exists idx_message_cache_external_id on public.message_cache (external_id);