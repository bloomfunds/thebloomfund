"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Gift,
  Heart,
  Lock,
  MapPin,
  Shield,
  Star,
  Users,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Campaign {
  id: string;
  title: string;
  description: string;
  business_name: string;
  owner_name: string;
  owner_avatar?: string;
  cover_image?: string;
  funding_goal: number;
  current_funding: number;
  start_date: string;
  end_date: string;
  location: string;
  category: string;
  reward_tiers?: RewardTier[];
}

interface RewardTier {
  id: string;
  amount: number;
  title: string;
  description: string;
  display_order: number;
}

interface PledgeData {
  campaignId: string;
  campaignTitle: string;
  tierId?: string;
  tierTitle?: string;
  amount: number;
  customAmount?: number;
  firstName: string;
  lastName: string;
  email: string;
  message?: string;
  isAnonymous: boolean;
  paymentMethod: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [selectedTier, setSelectedTier] = useState<RewardTier | null>(null);
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [pledgeData, setPledgeData] = useState<PledgeData>({
    campaignId: "",
    campaignTitle: "",
    amount: 0,
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    isAnonymous: false,
    paymentMethod: "card",
  });

  const campaignId = searchParams.get("campaign");
  const tierId = searchParams.get("tier");
  const amount = searchParams.get("amount");

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      // Fetch real campaign data from the database
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch campaign');
      }
      
      const campaignData = await response.json();
      const campaign: Campaign = {
        id: campaignData.id,
        title: campaignData.title,
        description: campaignData.description,
        business_name: campaignData.business_name,
        owner_name: campaignData.owner_name,
        owner_avatar: campaignData.owner_avatar,
        cover_image: campaignData.cover_image,
        funding_goal: campaignData.funding_goal,
        current_funding: campaignData.current_funding || 0,
        start_date: campaignData.start_date,
        end_date: campaignData.end_date,
        location: campaignData.location,
        category: campaignData.category,
        reward_tiers: campaignData.reward_tiers || [],
      };

      setCampaign(campaign);
      setPledgeData(prev => ({
        ...prev,
        campaignId: campaignId!,
        campaignTitle: campaign.title,
      }));

      // Set selected tier if provided
      if (tierId && campaign.reward_tiers) {
        const tier = campaign.reward_tiers.find((t: RewardTier) => t.id === tierId);
        if (tier) {
          setSelectedTier(tier);
          setPledgeData(prev => ({
            ...prev,
            tierId: tier.id,
            tierTitle: tier.title,
            amount: tier.amount,
          }));
        }
      }

      // Set custom amount if provided
      if (amount && !tierId) {
        const amountValue = parseInt(amount);
        if (amountValue > 0) {
          setCustomAmount(amountValue);
          setPledgeData(prev => ({
            ...prev,
            amount: amountValue,
            customAmount: amountValue,
          }));
        }
      }
    } catch (err) {
      setError("Failed to load campaign details");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const calculateFundingPercentage = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  const handleTierSelection = (tier: RewardTier) => {
    setSelectedTier(tier);
    setCustomAmount(0);
    setPledgeData(prev => ({
      ...prev,
      tierId: tier.id,
      tierTitle: tier.title,
      amount: tier.amount,
      customAmount: 0,
    }));
  };

  const handleCustomAmountChange = (value: string) => {
    const amount = parseInt(value) || 0;
    setCustomAmount(amount);
    setSelectedTier(null);
    setPledgeData(prev => ({
      ...prev,
      tierId: undefined,
      tierTitle: undefined,
      amount: amount,
      customAmount: amount,
    }));
  };

  const handleInputChange = (field: keyof PledgeData, value: any) => {
    setPledgeData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return pledgeData.amount > 0;
      case 2:
        return !!(pledgeData.firstName && pledgeData.lastName && pledgeData.email);
      case 3:
        return !!pledgeData.paymentMethod;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!pledgeData.amount || pledgeData.amount <= 0) {
        setError("Please select a valid amount");
        return;
      }

      if (!pledgeData.firstName || !pledgeData.lastName || !pledgeData.email) {
        setError("Please fill in all required fields");
        return;
      }

      // Create checkout session
      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: pledgeData.amount,
          currency: "usd",
          campaignId: pledgeData.campaignId,
          campaignTitle: pledgeData.campaignTitle,
          donorName: `${pledgeData.firstName} ${pledgeData.lastName}`,
          donorEmail: pledgeData.email,
          isAnonymous: pledgeData.isAnonymous,
          message: pledgeData.message,
          rewardTierId: pledgeData.tierId,
          rewardTierTitle: pledgeData.tierTitle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment");
      }

      // Store pledge data for success page
      const pledgeIntent = {
        amount: pledgeData.amount,
        donorName: `${pledgeData.firstName} ${pledgeData.lastName}`,
        donorEmail: pledgeData.email,
        message: pledgeData.message,
        isAnonymous: pledgeData.isAnonymous,
        rewardTierId: pledgeData.tierId,
        rewardTierTitle: pledgeData.tierTitle,
        campaignId: pledgeData.campaignId,
        campaignTitle: pledgeData.campaignTitle,
        sessionId: data.sessionId
      };
      localStorage.setItem('pledgeIntent', JSON.stringify(pledgeIntent));

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-green-50/20 to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3" />
            <span className="text-lg font-medium">Loading...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-green-50/20 to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground mb-6">
              {error || "Campaign not found"}
            </p>
            <Button asChild>
              <Link href="/campaigns">Back to Campaigns</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysRemaining = calculateDaysRemaining(campaign.end_date);
  const fundingPercentage = calculateFundingPercentage(campaign.current_funding, campaign.funding_goal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/20 to-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="text-gray-600">
              <Link href={`/campaigns/${campaignId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaign
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Campaign Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Header */}
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <div className="relative h-48 bg-gradient-to-r from-gray-900 to-black">
                <img
                  src={campaign.cover_image || "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80"}
                  alt={campaign.title}
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={campaign.owner_avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80"}
                      alt={campaign.owner_name}
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                    <div>
                      <h1 className="text-2xl font-bold text-white">{campaign.title}</h1>
                      <p className="text-white/80 text-sm">by {campaign.owner_name}</p>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      ${(campaign.current_funding / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-600">raised</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {fundingPercentage}%
                    </div>
                    <div className="text-sm text-gray-600">funded</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {daysRemaining}
                    </div>
                    <div className="text-sm text-gray-600">days left</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {campaign.reward_tiers?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">rewards</div>
                  </div>
                </div>
                <Progress value={fundingPercentage} className="h-2" />
              </CardContent>
            </Card>

            {/* Payment Steps */}
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Complete Your Pledge</CardTitle>
                    <CardDescription>
                      Step {currentStep} of 3: {currentStep === 1 ? "Choose Your Support" : currentStep === 2 ? "Your Information" : "Payment Method"}
                    </CardDescription>
                  </div>
                </div>
                <Progress value={(currentStep / 3) * 100} className="h-2 mt-4" />
              </CardHeader>
              <CardContent className="p-6">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Choose Your Support Level</h3>
                      
                      {/* Custom Amount */}
                      <div className="mb-6">
                        <Label className="text-base font-medium">Custom Amount</Label>
                        <div className="relative mt-2">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={customAmount || ""}
                            onChange={(e) => handleCustomAmountChange(e.target.value)}
                            className="pl-10 h-12 text-lg"
                            min="1"
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Minimum $1</p>
                      </div>

                      {/* Reward Tiers */}
                      {campaign.reward_tiers && campaign.reward_tiers.length > 0 && (
                        <div>
                          <Label className="text-base font-medium mb-4 block">Or Choose a Reward Tier</Label>
                          <div className="space-y-4">
                            {campaign.reward_tiers
                              .sort((a, b) => a.display_order - b.display_order)
                              .map((tier) => (
                                <div
                                  key={tier.id}
                                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                                    selectedTier?.id === tier.id
                                      ? "border-green-500 bg-green-50"
                                      : "border-gray-200 hover:border-green-300"
                                  }`}
                                  onClick={() => handleTierSelection(tier)}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-lg">{tier.title}</h4>
                                    <div className="text-xl font-bold text-green-600">
                                      ${(tier.amount / 100).toFixed(0)}
                                    </div>
                                  </div>
                                  <p className="text-gray-600 text-sm">{tier.description}</p>
                                  {selectedTier?.id === tier.id && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                      <span className="text-sm text-green-600 font-medium">Selected</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Your Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={pledgeData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            className="h-12"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={pledgeData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className="h-12"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={pledgeData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="h-12"
                        />
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="message">Message to Creator (Optional)</Label>
                        <Textarea
                          id="message"
                          placeholder="Share your thoughts with the campaign creator..."
                          value={pledgeData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="anonymous"
                          checked={pledgeData.isAnonymous}
                          onChange={(e) => handleInputChange("isAnonymous", e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="anonymous" className="text-sm">
                          Make this pledge anonymous
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                      <div className="space-y-4">
                        <div
                          className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                            pledgeData.paymentMethod === "card"
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-green-300"
                          }`}
                          onClick={() => handleInputChange("paymentMethod", "card")}
                        >
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-gray-600" />
                            <div>
                              <div className="font-semibold">Credit or Debit Card</div>
                              <div className="text-sm text-gray-600">Visa, Mastercard, American Express</div>
                            </div>
                            {pledgeData.paymentMethod === "card" && (
                              <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  {currentStep < 3 ? (
                    <Button
                      onClick={handleNext}
                      disabled={!validateStep(currentStep)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Continue
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      className="bg-green-600 hover:bg-green-700 px-8"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Complete Pledge
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl rounded-2xl sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Tier or Custom Amount */}
                {selectedTier ? (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-800">{selectedTier.title}</span>
                    </div>
                    <p className="text-sm text-green-700 mb-2">{selectedTier.description}</p>
                    <div className="text-lg font-bold text-green-600">
                      ${(selectedTier.amount / 100).toFixed(0)}
                    </div>
                  </div>
                ) : customAmount > 0 ? (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-blue-800">Custom Support</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      ${(customAmount / 100).toFixed(2)}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <span className="text-gray-600">Select an amount or reward tier</span>
                  </div>
                )}

                <Separator />

                {/* Security Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lock className="w-4 h-4" />
                    <span>Secure payment processing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Your information is protected</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>No charges until campaign ends</span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Pledge</span>
                  <span className="text-xl font-bold text-green-600">
                    ${((selectedTier?.amount || customAmount) / 100).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Security Badge */}
            <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">100% Secure</div>
                    <div className="text-sm opacity-90">SSL encrypted payment</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 