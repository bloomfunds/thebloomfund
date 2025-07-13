import Stripe from 'stripe';

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

// Platform fee configuration (5% + $0.30)
export const PLATFORM_FEE_PERCENTAGE = 5; // 5%
export const PLATFORM_FEE_FIXED = 30; // $0.30 in cents

// Calculate platform fee
export function calculatePlatformFee(amount: number): number {
  const percentageFee = Math.round(amount * (PLATFORM_FEE_PERCENTAGE / 100));
  return percentageFee + PLATFORM_FEE_FIXED;
}

// Calculate amount after platform fee
export function calculateAmountAfterFee(amount: number): number {
  return amount - calculatePlatformFee(amount);
}

// Payout policy constants
export const PAYOUT_POLICY = {
  DAYS_AFTER_CAMPAIGN_END: 7,
  CLAIM_WINDOW_DAYS: 30,
  MINIMUM_GOAL_REQUIRED: true,
} as const;

// Stripe Connect account status
export type ConnectAccountStatus = 'pending' | 'active' | 'restricted' | 'disabled';

// Payment intent status
export type PaymentIntentStatus = 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';

// Campaign payout status
export type PayoutStatus = 'not_eligible' | 'eligible' | 'requested' | 'processing' | 'paid' | 'failed' | 'expired';

// Create a payment intent for a donation
export async function createPaymentIntent(params: {
  amount: number;
  currency: string;
  campaignId: string;
  donorName: string;
  donorEmail: string;
  isAnonymous: boolean;
  message?: string;
  rewardTierId?: string;
}): Promise<Stripe.PaymentIntent> {
  const { amount, currency, campaignId, donorName, donorEmail, isAnonymous, message, rewardTierId } = params;

  // Calculate platform fee
  const platformFee = calculatePlatformFee(amount);
  const amountAfterFee = amount - platformFee;

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    application_fee_amount: platformFee,
    metadata: {
      campaign_id: campaignId,
      donor_name: donorName,
      donor_email: donorEmail,
      is_anonymous: isAnonymous.toString(),
      message: message || '',
      reward_tier_id: rewardTierId || '',
    },
    receipt_email: donorEmail,
    description: `Donation to campaign ${campaignId}`,
  });

  return paymentIntent;
}

// Create a Stripe Connect account for a campaign creator
export async function createConnectAccount(params: {
  email: string;
  businessName: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<Stripe.Account> {
  const { email, businessName, firstName, lastName, phone } = params;

  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    email,
    business_type: 'individual',
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
    business_profile: {
      name: businessName,
      url: 'https://thebloomfund.com',
    },
    individual: {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
    },
  });

  return account;
}

// Get Connect account details
export async function getConnectAccount(accountId: string): Promise<Stripe.Account> {
  return await stripe.accounts.retrieve(accountId);
}

// Create a payout to a campaign creator
export async function createPayout(params: {
  amount: number;
  currency: string;
  connectAccountId: string;
  campaignId: string;
  description: string;
}): Promise<Stripe.Transfer> {
  const { amount, currency, connectAccountId, campaignId, description } = params;

  const transfer = await stripe.transfers.create({
    amount,
    currency,
    destination: connectAccountId,
    metadata: {
      campaign_id: campaignId,
      description,
    },
  });

  return transfer;
}

// Verify webhook signature
export function verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

// Get payment intent details
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

// Refund a payment
export async function refundPayment(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  };

  if (amount) {
    refundParams.amount = amount;
  }

  return await stripe.refunds.create(refundParams);
}

// Check if a campaign is eligible for payout
export function isCampaignEligibleForPayout(campaign: {
  status: string;
  current_funding: number | null;
  funding_goal: number;
  end_date: string;
  created_at: string;
}): { eligible: boolean; reason?: string } {
  const now = new Date();
  const endDate = new Date(campaign.end_date);
  const daysSinceEnd = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));

  // Check if campaign has ended (either completed or past end date)
  if (campaign.status !== 'completed' && now < endDate) {
    return { eligible: false, reason: 'Campaign has not ended' };
  }

  // Check if 7 days have passed since campaign end
  if (daysSinceEnd < PAYOUT_POLICY.DAYS_AFTER_CAMPAIGN_END) {
    return { eligible: false, reason: `Payout available in ${PAYOUT_POLICY.DAYS_AFTER_CAMPAIGN_END - daysSinceEnd} days` };
  }

  // Check if 30-day window has expired
  if (daysSinceEnd > PAYOUT_POLICY.DAYS_AFTER_CAMPAIGN_END + PAYOUT_POLICY.CLAIM_WINDOW_DAYS) {
    return { eligible: false, reason: 'Payout window has expired' };
  }

  // Check if campaign reached goal
  if (PAYOUT_POLICY.MINIMUM_GOAL_REQUIRED && (campaign.current_funding || 0) < campaign.funding_goal) {
    return { eligible: false, reason: 'Campaign did not reach funding goal' };
  }

  return { eligible: true };
}

// Calculate payout amount after platform fees
export function calculatePayoutAmount(totalAmount: number): number {
  return calculateAmountAfterFee(totalAmount);
}

// Calculate days remaining for payout
export function getPayoutDaysRemaining(campaignEndDate: string): number {
  const now = new Date();
  const endDate = new Date(campaignEndDate);
  const daysSinceEnd = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const totalWindow = PAYOUT_POLICY.DAYS_AFTER_CAMPAIGN_END + PAYOUT_POLICY.CLAIM_WINDOW_DAYS;
  const daysRemaining = totalWindow - daysSinceEnd;
  
  return Math.max(0, daysRemaining);
} 