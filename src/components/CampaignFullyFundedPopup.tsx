"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, Trophy, Heart, Share2, X } from "lucide-react";

interface CampaignFullyFundedPopupProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  amountRaised: string;
  backerCount: number;
  fundingPercentage: number;
}

export default function CampaignFullyFundedPopup({
  isOpen,
  onClose,
  campaignTitle,
  amountRaised,
  backerCount,
  fundingPercentage,
}: CampaignFullyFundedPopupProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${campaignTitle} - Fully Funded!`,
        text: `Check out this amazing campaign that raised ${amountRaised} from ${backerCount} backers!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Campaign link copied to clipboard!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 shadow-2xl">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Campaign Fully Funded! 🎉
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            This amazing campaign has successfully reached its funding goal and
            beyond!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Campaign Stats */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="font-bold text-lg mb-4 text-gray-900 text-center">
              {campaignTitle}
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-black text-green-600">
                  {amountRaised}
                </div>
                <div className="text-sm text-gray-600 font-medium">Raised</div>
              </div>
              <div>
                <div className="text-2xl font-black text-green-600">
                  {backerCount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-medium">Backers</div>
              </div>
              <div>
                <div className="text-2xl font-black text-green-600">
                  {fundingPercentage}%
                </div>
                <div className="text-sm text-gray-600 font-medium">Funded</div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Heart className="w-5 h-5" />
              <span className="font-semibold">
                Thank you to all supporters!
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              This campaign has exceeded its funding goal thanks to the
              incredible support from the community. The project is now moving
              into production phase.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex items-center gap-2 flex-1"
          >
            <Share2 className="w-4 h-4" />
            Share Success
          </Button>
          <Button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700 text-white flex-1"
          >
            <Heart className="w-4 h-4 mr-2" />
            Explore Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
