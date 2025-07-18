import { NextRequest, NextResponse } from 'next/server';
import { stripe, isCampaignEligibleForPayout, createPayout, calculatePayoutAmount } from '@/lib/stripe';
import { getCurrentUser } from '@/lib/supabase';
import { getCampaignById, updateCampaign, getUserProfile, createCampaignPayout, updatePayoutStatus } from '@/lib/database';
import type { User } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { user } = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get campaign details
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Verify user owns the campaign
    if (campaign.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if campaign is eligible for payout
    const eligibility = isCampaignEligibleForPayout({
      status: campaign.status,
      current_funding: campaign.current_funding,
      funding_goal: campaign.funding_goal,
      end_date: campaign.end_date,
      created_at: campaign.created_at || new Date().toISOString(),
    });
    if (!eligibility.eligible) {
      return NextResponse.json(
        { error: eligibility.reason },
        { status: 400 }
      );
    }

    // Get user profile with Stripe Connect account
    const userProfile: User | null = await getUserProfile(user.id);
    if (!userProfile || !userProfile.stripe_connect_account_id) {
      return NextResponse.json(
        { 
          error: 'Stripe Connect account required',
          action: 'setup_connect_account',
          message: 'You need to set up your Stripe Connect account to receive payouts'
        },
        { status: 400 }
      );
    }

    // Calculate payout amount (after platform fees)
    const totalAmount = campaign.current_funding || 0;
    const payoutAmount = calculatePayoutAmount(totalAmount);
    const payoutAmountCents = Math.round(payoutAmount * 100); // Convert to cents

    // Create payout record in database
    const payout = await createCampaignPayout({
      campaignId: campaign.id,
      userId: user.id,
      amount: payoutAmountCents,
      currency: 'usd',
      stripeConnectAccountId: userProfile.stripe_connect_account_id,
    });

    // Create Stripe transfer
    const transfer = await createPayout({
      amount: payoutAmountCents,
      currency: 'usd',
      connectAccountId: userProfile.stripe_connect_account_id,
      campaignId: campaign.id,
      description: `Payout for campaign: ${campaign.title}`,
    });

    // Update payout status with transfer ID
    await updatePayoutStatus(payout.id, 'processing', transfer.id);

    // Update campaign payout status
    await updateCampaign(campaign.id, {
      payout_status: 'processing',
      payout_requested_at: new Date().toISOString(),
      stripe_transfer_id: transfer.id,
      payout_amount: payoutAmountCents,
    });

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      payoutId: payout.id,
      amount: payoutAmount,
      message: 'Payout request submitted successfully',
    });
  } catch (error) {
    console.error('Error requesting payout:', error);
    return NextResponse.json(
      { error: 'Failed to request payout' },
      { status: 500 }
    );
  }
} 