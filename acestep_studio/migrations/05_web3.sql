-- Web3 Readiness: Future-Proofing for NFTs

-- 1. Add web3 columns to profiles
alter table public.profiles 
add column if not exists wallet_address text;

-- 2. Add web3 columns to songs
alter table public.songs 
add column if not exists content_hash text,
add column if not exists nft_contract_address text,
add column if not exists token_id text,
add column if not exists chain_id int;

-- 3. Indexes for lookup
create index if not exists idx_profiles_wallet on public.profiles(wallet_address);
create index if not exists idx_songs_contract on public.songs(nft_contract_address, token_id);
