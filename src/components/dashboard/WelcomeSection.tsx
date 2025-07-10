"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Plus,
  Sparkles,
  Award,
  Calendar,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

interface WelcomeSectionProps {
  user?: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
  stats?: {
    totalCampaigns: number;
    totalRaised: number;
    totalBackers: number;
    activeCampaigns: number;
  };
}

export default function WelcomeSection({
  user = {
    full_name: "John Entrepreneur",
    email: "john@example.com",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
  },
  stats = {
    totalCampaigns: 3,
    totalRaised: 275000,
    totalBackers: 2750,
    activeCampaigns: 1,
  },
}: WelcomeSectionProps) {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 border-4 border-white/20">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
                  {user.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {greeting}, {user.full_name?.split(" ")[0] || "Entrepreneur"}!
                </h1>
                <p className="text-white/90 text-lg">
                  Welcome back to your entrepreneurial journey
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Verified Creator
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80 mb-1">Member since</div>
              <div className="text-lg font-semibold">
                {new Date().getFullYear()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Raised
                </p>
                <p className="text-2xl font-bold gradient-text">
                  ${(stats.totalRaised / 1000).toFixed(0)}K
                </p>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>+12.5% this month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Backers
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalBackers.toLocaleString()}
                </p>
                <div className="flex items-center mt-2 text-sm text-blue-600">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>+8.2% this month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Active Campaigns
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.activeCampaigns}
                </p>
                <div className="flex items-center mt-2 text-sm text-orange-600">
                  <Activity className="w-4 h-4 mr-1" />
                  <span>
                    {stats.totalCampaigns - stats.activeCampaigns} completed
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-purple-600">94%</p>
                <div className="flex items-center mt-2 text-sm text-purple-600">
                  <Award className="w-4 h-4 mr-1" />
                  <span>Above average</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="premium-button h-16 flex-col gap-2" asChild>
            <Link href="/campaign/create">
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Create Campaign</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2" asChild>
            <Link href="/dashboard/campaigns">
              <Target className="w-5 h-5" />
              <span className="font-semibold">Manage Campaigns</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2" asChild>
            <Link href="/dashboard/analytics">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">View Analytics</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
