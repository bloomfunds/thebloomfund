import { NextRequest, NextResponse } from 'next/server';
import { stripe, isCampaignEligibleForPayout, createPayout } from '@/lib/stripe';
import { getCurrentUser } from '@/lib/supabase';
import { getCampaignById, updateCampaign } from '@/lib/database';

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
    const eligibility = isCampaignEligibleForPayout(campaign);
    if (!eligibility.eligible) {
      return NextResponse.json(
        { error: eligibility.reason },
        { status: 400 }
      );
    }

    // Check if user has a Stripe Connect account
    // This would typically be stored in the user's profile
    // For now, we'll assume they need to set one up
    const userProfile = await getUserProfile(user.id);
    if (!userProfile?.stripe_connect_account_id) {
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
    const payoutAmount = Math.round(campaign.current_funding * 100); // Convert to cents

    // Create payout
    const transfer = await createPayout({
      amount: payoutAmount,
      currency: 'usd',
      connectAccountId: userProfile.stripe_connect_account_id,
      campaignId: campaign.id,
      description: `Payout for campaign: ${campaign.title}`,
    });

    // Update campaign payout status
    await updateCampaign(campaign.id, {
      payout_status: 'processing',
      payout_requested_at: new Date().toISOString(),
      stripe_transfer_id: transfer.id,
    });

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      amount: payoutAmount / 100,
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

// Helper function to get user profile with Stripe Connect account
async function getUserProfile(userId: string) {
  // This would typically fetch from your users table
  // For now, return null to indicate no Connect account
  return null;
} 