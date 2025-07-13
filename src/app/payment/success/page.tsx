"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const paymentIntentId = searchParams.get("payment_intent");
    const campaignId = searchParams.get("campaign_id");
    
    if (paymentIntentId) {
      // In a real implementation, you would verify the payment with Stripe
      setPaymentDetails({
        paymentIntentId,
        campaignId,
        amount: searchParams.get("amount"),
        campaignTitle: searchParams.get("campaign_title") || "Campaign"
      });
    }
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
            <p className="text-lg text-gray-700">Processing your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Thank you for your generous donation to{" "}
              <span className="font-semibold">{paymentDetails?.campaignTitle}</span>!
            </p>
            {paymentDetails?.amount && (
              <p className="text-lg font-semibold text-green-600">
                Amount: ${(parseFloat(paymentDetails.amount) / 100).toFixed(2)}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              You will receive a confirmation email shortly with your receipt.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            {paymentDetails?.campaignId && (
              <Button asChild variant="outline" className="w-full">
                <Link href={`/campaigns/${paymentDetails.campaignId}`}>
                  <Heart className="mr-2 h-4 w-4" />
                  View Campaign
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
