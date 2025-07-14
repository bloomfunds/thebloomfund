import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { getCurrentUser } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      currency = 'usd',
      campaignId,
      campaignTitle,
      donorName,
      donorEmail,
      isAnonymous = false,
      message,
      rewardTierId,
      rewardTierTitle,
    } = body;

    // Validate required fields
    if (!amount || !campaignId || !campaignTitle || !donorName || !donorEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount (minimum $10)
    if (amount < 1000) { // $10.00 in cents
      return NextResponse.json(
        { error: 'Minimum donation amount is $10.00' },
        { status: 400 }
      );
    }

    // Get current user if logged in
    let userId: string | undefined;
    try {
      const { user } = await getCurrentUser();
      userId = user?.id;
    } catch (error) {
      // User not logged in, that's okay for donations
    }

    // Create checkout session
    const session = await createCheckoutSession({
      amount,
      currency,
      campaignId,
      campaignTitle,
      donorName,
      donorEmail,
      isAnonymous,
      message,
      rewardTierId,
      rewardTierTitle,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Return the actual error message for better debugging
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 