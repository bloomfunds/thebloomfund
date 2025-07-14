import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch campaign data
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        reward_tiers (*)
      `)
      .eq('id', id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Fetch campaign stats
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('campaign_id', id)
      .eq('status', 'succeeded');

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
    }

    const totalAmount = payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;
    const totalBackers = payments?.length || 0;

    // Calculate days remaining
    const endDate = new Date(campaign.end_date);
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    const campaignWithStats = {
      ...campaign,
      current_funding: totalAmount,
      total_backers: totalBackers,
      days_remaining: daysRemaining,
      funding_percentage: Math.min(Math.round((totalAmount / campaign.funding_goal) * 100), 100)
    };

    return NextResponse.json(campaignWithStats);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 