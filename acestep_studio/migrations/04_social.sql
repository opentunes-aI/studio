-- Social V3: Follows & Messages

-- 1. Follows Table
create table if not exists public.follows (
    follower_id uuid references auth.users on delete cascade not null,
    following_id uuid references auth.users on delete cascade not null,
    created_at timestamp with time zone default now(),
    primary key (follower_id, following_id)
);

alter table public.follows enable row level security;
create policy "Public can view follows" on public.follows for select using (true);
create policy "Users can follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows for delete using (auth.uid() = follower_id);

-- 2. Messages Table
create table if not exists public.messages (
    id uuid default gen_random_uuid() primary key,
    sender_id uuid references auth.users on delete cascade not null,
    recipient_id uuid references auth.users on delete cascade not null,
    content text not null,
    is_read boolean default false,
    created_at timestamp with time zone default now()
);

alter table public.messages enable row level security;
create policy "Users can read own messages" 
    on public.messages for select 
    using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Users can send messages" 
    on public.messages for insert 
    with check (auth.uid() = sender_id);

-- 3. Indexes
create index if not exists idx_messages_recipient on public.messages(recipient_id);
create index if not exists idx_follows_follower on public.follows(follower_id);
create index if not exists idx_follows_following on public.follows(following_id);
