-- Migration: 11_customer_id.sql
-- Add stripe_customer_id to wallets for Portal access

ALTER TABLE wallets
ADD COLUMN stripe_customer_id TEXT;

-- Index for lookups
CREATE INDEX idx_wallets_stripe_customer ON wallets(stripe_customer_id);
