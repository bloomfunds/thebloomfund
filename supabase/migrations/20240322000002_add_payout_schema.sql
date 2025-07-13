-- Add payout-related fields to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS payout_status VARCHAR(20) DEFAULT 'not_eligible' CHECK (payout_status IN ('not_eligible', 'eligible', 'requested', 'processing', 'paid', 'failed', 'expired')),
ADD COLUMN IF NOT EXISTS payout_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payout_processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_transfer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payout_amount BIGINT DEFAULT 0;

-- Add Stripe Connect fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_connect_account_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_connect_status VARCHAR(20) DEFAULT 'not_setup' CHECK (stripe_connect_status IN ('not_setup', 'pending', 'active', 'restricted', 'disabled')),
ADD COLUMN IF NOT EXISTS stripe_connect_onboarded_at TIMESTAMP WITH TIME ZONE;

-- Add payout tracking table
CREATE TABLE IF NOT EXISTS campaign_payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'expired')),
  stripe_transfer_id VARCHAR(255),
  stripe_connect_account_id VARCHAR(255),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for payout queries
CREATE INDEX IF NOT EXISTS idx_campaigns_payout_status ON campaigns(payout_status);
CREATE INDEX IF NOT EXISTS idx_campaigns_payout_requested_at ON campaigns(payout_requested_at);
CREATE INDEX IF NOT EXISTS idx_users_stripe_connect_account_id ON users(stripe_connect_account_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_connect_status ON users(stripe_connect_status);
CREATE INDEX IF NOT EXISTS idx_campaign_payouts_campaign_id ON campaign_payouts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_payouts_user_id ON campaign_payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_payouts_status ON campaign_payouts(status);
CREATE INDEX IF NOT EXISTS idx_campaign_payouts_expires_at ON campaign_payouts(expires_at);

-- Add trigger for payout status updates
CREATE OR REPLACE FUNCTION update_campaign_payout_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update campaign payout status when payout is created/updated
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE campaigns 
    SET 
      payout_status = NEW.status,
      payout_requested_at = CASE WHEN NEW.status = 'pending' THEN NEW.requested_at ELSE payout_requested_at END,
      payout_processed_at = CASE WHEN NEW.status = 'paid' THEN NEW.processed_at ELSE payout_processed_at END,
      stripe_transfer_id = NEW.stripe_transfer_id,
      payout_amount = NEW.amount
    WHERE id = NEW.campaign_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_campaign_payout_status
  AFTER INSERT OR UPDATE ON campaign_payouts
  FOR EACH ROW EXECUTE FUNCTION update_campaign_payout_status();

-- Function to check and update expired payouts
CREATE OR REPLACE FUNCTION check_expired_payouts()
RETURNS VOID AS $$
BEGIN
  -- Update expired payouts
  UPDATE campaign_payouts 
  SET status = 'expired', updated_at = NOW()
  WHERE status IN ('pending', 'processing') 
    AND expires_at < NOW();
    
  -- Update corresponding campaign payout status
  UPDATE campaigns 
  SET payout_status = 'expired', updated_at = NOW()
  WHERE id IN (
    SELECT campaign_id 
    FROM campaign_payouts 
    WHERE status = 'expired' 
      AND updated_at > NOW() - INTERVAL '1 minute'
  );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on new table
ALTER TABLE campaign_payouts ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_payouts
CREATE POLICY "Users can view their own payouts" ON campaign_payouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create payouts for their campaigns" ON campaign_payouts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE id = campaign_payouts.campaign_id 
        AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Campaign owners can update their payouts" ON campaign_payouts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE id = campaign_payouts.campaign_id 
        AND owner_id = auth.uid()
    )
  ); 