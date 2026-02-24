-- PMPilot Database Schema
-- Run this in the Supabase SQL Editor to set up all tables and RLS policies.

-- ============================================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  role text not null default 'Member',
  timezone text not null default 'UTC',
  avatar_color text not null default '#FF5A5F',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 2. PROJECTS
-- ============================================================================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  key text not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users can read own projects"
  on public.projects for select using (auth.uid() = owner_id);

create policy "Users can insert own projects"
  on public.projects for insert with check (auth.uid() = owner_id);

create policy "Users can update own projects"
  on public.projects for update using (auth.uid() = owner_id);

create policy "Users can delete own projects"
  on public.projects for delete using (auth.uid() = owner_id);

-- ============================================================================
-- 3. TICKETS
-- ============================================================================
create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'To Do',
  priority text not null default 'Medium',
  type text not null default 'Task',
  project_id uuid references public.projects(id) on delete cascade not null,
  assignee_id uuid references public.profiles(id) on delete set null,
  jira_key text,
  story_points integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tickets_project on public.tickets(project_id);
create index idx_tickets_assignee on public.tickets(assignee_id);
create index idx_tickets_status on public.tickets(status);

alter table public.tickets enable row level security;

-- Users can see tickets in their projects
create policy "Users can read project tickets"
  on public.tickets for select
  using (
    project_id in (select id from public.projects where owner_id = auth.uid())
  );

create policy "Users can insert project tickets"
  on public.tickets for insert
  with check (
    project_id in (select id from public.projects where owner_id = auth.uid())
  );

create policy "Users can update project tickets"
  on public.tickets for update
  using (
    project_id in (select id from public.projects where owner_id = auth.uid())
  );

create policy "Users can delete project tickets"
  on public.tickets for delete
  using (
    project_id in (select id from public.projects where owner_id = auth.uid())
  );

-- ============================================================================
-- 4. TEAM MEMBERS
-- ============================================================================
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  role text not null,
  email text not null,
  github text,
  slack text,
  expertise text[] not null default '{}',
  avatar_color text not null default '#FF5A5F',
  velocity integer not null default 0,
  capacity integer not null default 100,
  active_tasks integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.team_members enable row level security;

-- For now, all authenticated users can read team members
create policy "Authenticated users can read team members"
  on public.team_members for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert team members"
  on public.team_members for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update team members"
  on public.team_members for update using (auth.role() = 'authenticated');

-- ============================================================================
-- 5. INTEGRATIONS
-- ============================================================================
create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null, -- 'github', 'jira', 'slack'
  access_token text,
  refresh_token text,
  status text not null default 'disconnected',
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, type)
);

alter table public.integrations enable row level security;

create policy "Users can read own integrations"
  on public.integrations for select using (auth.uid() = user_id);

create policy "Users can insert own integrations"
  on public.integrations for insert with check (auth.uid() = user_id);

create policy "Users can update own integrations"
  on public.integrations for update using (auth.uid() = user_id);

create policy "Users can delete own integrations"
  on public.integrations for delete using (auth.uid() = user_id);

-- ============================================================================
-- 6. CONVERSATIONS
-- ============================================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.conversations enable row level security;

create policy "Users can read own conversations"
  on public.conversations for select using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on public.conversations for insert with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.conversations for update using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on public.conversations for delete using (auth.uid() = user_id);

-- ============================================================================
-- 7. MESSAGES
-- ============================================================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null, -- 'user' or 'assistant'
  content text not null,
  attachments jsonb,
  created_at timestamptz not null default now()
);

create index idx_messages_conversation on public.messages(conversation_id);

alter table public.messages enable row level security;

create policy "Users can read own messages"
  on public.messages for select
  using (
    conversation_id in (select id from public.conversations where user_id = auth.uid())
  );

create policy "Users can insert own messages"
  on public.messages for insert
  with check (
    conversation_id in (select id from public.conversations where user_id = auth.uid())
  );

-- ============================================================================
-- Helper: auto-update updated_at timestamp
-- ============================================================================
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger set_tickets_updated_at
  before update on public.tickets
  for each row execute function public.update_updated_at();

create trigger set_integrations_updated_at
  before update on public.integrations
  for each row execute function public.update_updated_at();

create trigger set_conversations_updated_at
  before update on public.conversations
  for each row execute function public.update_updated_at();
