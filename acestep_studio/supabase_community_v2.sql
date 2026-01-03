-- Community V2 Update (Idempotent)
-- Run this in Supabase SQL Editor

-- 1. Ensure Likes Table Exists
create table if not exists public.likes (
  user_id uuid references auth.users on delete cascade not null,
  song_id uuid references public.songs on delete cascade not null,
  created_at timestamp with time zone default now(),
  primary key (user_id, song_id)
);

-- 2. Add Metrics to Songs
alter table public.songs add column if not exists play_count bigint default 0;

-- 3. RLS for Likes
alter table public.likes enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Likes are viewable by everyone" on public.likes;
drop policy if exists "Authenticated users can like" on public.likes;
drop policy if exists "Authenticated users can unlike" on public.likes;
drop policy if exists "Users can insert their own likes" on public.likes; -- potential name from old script
drop policy if exists "Users can delete their own likes" on public.likes; -- potential name from old script

-- Re-create Policies
create policy "Likes are viewable by everyone" on public.likes for select using (true);
create policy "Authenticated users can like" on public.likes for insert with check (auth.uid() = user_id);
create policy "Authenticated users can unlike" on public.likes for delete using (auth.uid() = user_id);

-- 4. RPC Function to Increment Play Count safely
create or replace function increment_play_count(song_id uuid)
returns void as $$
begin
  update public.songs
  set play_count = play_count + 1
  where id = song_id;
end;
$$ language plpgsql security definer;
