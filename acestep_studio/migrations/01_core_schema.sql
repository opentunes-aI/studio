-- 1. Create Songs Table
create table if not exists public.songs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text default 'Untitled',
  prompt text,
  lyrics text,
  duration float,
  seed bigint,
  audio_url text, -- Will be filled if we upload to Supabase Storage
  local_filename text, -- Reference to local file (e.g. output_123.wav)
  tags text[],
  status text default 'completed',
  meta jsonb -- Store extra params like steps, cfg, etc.
);

-- 2. Enable Security (RLS)
alter table public.songs enable row level security;

-- 3. Create Policies
-- Allow users to view their own songs (Base rule)
create policy "Users can view own songs" 
on public.songs for select 
using (auth.uid() = user_id);

-- Allow users to insert their own songs
create policy "Users can insert own songs" 
on public.songs for insert 
with check (auth.uid() = user_id);

-- Allow users to delete their own songs
create policy "Users can delete own songs" 
on public.songs for delete 
using (auth.uid() = user_id);

-- 4. Create Storage Bucket (required for MP3 backup)
insert into storage.buckets (id, name, public) values ('music', 'music', true)
on conflict (id) do nothing;

create policy "Storage Public Access" on storage.objects for select using ( bucket_id = 'music' );
create policy "Storage User Upload" on storage.objects for insert with check ( bucket_id = 'music' and auth.uid() = owner );
