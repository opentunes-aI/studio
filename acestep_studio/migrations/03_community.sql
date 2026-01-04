-- 1. Public Access to Songs (For Feed Sharing)
-- Note: 'Users can view own songs' from 01_core_schema might conflict if we want TRUE public access.
-- We will create a broad policy for reading.
drop policy if exists "Users can view own songs" on public.songs;
create policy "Public can view songs" on public.songs for select using (true);

-- 2. Likes Table
create table if not exists public.likes (
  user_id uuid references auth.users on delete cascade not null,
  song_id uuid references public.songs on delete cascade not null,
  created_at timestamp with time zone default now(),
  primary key (user_id, song_id)
);

-- 3. Add Play Count to Songs
alter table public.songs add column if not exists play_count bigint default 0;

-- 4. RLS for Likes
alter table public.likes enable row level security;

-- Avoid policy conflicts by dropping first
drop policy if exists "Likes are viewable by everyone" on public.likes;
drop policy if exists "Authenticated users can like" on public.likes;
drop policy if exists "Authenticated users can unlike" on public.likes;

create policy "Likes are viewable by everyone" on public.likes for select using (true);
create policy "Authenticated users can like" on public.likes for insert with check (auth.uid() = user_id);
create policy "Authenticated users can unlike" on public.likes for delete using (auth.uid() = user_id);

-- 5. Foreign Key Link to Profiles (Optimization)
alter table public.songs drop constraint if exists fk_songs_profiles;
alter table public.songs add constraint fk_songs_profiles foreign key (user_id) references public.profiles (id);

-- 6. RPC: Increment Play Count
create or replace function increment_play_count(song_id uuid)
returns void as $$
begin
  update public.songs
  set play_count = play_count + 1
  where id = song_id;
end;
$$ language plpgsql security definer;
