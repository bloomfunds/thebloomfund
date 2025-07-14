import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe';
import { getCurrentUser } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      currency = 'usd',
      campaignId,
      donorName,
      donorEmail,
      isAnonymous = false,
      message,
      rewardTierId,
    } = body;

    // Validate required fields
    if (!amount || !campaignId || !donorName || !donorEmail) {
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

    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount,
      currency,
      campaignId,
      donorName,
      donorEmail,
      isAnonymous,
      message,
      rewardTierId,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 