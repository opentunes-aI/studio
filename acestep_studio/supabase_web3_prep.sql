-- Phase 0: Web3 Readiness Prep
-- Adds columns for future blockchain integration (Wallets, IPFS, NFTs)

-- 1. Add wallet_address to profiles (Users can link ETH/SOL wallets)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- 2. Add content_hash and NFT metadata to songs (Tracks can be minted)
ALTER TABLE public.songs 
ADD COLUMN IF NOT EXISTS content_hash TEXT, -- IPFS CID
ADD COLUMN IF NOT EXISTS nft_contract_address TEXT,
ADD COLUMN IF NOT EXISTS token_id TEXT,
ADD COLUMN IF NOT EXISTS chain_id TEXT;

-- 3. Mock Data (Optional: Validate schema)
-- UPDATE public.profiles SET wallet_address = '0x1234567890abcdef1234567890abcdef12345678' WHERE id IN (SELECT id FROM auth.users LIMIT 1);
