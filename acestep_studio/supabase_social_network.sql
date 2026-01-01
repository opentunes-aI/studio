-- SOCIAL NETWORK SCHEMA --
-- Run this in Supabase SQL Editor

-- 1. Profiles Table (Public User Info)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text,
  avatar_url text,
  updated_at timestamp with time zone default now()
);

-- 2. Auto-create Profile on Signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id, 
    -- Fallback to part before @ in email if name is missing
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication errors on re-run
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Likes Table
create table if not exists public.likes (
  user_id uuid references auth.users on delete cascade not null,
  song_id uuid references public.songs on delete cascade not null,
  created_at timestamp with time zone default now(),
  primary key (user_id, song_id)
);

-- 4. Play Counts (Optional but good for ranking)
alter table public.songs add column if not exists play_count bigint default 0;

-- 5. RLS Policies
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select using (true);
create policy "Users can update own profile" 
  on public.profiles for update using (auth.uid() = id);
-- Note: Insert handled by trigger/system

alter table public.likes enable row level security;
create policy "Likes are viewable by everyone" 
  on public.likes for select using (true);
create policy "Users can insert their own likes" 
  on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can delete their own likes" 
  on public.likes for delete using (auth.uid() = user_id);

-- 6. Link Songs to Profiles for Join Queries
alter table public.songs 
  drop constraint if exists fk_songs_profiles;

alter table public.songs 
  add constraint fk_songs_profiles 
  foreign key (user_id) 
  references public.profiles (id);
