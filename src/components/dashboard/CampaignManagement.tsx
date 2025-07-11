"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Target,
  Edit3,
  Eye,
  MoreHorizontal,
  Pause,
  Play,
  Share2,
  BarChart3,
  Users,
  MessageCircle,
  Calendar,
  DollarSign,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { getCampaignsByOwner } from "@/lib/database";
import { Tables } from "@/types/supabase";

type Campaign = Tables<"campaigns">;

interface CampaignManagementProps {
  userId?: string;
}

export default function CampaignManagement({
  userId = "default-user",
}: CampaignManagementProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");

  useEffect(() => {
    fetchUserCampaigns();
  }, [userId]);

  const fetchUserCampaigns = async () => {
    try {
      const userCampaigns = await getCampaignsByOwner(userId);
      // Convert database Campaign type to Supabase Campaign type
      const convertedData = userCampaigns.map(campaign => ({
        ...campaign,
        cover_image: campaign.cover_image || null,
        current_funding: campaign.current_funding || 0,
        owner_id: campaign.owner_id || '',
        created_at: campaign.created_at || null,
        updated_at: campaign.updated_at || null,
        website: campaign.website || null,
        owner_avatar: campaign.owner_avatar || null,
      }));
      setCampaigns(convertedData);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignAction = async (campaignId: string, action: string) => {
    // Implement campaign actions (pause, resume, etc.)
    console.log(`Action ${action} on campaign ${campaignId}`);
    // Add real implementation here
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Activity className="w-3 h-3" />;
      case "completed":
        return <CheckCircle className="w-3 h-3" />;
      case "paused":
        return <Pause className="w-3 h-3" />;
      case "draft":
        return <Clock className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "paused":
        return "bg-yellow-100 text-yellow-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (selectedTab === "all") return true;
    return campaign.status === selectedTab;
  });

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your campaigns...</p>
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
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">My Campaigns</CardTitle>
              <p className="text-muted-foreground">
                Manage and track all your campaigns
              </p>
            </div>
          </div>
          <Button className="premium-button" asChild>
            <Link href="/campaign/create">
              <Target className="w-4 h-4 mr-2" />
              Create New
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Campaign Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg">
              All ({campaigns.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="rounded-lg">
              Active ({campaigns.filter((c) => c.status === "active").length})
            </TabsTrigger>
            <TabsTrigger value="draft" className="rounded-lg">
              Draft ({campaigns.filter((c) => c.status === "draft").length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg">
              Completed (
              {campaigns.filter((c) => c.status === "completed").length})
            </TabsTrigger>
            <TabsTrigger value="paused" className="rounded-lg">
              Paused ({campaigns.filter((c) => c.status === "paused").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No campaigns found
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedTab === "all"
                    ? "You haven't created any campaigns yet."
                    : `No ${selectedTab} campaigns found.`}
                </p>
                <Button className="premium-button" asChild>
                  <Link href="/campaign/create">
                    <Target className="w-4 h-4 mr-2" />
                    Create Your First Campaign
                  </Link>
                </Button>
              </div>
            ) : (
              filteredCampaigns.map((campaign) => {
                const fundingPercentage = Math.min(
                  Math.round(
                    ((campaign.current_funding || 0) / campaign.funding_goal) * 100,
                  ),
                  100,
                );
                const daysRemaining = getDaysRemaining(campaign.end_date);
                const backerCount = Math.floor((campaign.current_funding || 0) / 150);

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
                                className={`${getStatusColor(campaign.status)} border-0`}
                              >
                                {getStatusIcon(campaign.status)}
                                <span className="ml-1 capitalize">
                                  {campaign.status}
                                </span>
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/campaigns/${campaign.id}`}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Campaign
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/campaigns/${campaign.id}/edit`}
                                    >
                                      <Edit3 className="w-4 h-4 mr-2" />
                                      Edit Campaign
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/dashboard/analytics/${campaign.id}`}
                                    >
                                      <BarChart3 className="w-4 h-4 mr-2" />
                                      View Analytics
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleCampaignAction(campaign.id, "share")
                                    }
                                  >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share Campaign
                                  </DropdownMenuItem>
                                  {campaign.status === "active" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleCampaignAction(
                                          campaign.id,
                                          "pause",
                                        )
                                      }
                                    >
                                      <Pause className="w-4 h-4 mr-2" />
                                      Pause Campaign
                                    </DropdownMenuItem>
                                  )}
                                  {campaign.status === "paused" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleCampaignAction(
                                          campaign.id,
                                          "resume",
                                        )
                                      }
                                    >
                                      <Play className="w-4 h-4 mr-2" />
                                      Resume Campaign
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Campaign Stats */}
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Raised</p>
                              <p className="font-semibold text-green-600">
                                ${((campaign.current_funding || 0) / 1000).toFixed(0)}K
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Backers</p>
                              <p className="font-semibold">{backerCount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Days Left</p>
                              <p className="font-semibold">{daysRemaining}</p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {fundingPercentage}% of goal
                              </span>
                              <span className="text-gray-500">
                                ${(campaign.funding_goal / 1000).toFixed(0)}K
                                goal
                              </span>
                            </div>
                            <Progress
                              value={fundingPercentage}
                              className="h-2"
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 mt-4">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/campaigns/${campaign.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/campaigns/${campaign.id}/edit`}>
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link
                                href={`/dashboard/analytics/${campaign.id}`}
                              >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Analytics
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/dashboard/backers/${campaign.id}`}>
                                <Users className="w-4 h-4 mr-2" />
                                Backers
                              </Link>
                            </Button>
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
