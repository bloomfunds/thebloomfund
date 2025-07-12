"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Loader2, CreditCard, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DonationFormProps {
  campaignId: string;
  campaignTitle: string;
  rewardTiers?: Array<{
    id: string;
    amount: number;
    title: string;
    description: string;
  }>;
}

const DonationForm = ({
  campaignId,
  campaignTitle,
  rewardTiers = [],
}: DonationFormProps) => {
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedRewardTier, setSelectedRewardTier] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      // Validate form
      if (!amount || !donorName || !donorEmail) {
        throw new Error("Please fill in all required fields");
      }

      const amountInCents = Math.round(parseFloat(amount) * 100);
      if (amountInCents < 100) {
        throw new Error("Minimum donation amount is $1.00");
      }

      // Create payment intent
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInCents,
          currency: "usd",
          campaignId,
          donorName,
          donorEmail,
          isAnonymous,
          message,
          rewardTierId: selectedRewardTier || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment");
      }

      // Redirect to Stripe Checkout or handle payment
      // For now, we'll show success message
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRewardTierSelect = (tierId: string) => {
    const tier = rewardTiers.find(t => t.id === tierId);
    if (tier) {
      setAmount((tier.amount / 100).toString());
      setSelectedRewardTier(tierId);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Heart className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Thank You for Your Donation!
          </CardTitle>
          <CardDescription>
            Your payment is being processed. You will receive a confirmation email shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            Your generous contribution will help make this campaign a success.
          </p>
          <Button
            onClick={() => {
              setSuccess(false);
              setAmount("");
              setDonorName("");
              setDonorEmail("");
              setMessage("");
              setIsAnonymous(false);
              setSelectedRewardTier("");
            }}
            className="w-full"
          >
            Make Another Donation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Support {campaignTitle}
          </CardTitle>
          <CardDescription>
            Make a secure donation using your credit card or bank account.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Reward Tiers */}
            {rewardTiers.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Choose a Reward Tier</Label>
                <div className="grid gap-3">
                  {rewardTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedRewardTier === tier.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleRewardTierSelect(tier.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">${(tier.amount / 100).toFixed(2)}</h4>
                          <p className="text-sm font-medium text-gray-900">{tier.title}</p>
                          <p className="text-sm text-gray-600">{tier.description}</p>
                        </div>
                        <div className="w-4 h-4 border-2 rounded-full flex items-center justify-center">
                          {selectedRewardTier === tier.id && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-base font-semibold">
                Donation Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                  required
                />
              </div>
              <p className="text-sm text-gray-600">Minimum donation: $1.00</p>
            </div>

            {/* Donor Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="donorName" className="text-base font-semibold">
                  Your Name
                </Label>
                <Input
                  id="donorName"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donorEmail" className="text-base font-semibold">
                  Email Address
                </Label>
                <Input
                  id="donorEmail"
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-base font-semibold">
                  Message (Optional)
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Leave a message of support..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                />
                <Label htmlFor="anonymous" className="text-sm">
                  Make this donation anonymous
                </Label>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Donate ${amount ? parseFloat(amount).toFixed(2) : "0.00"}
                </>
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              <p>Secure payment powered by Stripe</p>
              <p>Platform fee: 5% + $0.30 per donation</p>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default DonationForm;
