"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  Heart,
  Mail,
  ArrowRight,
  Calendar,
  Users,
  Gift,
  Share2,
} from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pledgeData, setPledgeData] = useState<any>(null);

  useEffect(() => {
    // Get pledge data from localStorage
    const storedPledge = localStorage.getItem('pledgeIntent');
    if (storedPledge) {
      setPledgeData(JSON.parse(storedPledge));
    }
  }, []);

  const campaignId = searchParams.get("campaign");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-0 shadow-2xl rounded-3xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Pledge Successful!
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Thank you for supporting this amazing project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Pledge Details */}
          {pledgeData && (
            <div className="bg-green-50 rounded-2xl p-6">
              <h3 className="font-semibold text-lg text-green-800 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Your Pledge Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Campaign:</span>
                  <span className="font-medium">{pledgeData.campaignTitle}</span>
                </div>
                {pledgeData.tierTitle && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reward:</span>
                    <span className="font-medium">{pledgeData.tierTitle}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-green-600 text-lg">
                    ${((pledgeData.amount || 0) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">What happens next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Confirmation Email</div>
                  <div className="text-sm text-gray-600">
                    You'll receive a confirmation email with your pledge details
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Campaign Updates</div>
                  <div className="text-sm text-gray-600">
                    Get notified about campaign progress and updates
                  </div>
                </div>
              </div>
              {pledgeData?.tierTitle && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Gift className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Reward Fulfillment</div>
                    <div className="text-sm text-gray-600">
                      You'll be contacted about your reward when the campaign ends
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild className="flex-1 bg-green-600 hover:bg-green-700">
              <Link href={`/campaigns/${campaignId}`}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Back to Campaign
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/campaigns">
                <Share2 className="w-4 h-4 mr-2" />
                Explore More
              </Link>
            </Button>
          </div>

          {/* Share Section */}
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <h4 className="font-semibold text-gray-900 mb-2">Help spread the word!</h4>
            <p className="text-sm text-gray-600 mb-4">
              Share this campaign with your friends and family
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: pledgeData?.campaignTitle || "Amazing Campaign",
                      text: "I just supported this incredible project!",
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Campaign link copied to clipboard!");
                  }
                }}
              >
                Share Campaign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
