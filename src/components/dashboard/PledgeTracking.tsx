"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Calendar,
  DollarSign,
  Gift,
  CheckCircle,
  Clock,
  Package,
  Truck,
  Star,
  Eye,
  Download,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { getUserPledges } from "@/lib/database";

interface Pledge {
  id: string;
  amount: number;
  created_at: string;
  status: "succeeded" | "pending" | "failed";
  campaigns: {
    id: string;
    title: string;
    business_name: string;
    cover_image?: string;
  } | null;
  reward_tier?: {
    title: string;
    description: string;
    estimated_delivery?: string;
    fulfillment_status?: "pending" | "processing" | "shipped" | "delivered";
    tracking_number?: string;
  };
}

interface PledgeTrackingProps {
  userId?: string;
}

export default function PledgeTracking({
  userId = "default-user",
}: PledgeTrackingProps) {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");

  useEffect(() => {
    fetchUserPledges();
  }, [userId]);

  const fetchUserPledges = async () => {
    try {
      const userPledges = await getUserPledges(userId);
      // Add mock reward tier data for demonstration
      const pledgesWithRewards = userPledges.map((pledge, index) => ({
        ...pledge,
        reward_tier: {
          title: ["Early Bird Special", "Premium Package", "Supporter Tier"][
            index % 3
          ],
          description: [
            "Get early access and exclusive updates",
            "Premium features with priority support",
            "Support the project with gratitude",
          ][index % 3],
          estimated_delivery: "2024-12-01",
          fulfillment_status: ["pending", "processing", "shipped", "delivered"][
            index % 4
          ] as any,
          tracking_number:
            index % 2 === 0
              ? `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`
              : undefined,
        },
      }));
      setPledges(
        pledgesWithRewards.map((pledge) => ({
          ...pledge,
          status: pledge.status === "cancelled" ? "failed" : pledge.status,
        }))
      );
    } catch (error) {
      console.error("Error fetching pledges:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "succeeded":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed":
        return <Clock className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFulfillmentIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-gray-500" />;
      case "processing":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "shipped":
        return <Truck className="w-4 h-4 text-orange-500" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFulfillmentColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-orange-100 text-orange-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredPledges = pledges.filter((pledge) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "rewards") return pledge.reward_tier;
    return pledge.status === selectedTab;
  });

  const totalPledged = pledges
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalCampaigns = new Set(
    pledges.map((p) => p.campaigns?.id).filter(Boolean),
  ).size;
  const pendingRewards = pledges.filter(
    (p) => p.reward_tier && p.reward_tier.fulfillment_status !== "delivered",
  ).length;

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your pledges...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Pledged
                </p>
                <p className="text-2xl font-bold gradient-text">
                  ${(totalPledged / 100).toFixed(0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Campaigns Backed
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalCampaigns}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Pending Rewards
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {pendingRewards}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pledges List */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">My Pledges</CardTitle>
              <p className="text-muted-foreground">
                Track your contributions and rewards
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Pledge Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg">
                All ({pledges.length})
              </TabsTrigger>
              <TabsTrigger value="succeeded" className="rounded-lg">
                Successful (
                {pledges.filter((p) => p.status === "succeeded").length})
              </TabsTrigger>
              <TabsTrigger value="rewards" className="rounded-lg">
                Rewards ({pledges.filter((p) => p.reward_tier).length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="rounded-lg">
                Pending ({pledges.filter((p) => p.status === "pending").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-4">
              {filteredPledges.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No pledges found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start supporting amazing projects and they'll appear here.
                  </p>
                  <Button className="premium-button" asChild>
                    <Link href="/campaigns">
                      <Heart className="w-4 h-4 mr-2" />
                      Discover Campaigns
                    </Link>
                  </Button>
                </div>
              ) : (
                filteredPledges.map((pledge) => (
                  <Card
                    key={pledge.id}
                    className="border border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Campaign Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                          <img
                            src={
                              pledge.campaigns?.cover_image ||
                              "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&q=80"
                            }
                            alt={pledge.campaigns?.title || "Campaign"}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Pledge Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                {pledge.campaigns?.title || "Unknown Campaign"}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                by{" "}
                                {pledge.campaigns?.business_name || "Unknown"}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600 mb-1">
                                ${(pledge.amount / 100).toFixed(0)}
                              </div>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(pledge.status)}
                                <span className="text-sm capitalize">
                                  {pledge.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Reward Tier Info */}
                          {pledge.reward_tier && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {pledge.reward_tier.title}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {pledge.reward_tier.description}
                                  </p>
                                </div>
                                <Badge
                                  className={`${getFulfillmentColor(pledge.reward_tier.fulfillment_status || "pending")} border-0`}
                                >
                                  {getFulfillmentIcon(
                                    pledge.reward_tier.fulfillment_status ||
                                      "pending",
                                  )}
                                  <span className="ml-1 capitalize">
                                    {pledge.reward_tier.fulfillment_status ||
                                      "pending"}
                                  </span>
                                </Badge>
                              </div>

                              {/* Delivery Info */}
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    Est. delivery:{" "}
                                    {new Date(
                                      pledge.reward_tier.estimated_delivery ||
                                        "2024-12-01",
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                {pledge.reward_tier.tracking_number && (
                                  <div className="flex items-center gap-1">
                                    <Truck className="w-4 h-4" />
                                    <span>
                                      Tracking:{" "}
                                      {pledge.reward_tier.tracking_number}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Pledge Details */}
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Pledged on{" "}
                                {new Date(
                                  pledge.created_at,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/campaigns/${pledge.campaigns?.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Campaign
                              </Link>
                            </Button>
                            {pledge.reward_tier?.tracking_number && (
                              <Button size="sm" variant="outline">
                                <Truck className="w-4 h-4 mr-2" />
                                Track Package
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              Receipt
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Contact Creator
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
