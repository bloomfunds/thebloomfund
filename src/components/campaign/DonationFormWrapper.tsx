"use client";

import DonationForm from "./DonationForm";
import { RewardTier } from "@/lib/supabase";

interface DonationFormWrapperProps {
  campaignId: string;
  campaignTitle: string;
  rewardTiers: RewardTier[];
}

export default function DonationFormWrapper({
  campaignId,
  campaignTitle,
  rewardTiers,
}: DonationFormWrapperProps) {
  return (
    <DonationForm
      campaignId={campaignId}
      campaignTitle={campaignTitle}
      rewardTiers={rewardTiers}
    />
  );
}
