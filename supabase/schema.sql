-- LLM Bench Database Schema
-- Run these commands in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Tests table (renamed from negotiations)
create table if not exists public.tests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  prompt_text text not null,
  selected_models jsonb not null, -- Array of model IDs tested
  results jsonb, -- Full results including responses from each model
  metrics jsonb, -- Performance metrics (latency, tokens, cost per model)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.tests enable row level security;

-- Tests policies
create policy "Users can view their own tests"
  on public.tests for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tests"
  on public.tests for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tests"
  on public.tests for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tests"
  on public.tests for delete
  using (auth.uid() = user_id);

-- Create indexes for better query performance
create index if not exists tests_user_id_idx on public.tests(user_id);
create index if not exists tests_created_at_idx on public.tests(created_at desc);

-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_tests_updated_at
  before update on public.tests
  for each row
  execute procedure public.handle_updated_at();
