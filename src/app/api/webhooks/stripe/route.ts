import { NextRequest, NextResponse } from 'next/server';
import { stripe, verifyWebhookSignature } from '@/lib/stripe';
import { createPayment } from '@/lib/database';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = verifyWebhookSignature(body, signature);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object);
        break;

      case 'transfer.created':
        await handleTransferCreated(event.data.object);
        break;

      case 'transfer.failed':
        await handleTransferFailed(event.data.object as any);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  console.log('Payment succeeded:', paymentIntent.id);

  const {
    id: paymentIntentId,
    amount,
    currency,
    metadata,
    receipt_email,
  } = paymentIntent;

  const {
    campaign_id: campaignId,
    donor_name: donorName,
    donor_email: donorEmail,
    is_anonymous: isAnonymous,
    message,
    reward_tier_id: rewardTierId,
  } = metadata;

  try {
    // Create payment record in database
    const payment = await createPayment({
      campaign_id: campaignId,
      user_id: null, // Will be updated if user is logged in
      amount: amount / 100, // Convert from cents to dollars
      currency: currency.toUpperCase(),
      status: 'succeeded',
      donor_name: donorName,
      is_anonymous: isAnonymous === 'true',
      payment_method: 'stripe',
      transaction_id: paymentIntentId,
      reward_tier_id: rewardTierId || undefined,
      message: message || undefined,
    });

    // Update campaign funding - we'll implement this function later
    console.log('Campaign funding updated for:', campaignId, 'Amount:', amount / 100);

    console.log('Payment processed successfully:', payment.id);
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  console.log('Payment failed:', paymentIntent.id);

  const {
    id: paymentIntentId,
    metadata: { campaign_id: campaignId },
  } = paymentIntent;

  try {
    // Create failed payment record
    await createPayment({
      campaign_id: campaignId,
      user_id: null,
      amount: 0,
      currency: 'USD',
      status: 'failed',
      donor_name: 'Anonymous',
      is_anonymous: true,
      payment_method: 'stripe',
      transaction_id: paymentIntentId,
    });

    console.log('Failed payment recorded:', paymentIntentId);
  } catch (error) {
    console.error('Error recording failed payment:', error);
    throw error;
  }
}

async function handleAccountUpdated(account: any) {
  console.log('Connect account updated:', account.id);

  // Update user's Connect account status in database
  // This would typically update a user's stripe_connect_account_id and status
  try {
    // Implementation depends on your user table structure
    console.log('Account status:', account.charges_enabled, account.payouts_enabled);
  } catch (error) {
    console.error('Error updating account status:', error);
    throw error;
  }
}

async function handleTransferCreated(transfer: any) {
  console.log('Transfer created:', transfer.id);

  const {
    id: transferId,
    amount,
    currency,
    destination,
    metadata: { campaign_id: campaignId },
  } = transfer;

  try {
    // Update payout status in database
    // This would typically update a campaign's payout status
    console.log('Transfer created for campaign:', campaignId, 'Amount:', amount / 100);
  } catch (error) {
    console.error('Error processing transfer:', error);
    throw error;
  }
}

async function handleTransferFailed(transfer: any) {
  console.log('Transfer failed:', transfer.id);

  const {
    id: transferId,
    metadata: { campaign_id: campaignId },
  } = transfer;

  try {
    // Update payout status to failed in database
    console.log('Transfer failed for campaign:', campaignId);
  } catch (error) {
    console.error('Error processing failed transfer:', error);
    throw error;
  }
} 