-- Add is_public column to songs if it doesn't exist
alter table public.songs 
add column if not exists is_public boolean default true;

-- Update RLS policies to allow public viewing
create policy "Public songs are viewable by everyone" 
on public.songs for select 
using (is_public = true);

-- Enable realtime for songs (optional, for live feed)
alter publication supabase_realtime add table songs;

-- Index for performance
create index if not exists songs_is_public_idx on public.songs(is_public);
create index if not exists songs_created_at_idx on public.songs(created_at desc);
