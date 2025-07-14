"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Loader2, CreditCard, AlertCircle, CheckCircle, Info } from "lucide-react";
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
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Check for payment success from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');
    
    if (success === 'true' && sessionId) {
      // Payment was successful, show success state
      setSuccess(true);
      setPaymentData({
        sessionId,
        success: true
      });
      
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      // Validate form
      if (!amount || !donorName || !donorEmail) {
        throw new Error("Please fill in all required fields");
      }

      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error("Please enter a valid donation amount");
      }
      
      const amountInCents = Math.round(amountValue * 100);
      if (amountInCents < 500) {
        throw new Error("Minimum donation amount is $5.00");
      }

      // Get reward tier title if selected
      const selectedTier = rewardTiers.find(t => t.id === selectedRewardTier);
      const rewardTierTitle = selectedTier?.title;

      // Check if we're in demo mode (no Stripe configured)
      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInCents,
          currency: "usd",
          campaignId,
          campaignTitle,
          donorName,
          donorEmail,
          isAnonymous,
          message,
          rewardTierId: selectedRewardTier || undefined,
          rewardTierTitle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error && data.error.includes('Stripe is not properly configured')) {
                  // Enter demo mode
        setIsDemoMode(true);
        setSuccess(true);
        setPaymentData({
          amount: amountInCents, // Store in cents to match Stripe format
          donorName,
          donorEmail,
          message,
          isAnonymous,
          rewardTierId: selectedRewardTier,
          rewardTierTitle,
          campaignId,
          campaignTitle,
          isDemo: true
        });
        
        // Store pledge data for demo mode
        const pledgeData = {
          amount: amountInCents,
          donorName,
          donorEmail,
          message,
          isAnonymous,
          rewardTierId: selectedRewardTier,
          rewardTierTitle,
          campaignId,
          campaignTitle,
          isDemo: true
        };
        localStorage.setItem('pledgeIntent', JSON.stringify(pledgeData));
        return;
        }
        throw new Error(data.error || "Failed to create payment");
      }

      // Store pledge data for success page
      const pledgeData = {
        amount: amountInCents, // Store in cents to match Stripe format
        donorName,
        donorEmail,
        message,
        isAnonymous,
        rewardTierId: selectedRewardTier,
        rewardTierTitle,
        campaignId,
        campaignTitle,
        sessionId: data.sessionId
      };
      localStorage.setItem('pledgeIntent', JSON.stringify(pledgeData));

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRewardTierSelect = (tierId: string) => {
    const tier = rewardTiers.find(t => t.id === tierId);
    if (tier) {
      // Amount is stored in cents, convert to dollars for display
      setAmount((tier.amount / 100).toFixed(2));
      setSelectedRewardTier(tierId);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setAmount("");
    setDonorName("");
    setDonorEmail("");
    setMessage("");
    setIsAnonymous(false);
    setSelectedRewardTier("");
    setPaymentData(null);
    setError(null);
    setIsDemoMode(false);
  };

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            {isDemoMode ? "Demo Payment Successful!" : "Pledge Successful!"}
          </CardTitle>
          <CardDescription>
            {isDemoMode 
              ? "This is a demo of the payment flow. In production, this would be a real payment."
              : "Thank you for supporting this amazing project"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isDemoMode && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Demo Mode:</strong> Stripe is not configured. To enable real payments, 
                follow the setup guide in <code className="bg-blue-100 px-1 rounded">STRIPE_SETUP.md</code>
              </AlertDescription>
            </Alert>
          )}

          {paymentData && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg">Your Pledge Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Campaign:</span>
                  <span className="font-medium">{campaignTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reward:</span>
                  <span className="font-medium">
                    {selectedRewardTier 
                      ? rewardTiers.find(t => t.id === selectedRewardTier)?.title || "General Support"
                      : "General Support"
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">${((paymentData.amount || 0) / 100).toFixed(2)}</span>
                </div>
                {isDemoMode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-blue-600">Demo Payment</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What happens next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Confirmation Email</h4>
                  <p className="text-sm text-gray-600">You'll receive a confirmation email with your pledge details</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Campaign Updates</h4>
                  <p className="text-sm text-gray-600">Get notified about campaign progress and updates</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Reward Fulfillment</h4>
                  <p className="text-sm text-gray-600">You'll be contacted about your reward when the campaign ends</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="flex-1"
            >
              Back to Campaign
            </Button>
            <Button
              onClick={() => window.location.href = '/campaigns'}
              className="flex-1"
            >
              Explore More
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600 mb-3">Help spread the word!</p>
            <Button
              onClick={() => {
                const url = window.location.href;
                const text = `I just supported ${campaignTitle} on Bloom! Check it out:`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
              }}
              variant="outline"
              size="sm"
            >
              Share Campaign
            </Button>
          </div>
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

            {/* Preset Amounts */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Quick Amount</Label>
              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 25, 50, 100, 250].map((presetAmount) => (
                  <Button
                    key={presetAmount}
                    type="button"
                    variant="outline"
                    className={`h-12 ${
                      amount === presetAmount.toString() 
                        ? "border-green-500 bg-green-50 text-green-700" 
                        : "hover:border-green-300"
                    }`}
                    onClick={() => setAmount(presetAmount.toString())}
                  >
                    ${presetAmount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-base font-semibold">
                Custom Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  min="5"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                  required
                />
              </div>
              <p className="text-sm text-gray-600">Minimum donation: $5.00</p>
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
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Complete Pledge - ${amount ? parseFloat(amount).toFixed(2) : "0.00"}
                </>
              )}
            </Button>

            <div className="text-center text-sm text-gray-600 space-y-1">
              <p>🔒 Secure payment powered by Stripe</p>
              <p>Platform fee: 5% + $0.30 per donation</p>
              <p>Stripe processing fee: 2.9% + $0.30 (included in total)</p>
              <p>Your payment information is encrypted and secure</p>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default DonationForm;
