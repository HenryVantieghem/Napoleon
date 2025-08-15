create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

do $$ begin
  create type provider_enum as enum ('google','slack');
exception when duplicate_object then null; end $$;

create table if not exists public.nango_connections (
  user_id uuid not null references auth.users(id) on delete cascade,
  provider provider_enum not null,
  connection_id text not null,
  account_id text,
  team_id text,
  created_at timestamptz default now(),
  primary key (user_id, provider)
);

create table if not exists public.message_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider provider_enum not null,
  external_id text not null unique,
  subject text,
  sender text,
  snippet text,
  priority_score int,
  received_at timestamptz not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table nango_connections enable row level security;
alter table message_cache enable row level security;

create policy "own profile" on profiles using (auth.uid() = id) with check (auth.uid() = id);
create policy "owner nango" on nango_connections using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner messages" on message_cache using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_nc_user_provider on public.nango_connections (user_id, provider);
create index if not exists idx_msg_user_provider on public.message_cache (user_id, provider);
create index if not exists idx_msg_received_at on public.message_cache (received_at desc);
create unique index if not exists idx_msg_external_id on public.message_cache (external_id);