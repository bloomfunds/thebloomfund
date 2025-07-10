"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart, Info } from "lucide-react";
import { RewardTier } from "@/lib/supabase";

interface DonationFormProps {
  campaignId: string;
  campaignTitle?: string;
  rewardTiers?: RewardTier[];
}

const DonationForm = ({
  campaignId,
  campaignTitle = "Campaign",
  rewardTiers = [],
}: DonationFormProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Support {campaignTitle}
          </CardTitle>
          <CardDescription>
            Payment integration coming soon! We're working on adding secure
            payment processing.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Payment System Coming Soon
            </h3>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
              We're currently integrating a secure payment system to enable
              donations and campaign funding. Check back soon to support this
              amazing project!
            </p>

            {/* Show reward tiers for preview */}
            {rewardTiers.length > 0 && (
              <div className="mt-8 space-y-3">
                <h4 className="text-lg font-medium text-gray-900">
                  Available Reward Tiers
                </h4>
                <div className="grid gap-3 max-w-md mx-auto">
                  {rewardTiers.map((tier) => (
                    <Card key={tier.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-green-600">
                              ${tier.amount}
                            </span>
                            <span className="text-sm text-gray-600">
                              - {tier.title}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {tier.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationForm;
