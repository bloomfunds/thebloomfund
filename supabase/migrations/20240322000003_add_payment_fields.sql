-- Add missing fields to payments table for Stripe integration
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'stripe',
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS reward_tier_id UUID REFERENCES reward_tiers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS message TEXT;

-- Add indexes for payment queries
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_reward_tier_id ON payments(reward_tier_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);

-- Update payment status enum to include 'refunded'
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE payments 
ADD CONSTRAINT payments_status_check 
CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded'));

-- Add RLS policies for payments if not already present
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view payments for campaigns they own
CREATE POLICY "Campaign owners can view payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE id = payments.campaign_id 
        AND owner_id = auth.uid()
    )
  );

-- Anyone can create payments (for donations)
CREATE POLICY "Anyone can create payments" ON payments
  FOR INSERT WITH CHECK (true);

-- Only campaign owners can update payment status
CREATE POLICY "Campaign owners can update payments" ON payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE id = payments.campaign_id 
        AND owner_id = auth.uid()
    )
  ); 