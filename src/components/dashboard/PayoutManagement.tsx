"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  CreditCard,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { getCampaignsByOwner, getUserProfile } from "@/lib/database";
import { isCampaignEligibleForPayout, getPayoutDaysRemaining } from "@/lib/stripe";
import type { Campaign, User } from "@/lib/database";

interface PayoutManagementProps {
  userId?: string;
}

export default function PayoutManagement({
  userId = "default-user",
}: PayoutManagementProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestingPayout, setRequestingPayout] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("all");

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const [userCampaigns, profile] = await Promise.all([
        getCampaignsByOwner(userId),
        getUserProfile(userId),
      ]);

      // Normalize payout fields
      const normalizedCampaigns = userCampaigns.map(campaign => ({
        ...campaign,
        payout_status: campaign.payout_status ?? null,
        payout_amount: campaign.payout_amount ?? null,
        payout_requested_at: campaign.payout_requested_at ?? null,
        payout_processed_at: campaign.payout_processed_at ?? null,
        stripe_transfer_id: campaign.stripe_transfer_id ?? null,
      }));

      setCampaigns(normalizedCampaigns);
      setUserProfile(profile);
    } catch (error) {
      console.error("Error fetching payout data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (campaignId: string) => {
    setRequestingPayout(campaignId);
    try {
      const response = await fetch("/api/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId }),
      });

      const result = await response.json();

      if (response.ok) {
        // Refresh data
        await fetchData();
        // Show success message
        alert("Payout request submitted successfully!");
      } else {
        if (result.action === "setup_connect_account") {
          // Redirect to Stripe Connect onboarding
          window.open("/dashboard/connect-stripe", "_blank");
        } else {
          alert(`Error: ${result.error}`);
        }
      }
    } catch (error) {
      console.error("Error requesting payout:", error);
      alert("Failed to request payout. Please try again.");
    } finally {
      setRequestingPayout(null);
    }
  };

  const getPayoutStatusIcon = (status: string) => {
    switch (status) {
      case "eligible":
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case "requested":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "paid":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "expired":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPayoutStatusColor = (status: string) => {
    switch (status) {
      case "eligible":
        return "bg-green-100 text-green-700";
      case "requested":
        return "bg-blue-100 text-blue-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "paid":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "expired":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPayoutStatusText = (status: string) => {
    switch (status) {
      case "eligible":
        return "Eligible for Payout";
      case "requested":
        return "Payout Requested";
      case "processing":
        return "Processing Payout";
      case "paid":
        return "Payout Completed";
      case "failed":
        return "Payout Failed";
      case "expired":
        return "Payout Expired";
      default:
        return "Not Eligible";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "eligible") return campaign.payout_status === "eligible";
    if (selectedTab === "requested") return campaign.payout_status === "requested" || campaign.payout_status === "processing";
    if (selectedTab === "completed") return campaign.payout_status === "paid";
    if (selectedTab === "expired") return campaign.payout_status === "expired";
    return true;
  });

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payout information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Payouts</CardTitle>
              <p className="text-muted-foreground">
                Manage your campaign payouts and Stripe Connect account
              </p>
            </div>
          </div>
          {userProfile?.stripe_connect_status !== "active" && (
            <Button variant="outline" asChild>
              <a href="/dashboard/connect-stripe" target="_blank" rel="noopener noreferrer">
                <CreditCard className="w-4 h-4 mr-2" />
                Setup Stripe Connect
              </a>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stripe Connect Status */}
        {userProfile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">Stripe Connect Account</h4>
                  <p className="text-sm text-blue-700">
                    Status: {userProfile.stripe_connect_status || "Not Setup"}
                  </p>
                </div>
              </div>
              {userProfile.stripe_connect_status !== "active" && (
                <Button size="sm" variant="outline" asChild>
                  <a href="/dashboard/connect-stripe" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Setup Account
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Payout Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg">
              All ({campaigns.length})
            </TabsTrigger>
            <TabsTrigger value="eligible" className="rounded-lg">
              Eligible ({campaigns.filter((c) => c.payout_status === "eligible").length})
            </TabsTrigger>
            <TabsTrigger value="requested" className="rounded-lg">
              Requested ({campaigns.filter((c) => c.payout_status === "requested" || c.payout_status === "processing").length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg">
              Completed ({campaigns.filter((c) => c.payout_status === "paid").length})
            </TabsTrigger>
            <TabsTrigger value="expired" className="rounded-lg">
              Expired ({campaigns.filter((c) => c.payout_status === "expired").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No payouts found
                </h3>
                <p className="text-gray-600">
                  {selectedTab === "all"
                    ? "You don't have any campaigns eligible for payouts yet."
                    : `No ${selectedTab} payouts found.`}
                </p>
              </div>
            ) : (
              filteredCampaigns.map((campaign) => {
                const eligibility = isCampaignEligibleForPayout({
                  status: campaign.status,
                  current_funding: campaign.current_funding,
                  funding_goal: campaign.funding_goal,
                  end_date: campaign.end_date,
                  created_at: campaign.created_at || new Date().toISOString(),
                });

                const daysRemaining = getPayoutDaysRemaining(campaign.end_date);
                const totalAmount = campaign.current_funding || 0;
                const payoutAmount = campaign.payout_amount ? campaign.payout_amount / 100 : totalAmount * 0.95 - 0.30; // After platform fees

                return (
                  <Card
                    key={campaign.id}
                    className="border border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Campaign Image */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                          <img
                            src={
                              campaign.cover_image ||
                              "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&q=80"
                            }
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Campaign Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                {campaign.title}
                              </h3>
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {campaign.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`${getPayoutStatusColor(campaign.payout_status || "not_eligible")} border-0`}
                              >
                                {getPayoutStatusIcon(campaign.payout_status || "not_eligible")}
                                <span className="ml-1">
                                  {getPayoutStatusText(campaign.payout_status || "not_eligible")}
                                </span>
                              </Badge>
                            </div>
                          </div>

                          {/* Payout Details */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Payout Amount</p>
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(payoutAmount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Days Remaining</p>
                              <p className="text-lg font-bold">
                                {daysRemaining > 0 ? `${daysRemaining} days` : "Expired"}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            {campaign.payout_status === "eligible" && userProfile?.stripe_connect_status === "active" && (
                              <Button
                                onClick={() => handleRequestPayout(campaign.id)}
                                disabled={requestingPayout === campaign.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {requestingPayout === campaign.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <DollarSign className="w-4 h-4 mr-2" />
                                )}
                                Request Payout
                              </Button>
                            )}
                            
                            {campaign.payout_status === "eligible" && userProfile?.stripe_connect_status !== "active" && (
                              <Button variant="outline" asChild>
                                <a href="/dashboard/connect-stripe" target="_blank" rel="noopener noreferrer">
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  Setup Stripe Connect
                                </a>
                              </Button>
                            )}

                            {campaign.payout_status === "requested" && (
                              <div className="text-sm text-blue-600">
                                Payout request submitted. Processing...
                              </div>
                            )}

                            {campaign.payout_status === "paid" && (
                              <div className="text-sm text-green-600">
                                Payout completed on {campaign.payout_processed_at ? new Date(campaign.payout_processed_at).toLocaleDateString() : "N/A"}
                              </div>
                            )}

                            {campaign.payout_status === "expired" && (
                              <div className="text-sm text-orange-600">
                                Payout window expired. Funds are no longer available.
                              </div>
                            )}

                            {!eligibility.eligible && campaign.payout_status === "not_eligible" && (
                              <div className="text-sm text-gray-600">
                                {eligibility.reason}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 