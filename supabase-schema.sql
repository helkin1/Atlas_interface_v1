-- ============================================================
-- Atlas Fitness — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Profiles (theme preference + onboarding/profile data, created on signup)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  theme text default 'dark',
  profile_data jsonb default null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Plans (one active plan per user, stored as JSONB)
create table if not exists plans (
  user_id uuid references auth.users on delete cascade primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 3. Workout logs (all logs in a single JSONB blob per user)
create table if not exists workout_logs (
  user_id uuid references auth.users on delete cascade primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 4. Session metadata (all session meta in JSONB per user)
create table if not exists session_meta (
  user_id uuid references auth.users on delete cascade primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ============================================================
-- Row Level Security — users can only access their own data
-- ============================================================

alter table profiles enable row level security;
alter table plans enable row level security;
alter table workout_logs enable row level security;
alter table session_meta enable row level security;

-- Profiles
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Plans
create policy "Users can view own plan"
  on plans for select using (auth.uid() = user_id);
create policy "Users can insert own plan"
  on plans for insert with check (auth.uid() = user_id);
create policy "Users can update own plan"
  on plans for update using (auth.uid() = user_id);

-- Workout logs
create policy "Users can view own logs"
  on workout_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs"
  on workout_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own logs"
  on workout_logs for update using (auth.uid() = user_id);

-- Session meta
create policy "Users can view own sessions"
  on session_meta for select using (auth.uid() = user_id);
create policy "Users can insert own sessions"
  on session_meta for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions"
  on session_meta for update using (auth.uid() = user_id);

-- ============================================================
-- Auto-create profile row on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Migration: add profile_data column (run on existing databases)
-- ============================================================
-- If you already have the profiles table without profile_data, run:
--
--   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_data jsonb DEFAULT null;
--   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
--
