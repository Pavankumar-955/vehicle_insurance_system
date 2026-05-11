-- Migration: Add claim settlement type column to claims table
-- This handles existing databases that don't have the column yet

ALTER TABLE claims DROP COLUMN IF EXISTS claim_amount;

ALTER TABLE claims ADD COLUMN IF NOT EXISTS claim_settlement_type VARCHAR(20) NOT NULL DEFAULT 'CASHLESS' 
  AFTER claim_description;

-- Rename column if it was previously named coverage_type
ALTER TABLE claims CHANGE COLUMN IF EXISTS coverage_type claim_settlement_type VARCHAR(20) NOT NULL DEFAULT 'CASHLESS';

-- Update any existing claims to have CASHLESS as default
UPDATE claims SET claim_settlement_type = 'CASHLESS' WHERE claim_settlement_type IS NULL;

ALTER TABLE claims MODIFY claim_settlement_type VARCHAR(20) NOT NULL;
