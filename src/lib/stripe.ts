import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

// Platform fee configuration (5% + $0.30)
export const PLATFORM_FEE_PERCENTAGE = 5; // 5%
export const PLATFORM_FEE_FIXED = 30; // $0.30 in cents

// Stripe fee configuration (2.9% + $0.30)
export const STRIPE_FEE_PERCENTAGE = 2.9; // 2.9%
export const STRIPE_FEE_FIXED = 30; // $0.30 in cents

// Calculate the total amount needed to ensure we get our full platform fee
// This accounts for both Stripe fees and our platform fees
export function calculateTotalAmountForPlatformFee(desiredNetAmount: number): number {
  // For now, we'll charge the platform fee on top of the donation amount
  // This means if someone wants to donate $100, they pay $100 + platform fee
  const platformFee = Math.round(desiredNetAmount * (PLATFORM_FEE_PERCENTAGE / 100)) + PLATFORM_FEE_FIXED;
  return desiredNetAmount + platformFee;
}

// Calculate platform fee from the total amount
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

// Check if Stripe is properly configured
export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && 
           process.env.STRIPE_SECRET_KEY !== 'sk_test_dummy' && 
           process.env.STRIPE_SECRET_KEY.startsWith('sk_'));
}

// Create a Stripe Checkout Session for a donation
export async function createCheckoutSession(params: {
  amount: number;
  currency: string;
  campaignId: string;
  campaignTitle: string;
  donorName: string;
  donorEmail: string;
  isAnonymous: boolean;
  message?: string;
  rewardTierId?: string;
  rewardTierTitle?: string;
}): Promise<Stripe.Checkout.Session> {
  const { 
    amount, 
    currency, 
    campaignId, 
    campaignTitle,
    donorName, 
    donorEmail, 
    isAnonymous, 
    message, 
    rewardTierId,
    rewardTierTitle 
  } = params;

  // Check if Stripe is properly configured
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not properly configured. Please set STRIPE_SECRET_KEY environment variable. See STRIPE_SETUP.md for setup instructions.');
  }

  // Calculate the total amount needed to ensure we get our full platform fee
  const totalAmount = calculateTotalAmountForPlatformFee(amount);
  const platformFee = calculatePlatformFee(amount);
  const amountAfterFee = amount; // The campaign gets the original amount

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: currency,
          product_data: {
            name: `Donation to ${campaignTitle}`,
            description: rewardTierTitle || 'General Support',
            images: ['https://thebloomfund.com/logo.png'],
          },
          unit_amount: totalAmount, // Use the calculated total amount
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/campaigns/${campaignId}?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/campaigns/${campaignId}?canceled=true`,
    customer_email: donorEmail,
    metadata: {
      campaign_id: campaignId,
      campaign_title: campaignTitle,
      donor_name: donorName,
      donor_email: donorEmail,
      is_anonymous: isAnonymous.toString(),
      message: message || '',
      reward_tier_id: rewardTierId || '',
      reward_tier_title: rewardTierTitle || '',
      platform_fee: platformFee.toString(),
      amount_after_fee: amountAfterFee.toString(),
      original_amount: amount.toString(), // Store the original requested amount
    },
  });

  return session;
}

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

  // Check if Stripe is properly configured
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not properly configured. Please set STRIPE_SECRET_KEY environment variable. See STRIPE_SETUP.md for setup instructions.');
  }

  // Calculate the total amount needed to ensure we get our full platform fee
  const totalAmount = calculateTotalAmountForPlatformFee(amount);
  const platformFee = calculatePlatformFee(amount);
  const amountAfterFee = amount; // The campaign gets the original amount

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount, // Use the calculated total amount
    currency,
    metadata: {
      campaign_id: campaignId,
      donor_name: donorName,
      donor_email: donorEmail,
      is_anonymous: isAnonymous.toString(),
      message: message || '',
      reward_tier_id: rewardTierId || '',
      original_amount: amount.toString(), // Store the original requested amount
      platform_fee: platformFee.toString(),
      amount_after_fee: amountAfterFee.toString(),
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

  // Check if Stripe is properly configured
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not properly configured. Please set STRIPE_SECRET_KEY environment variable. See STRIPE_SETUP.md for setup instructions.');
  }

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

  // Check if Stripe is properly configured
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not properly configured. Please set STRIPE_SECRET_KEY environment variable. See STRIPE_SETUP.md for setup instructions.');
  }

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