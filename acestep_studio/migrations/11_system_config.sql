-- 11_system_config.sql
-- Purpose: Dynamic Service Discovery for Free Tier Backend (Colab/Ngrok)

-- 1. Create Key-Value Store
create table if not exists system_config (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Enable Security
alter table system_config enable row level security;

-- 3. Policy: Public Read Access
-- We allow anyone (anon key) to READ the URL so the frontend can connect.
create policy "Allow public read"
on system_config for select
using (true);

-- 4. Policy: Service Role Write Access
-- By default, the Service Role (used by Python Backend) bypasses RLS.
-- So we don't strictly need a policy for it, but if we ever use a restricted user:
-- create policy "Allow backend update" on system_config for update using (auth.role() = 'service_role');

-- 5. Seed Default
insert into system_config (key, value)
values ('api_url', 'http://localhost:8000')
on conflict (key) do nothing;
