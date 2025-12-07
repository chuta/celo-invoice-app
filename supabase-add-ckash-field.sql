-- Add is_ckash_wallet field to profiles table
-- This field tracks whether a user's wallet address is a cKASH wallet
-- cKASH (https://ckash.app/) is a CeloAfricaDAO payment dApp

-- Add the column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_ckash_wallet BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN profiles.is_ckash_wallet IS 'Indicates if the wallet address is a cKASH wallet (https://ckash.app/)';

-- Update existing records to have default value
UPDATE profiles 
SET is_ckash_wallet = FALSE 
WHERE is_ckash_wallet IS NULL;

-- Create index for potential analytics queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_ckash_wallet 
ON profiles(is_ckash_wallet) 
WHERE is_ckash_wallet = TRUE;
