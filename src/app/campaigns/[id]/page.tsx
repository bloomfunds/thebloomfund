"use client";
import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { getCampaignById } from "@/lib/database";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Clock,
  Users,
  Heart,
  Share2,
  Target,
  Award,
  TrendingUp,
  Gift,
  CheckCircle,
  ArrowRight,
  Bookmark,
  Verified,
  Shield,
  FileText,
  Zap,
  Image as ImageIcon,
  Building,
  Calendar,
  Globe,
  Star,
  Lightbulb,
  Rocket,
  Trophy,
  ChevronRight,
  ExternalLink,
  Mail,
  Phone,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface CampaignPageProps {
  params: {
    id: string;
  };
}

export default function CampaignPage({ params }: CampaignPageProps) {
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [campaignStats, setCampaignStats] = useState({
    totalBackers: 0,
    totalAmount: 0,
    fundingPercentage: 0,
    daysRemaining: 0
  });

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const campaignData = await getCampaignById(params.id);
        if (!campaignData) {
          setError("Campaign not found");
          return;
        }
        setCampaign(campaignData);
      } catch (err) {
        console.error("Error loading campaign:", err);
        setError("Failed to load campaign");
      } finally {
        setLoading(false);
      }
    }

    fetchCampaign();
  }, [params.id]);

  useEffect(() => {
    if (!campaign) return;

    const fetchMilestones = async () => {
      try {
        const { data: milestonesData } = await supabase
          .from('campaign_milestones')
          .select('*')
          .eq('campaign_id', campaign.id)
          .order('target_amount', { ascending: true });

        setMilestones(milestonesData || []);
      } catch (error) {
        console.error('Error fetching milestones:', error);
      }
    };

    const fetchCampaignStats = async () => {
      try {
        // Get total backers and amount from payments
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('amount')
          .eq('campaign_id', campaign.id)
          .eq('status', 'succeeded');

        const totalAmount = paymentsData?.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0) || 0;
        const totalBackers = paymentsData?.length || 0;
        const fundingPercentage = campaign.funding_goal > 0 ? Math.round((totalAmount / campaign.funding_goal) * 100) : 0;
        
        // Calculate days remaining
        const endDate = new Date(campaign.end_date);
        const today = new Date();
        const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

        setCampaignStats({
          totalBackers,
          totalAmount,
          fundingPercentage,
          daysRemaining
        });
      } catch (error) {
        console.error('Error fetching campaign stats:', error);
      }
    };

    fetchMilestones();
    fetchCampaignStats();
  }, [campaign]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Campaign Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            {error || "The campaign you're looking for doesn't exist."}
          </p>
          <Link
            href="/campaigns"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Browse Campaigns
          </Link>
        </div>
      </div>
    );
  }

  // Professional campaign updates
  const campaignUpdates = [
    {
      id: 1,
      title: "Campaign Successfully Completed - 400% Funded!",
      content:
        "We are overwhelmed by the incredible support from our community. With $1.2M raised against our $300K goal, we can now expand our vision and deliver even more value to our backers.",
      date: "2024-01-20",
      author: campaign?.owner_name,
    },
    {
      id: 2,
      title: "Production Timeline & Next Steps",
      content:
        "With funding complete, we're moving into full production mode. Our team is working around the clock to ensure timely delivery while maintaining the highest quality standards.",
      date: "2024-01-18",
      author: campaign?.owner_name,
    },
    {
      id: 3,
      title: "Thank You to Our Amazing Community",
      content:
        "The response has been incredible. We're grateful for every single backer who believed in our vision and helped make this dream a reality.",
      date: "2024-01-15",
      author: campaign?.owner_name,
    },
  ];

  // Related campaigns
  const relatedCampaigns = [
    {
      id: 2,
      title: "Sustainable Tech Innovation Hub",
      current_funding: 850000,
      funding_goal: 500000,
      cover_image:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&q=80",
      category: "Technology",
      backers: 892,
      daysLeft: 12,
    },
    {
      id: 3,
      title: "Green Energy Solutions Platform",
      current_funding: 420000,
      funding_goal: 350000,
      cover_image:
        "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80",
      category: "Environment",
      backers: 634,
      daysLeft: 8,
    },
    {
      id: 4,
      title: "Community Development Initiative",
      current_funding: 180000,
      funding_goal: 200000,
      cover_image:
        "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&q=80",
      category: "Community",
      backers: 456,
      daysLeft: 15,
    },
  ];

  // Default milestones if none exist
  const keyMilestones = milestones.length > 0 ? milestones.map((milestone: any) => ({
    title: milestone.title,
    description: milestone.description || `Reach $${milestone.target_amount.toLocaleString()} in funding`,
    date: new Date(milestone.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    }),
    completed: milestone.is_reached,
    targetAmount: milestone.target_amount
  })) : [
    {
      title: "Campaign Launch",
      description: "Campaign goes live and starts accepting pledges",
      date: campaign ? new Date(campaign.start_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      }) : "In Progress",
      completed: true,
    },
    {
      title: "25% Funded",
      description: "First major milestone reached",
      date: "In Progress",
      completed: campaignStats.fundingPercentage >= 25,
    },
    {
      title: "50% Funded",
      description: "Halfway to the goal",
      date: "In Progress", 
      completed: campaignStats.fundingPercentage >= 50,
    },
    {
      title: "100% Funded",
      description: "Campaign goal achieved",
      date: "In Progress",
      completed: campaignStats.fundingPercentage >= 100,
    },
    {
      title: "Campaign Ends",
      description: "Funding period concludes",
      date: campaign ? new Date(campaign.end_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      }) : "In Progress",
      completed: campaignStats.daysRemaining <= 0,
    },
  ];

    return (
      <div className="min-h-screen bg-white">
        {/* Fix navbar overlap with proper top padding */}
        <div className="pt-16">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={
                  campaign.cover_image ||
                  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80"
                }
                alt={campaign.title}
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-green-500/5" />
            <div className="container mx-auto px-6 py-16 lg:py-24 relative z-10">
              <div className="max-w-4xl">
                {/* Status Badge */}
                <div className="flex items-center gap-4 mb-8">
                  <Badge className="bg-green-500 text-white px-6 py-3 text-sm font-bold border-0">
                    <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse" />
                    CAMPAIGN COMPLETED
                  </Badge>
                  <Badge className="bg-white/10 text-white border-white/20 px-4 py-2 text-sm font-semibold">
                    {campaign.category.toUpperCase()}
                  </Badge>
                </div>

                {/* Title and Description */}
                <h1 className="text-3xl lg:text-4xl font-black mb-6 leading-tight">
                  {campaign.title}
                </h1>
                <p className="text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl">
                  {campaign.description.substring(0, 200)}...
                </p>

                {/* Creator Info */}
                <div className="flex items-center gap-6 mb-12">
                  <Avatar className="w-16 h-16 border-3 border-white/20">
                    <AvatarImage src={campaign.owner_avatar} />
                    <AvatarFallback className="text-xl font-bold bg-green-600 text-white">
                      {campaign.owner_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-bold mb-1">
                      Created by {campaign.owner_name}
                    </p>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Verified className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium">
                        Verified Creator
                      </span>
                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {campaign.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-bold rounded-xl"
                    onClick={() => {
                      // Store pledge intent for general support
                      const pledgeIntent = {
                        campaignId: campaign.id,
                        campaignTitle: campaign.title,
                        tierId: null,
                        tierTitle: 'General Support',
                        amount: 0, // Will be set by user
                        timestamp: new Date().toISOString()
                      };
                      localStorage.setItem('pledgeIntent', JSON.stringify(pledgeIntent));
                      
                      // Scroll to rewards section or redirect to payment
                      const rewardsSection = document.querySelector('[data-rewards-section]');
                      if (rewardsSection) {
                        rewardsSection.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        window.location.href = `/payment?campaign=${campaign.id}&amount=0`;
                      }
                    }}
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Support This Project
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 px-6 py-4 rounded-xl bg-white/5 backdrop-blur-sm"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: campaign.title,
                          text: campaign.description.substring(0, 100),
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Campaign link copied to clipboard!");
                      }
                    }}
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share Campaign
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 px-6 py-4 rounded-xl bg-white/5 backdrop-blur-sm"
                    onClick={() => {
                      const saved = localStorage.getItem("savedCampaigns") || "[]";
                      const savedCampaigns = JSON.parse(saved);
                      if (!savedCampaigns.includes(campaign.id)) {
                        savedCampaigns.push(campaign.id);
                        localStorage.setItem("savedCampaigns", JSON.stringify(savedCampaigns));
                        // Show success toast instead of alert
                        const button = document.querySelector('[data-save-button]') as HTMLButtonElement;
                        if (button) {
                          const originalText = button.innerHTML;
                          button.innerHTML = '<CheckCircle className="w-5 h-5 mr-2" />Saved!';
                          button.classList.add('bg-green-500', 'border-green-500');
                          setTimeout(() => {
                            button.innerHTML = originalText;
                            button.classList.remove('bg-green-500', 'border-green-500');
                          }, 2000);
                        }
                      } else {
                        // Remove from saved
                        const updatedCampaigns = savedCampaigns.filter((id: string) => id !== campaign.id);
                        localStorage.setItem("savedCampaigns", JSON.stringify(updatedCampaigns));
                        const button = document.querySelector('[data-save-button]') as HTMLButtonElement;
                        if (button) {
                          const originalText = button.innerHTML;
                          button.innerHTML = '<Bookmark className="w-5 h-5 mr-2" />Save for Later';
                          button.classList.remove('bg-green-500', 'border-green-500');
                          setTimeout(() => {
                            button.innerHTML = originalText;
                          }, 2000);
                        }
                      }
                    }}
                    data-save-button
                  >
                    <Bookmark className="w-5 h-5 mr-2" />
                    Save for Later
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-12">
                {/* Funding Statistics */}
                <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-900 to-black text-white p-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                      <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-black mb-2 text-green-400">
                          ${(campaignStats.totalAmount / 1000).toFixed(0)}K
                        </div>
                        <div className="text-gray-300 font-semibold text-sm">
                          raised of ${(campaign.funding_goal / 1000).toFixed(0)}K goal
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-black mb-2 text-white">
                          {campaignStats.totalBackers.toLocaleString()}
                        </div>
                        <div className="text-gray-300 font-semibold text-sm">
                          backers
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-black mb-2 text-gray-400">
                          {campaignStats.daysRemaining}
                        </div>
                        <div className="text-gray-300 font-semibold text-sm">
                          days left
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-black mb-2 text-green-400">
                          {campaignStats.fundingPercentage}%
                        </div>
                        <div className="text-gray-300 font-semibold text-sm">
                          funded
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-gray-300">
                          Funding Progress
                        </span>
                        <span className="text-sm font-bold text-green-400">
                          {campaignStats.fundingPercentage}% Complete
                        </span>
                      </div>
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full relative"
                          style={{ width: `${Math.min(campaignStats.fundingPercentage, 100)}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>Started {campaign ? new Date(campaign.start_date).toLocaleDateString() : 'N/A'}</span>
                        <span>Ends {campaign ? new Date(campaign.end_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Tabbed Content */}
                <Card className="border-0 shadow-xl rounded-2xl">
                  <Tabs defaultValue="about" className="w-full">
                    <div className="border-b border-gray-100">
                      <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0">
                        <TabsTrigger
                          value="about"
                          className="rounded-none border-b-3 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent py-4 px-4 font-bold text-sm"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          About Project
                        </TabsTrigger>
                        <TabsTrigger
                          value="updates"
                          className="rounded-none border-b-3 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent py-4 px-4 font-bold text-sm"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Updates
                          <Badge className="ml-2 bg-green-500 text-white text-xs">
                            3
                          </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                          value="creators"
                          className="rounded-none border-b-3 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent py-4 px-4 font-bold text-sm"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Creators
                        </TabsTrigger>
                        <TabsTrigger
                          value="community"
                          className="rounded-none border-b-3 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent py-4 px-4 font-bold text-sm"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Community
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="about" className="p-8 space-y-8">
                      <div>
                        <h2 className="text-3xl font-black mb-6 text-gray-900">
                          About This Project
                        </h2>
                        <div className="prose prose-lg max-w-none">
                          <p className="text-gray-700 leading-relaxed mb-6">
                            {campaign.description}
                          </p>
                        </div>
                      </div>

                      {/* Our Story Section */}
                      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-8 border border-gray-100">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Lightbulb className="w-5 h-5 text-white" />
                          </div>
                          Our Story
                        </h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                          What started as a simple idea in a garage has evolved
                          into a revolutionary platform that's changing how
                          people invest and build wealth. Our journey began when
                          we realized that sophisticated investment strategies
                          were only available to the wealthy, leaving millions
                          of people without access to the tools they needed to
                          secure their financial future.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                          After years of research and development, we've created
                          an AI-powered platform that democratizes wealth
                          building by making professional-grade investment
                          management accessible to everyone, regardless of their
                          financial background or experience level.
                        </p>
                      </div>

                      {/* The Problem Section */}
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-8 border border-red-100">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-white" />
                          </div>
                          The Problem We're Solving
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-gray-700">
                              Traditional investment management requires high
                              minimum investments and expensive fees
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-gray-700">
                              Most people lack the knowledge and time to manage
                              complex investment portfolios
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-gray-700">
                              Existing robo-advisors offer limited customization
                              and lack sophisticated strategies
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Our Solution Section */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          Our Solution
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-gray-700">
                              AI-powered portfolio management that adapts to
                              market conditions in real-time
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-gray-700">
                              Personalized investment strategies based on
                              individual goals and risk tolerance
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-gray-700">
                              Low fees and no minimum investment requirements to
                              make wealth building accessible
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Technology Section */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-100">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          Technology & Innovation
                        </h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                          Our platform leverages cutting-edge artificial
                          intelligence and machine learning algorithms to
                          analyze market trends, assess risk, and optimize
                          portfolio performance. The system continuously learns
                          from market data and user behavior to improve
                          investment outcomes.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Advanced AI Engine
                            </h4>
                            <p className="text-sm text-gray-600">
                              Machine learning algorithms that adapt to market
                              conditions
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Real-time Analytics
                            </h4>
                            <p className="text-sm text-gray-600">
                              Instant portfolio monitoring and automatic
                              rebalancing
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Key Features */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Target className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg mb-2 text-gray-900">
                                Our Mission
                              </h4>
                              <p className="text-gray-700 leading-relaxed">
                                Creating innovative solutions that transform
                                industries and improve lives through
                                cutting-edge technology and sustainable
                                practices.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Users className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg mb-2 text-gray-900">
                                Community Impact
                              </h4>
                              <p className="text-gray-700 leading-relaxed">
                                Building a stronger community through
                                collaboration, innovation, and shared success
                                that benefits everyone involved.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg mb-2 text-gray-900">
                                Quality Assurance
                              </h4>
                              <p className="text-gray-700 leading-relaxed">
                                Maintaining the highest standards of quality and
                                reliability through rigorous testing and
                                continuous improvement.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-50 to-slate-50 rounded-xl p-6 border border-indigo-100">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Rocket className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg mb-2 text-gray-900">
                                Innovation Focus
                              </h4>
                              <p className="text-gray-700 leading-relaxed">
                                Pushing boundaries with breakthrough technology
                                and creative solutions that set new industry
                                standards.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Success Metrics */}
                      <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl p-8 text-white">
                        <h3 className="text-2xl font-bold mb-6 text-center">
                          Project Success Metrics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="text-center">
                            <div className="text-3xl font-black mb-2 text-green-400">
                              400%
                            </div>
                            <div className="text-gray-300 font-semibold">
                              Funding Achievement
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-black mb-2 text-white">
                              1,267
                            </div>
                            <div className="text-gray-300 font-semibold">
                              Community Members
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-black mb-2 text-green-400">
                              100%
                            </div>
                            <div className="text-gray-300 font-semibold">
                              Success Rate
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="updates" className="p-8">
                      <div className="space-y-6">
                        <h2 className="text-3xl font-black mb-6 text-gray-900">
                          Project Updates
                        </h2>
                        {campaignUpdates.map((update) => (
                          <Card
                            key={update.id}
                            className="border-l-4 border-l-green-500 shadow-lg"
                          >
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-900">
                                  {update.title}
                                </h3>
                                <span className="text-sm text-gray-500 font-medium">
                                  {new Date(update.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700 leading-relaxed mb-4">
                                {update.content}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={campaign.owner_avatar} />
                                  <AvatarFallback className="text-xs bg-green-600 text-white">
                                    {update.author.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {update.author}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="creators" className="p-8">
                      <div className="space-y-6">
                        <h2 className="text-3xl font-black mb-6 text-gray-900">
                          Meet the Creators
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="border-2 border-green-100 bg-green-50">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-4 mb-4">
                                <Avatar className="w-16 h-16">
                                  <AvatarImage src={campaign.owner_avatar} />
                                  <AvatarFallback className="bg-green-600 text-white font-bold text-xl">
                                    {campaign.owner_name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-bold text-xl text-gray-900">
                                    {campaign.owner_name}
                                  </h3>
                                  <p className="text-green-600 font-semibold">
                                    Project Founder & CEO
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Verified className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-gray-600">
                                      Verified Creator
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Building className="w-4 h-4 text-green-500" />
                                  <span>
                                    <strong>Company:</strong>{" "}
                                    {campaign.business_name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <MapPin className="w-4 h-4 text-green-500" />
                                  <span>
                                    <strong>Location:</strong>{" "}
                                    {campaign.location}
                                  </span>
                                </div>
                                {campaign.website && (
                                  <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Globe className="w-4 h-4 text-green-500" />
                                    <span>
                                      <strong>Website:</strong>{" "}
                                      {campaign.website}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Calendar className="w-4 h-4 text-green-500" />
                                  <span>
                                    <strong>Member since:</strong>{" "}
                                    {new Date(
                                      campaign.created_at,
                                    ).getFullYear()}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t border-green-200">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  Experienced entrepreneur with a passion for
                                  innovation and sustainable business practices.
                                  Committed to delivering exceptional value to
                                  our community of supporters.
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          <div className="space-y-4">
                            <Card>
                              <CardContent className="p-6">
                                <h4 className="font-bold text-lg mb-3 text-gray-900">
                                  Project Statistics
                                </h4>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                      Campaign Status
                                    </span>
                                    <Badge className="bg-green-500 text-white">
                                      Completed
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                      Total Raised
                                    </span>
                                    <span className="font-bold text-green-600">
                                      $1,200,000
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                      Backers
                                    </span>
                                    <span className="font-bold">1,267</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                      Success Rate
                                    </span>
                                    <span className="font-bold text-green-600">
                                      400%
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardContent className="p-6">
                                <h4 className="font-bold text-lg mb-3 text-gray-900">
                                  Contact Information
                                </h4>
                                <div className="space-y-3">
                                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Send Message
                                  </Button>
                                  {campaign.website && (
                                    <Button
                                      variant="outline"
                                      className="w-full"
                                    >
                                      <Globe className="w-4 h-4 mr-2" />
                                      Visit Website
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="community" className="p-8">
                      <div className="space-y-6">
                        <h2 className="text-3xl font-black mb-6 text-gray-900">
                          Community & Backers
                        </h2>

                        {/* Community Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <Card className="text-center p-6">
                            <div className="text-3xl font-black text-green-600 mb-2">
                              1,267
                            </div>
                            <div className="text-gray-600 font-semibold">
                              Total Backers
                            </div>
                          </Card>
                          <Card className="text-center p-6">
                            <div className="text-3xl font-black text-green-600 mb-2">
                              $947
                            </div>
                            <div className="text-gray-600 font-semibold">
                              Average Pledge
                            </div>
                          </Card>
                          <Card className="text-center p-6">
                            <div className="text-3xl font-black text-green-600 mb-2">
                              89%
                            </div>
                            <div className="text-gray-600 font-semibold">
                              Repeat Supporters
                            </div>
                          </Card>
                        </div>

                        {/* Top Backers */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Trophy className="w-5 h-5 text-yellow-500" />
                              Top Supporters
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {[
                                {
                                  name: "Anonymous Supporter",
                                  amount: 5000,
                                  avatar:
                                    "https://api.dicebear.com/7.x/avataaars/svg?seed=anon1",
                                },
                                {
                                  name: "Tech Enthusiast",
                                  amount: 2500,
                                  avatar:
                                    "https://api.dicebear.com/7.x/avataaars/svg?seed=tech1",
                                },
                                {
                                  name: "Innovation Advocate",
                                  amount: 1500,
                                  avatar:
                                    "https://api.dicebear.com/7.x/avataaars/svg?seed=innov1",
                                },
                                {
                                  name: "Future Builder",
                                  amount: 1000,
                                  avatar:
                                    "https://api.dicebear.com/7.x/avataaars/svg?seed=future1",
                                },
                                {
                                  name: "Community Leader",
                                  amount: 750,
                                  avatar:
                                    "https://api.dicebear.com/7.x/avataaars/svg?seed=leader1",
                                },
                              ].map((backer, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                          index === 0
                                            ? "bg-yellow-500 text-white"
                                            : index === 1
                                              ? "bg-gray-400 text-white"
                                              : index === 2
                                                ? "bg-orange-500 text-white"
                                                : "bg-gray-200 text-gray-600"
                                        }`}
                                      >
                                        {index + 1}
                                      </div>
                                      <Avatar className="w-8 h-8">
                                        <AvatarImage src={backer.avatar} />
                                        <AvatarFallback className="text-xs">
                                          {backer.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                    </div>
                                    <span className="font-semibold text-gray-900">
                                      {backer.name}
                                    </span>
                                  </div>
                                  <span className="font-bold text-green-600">
                                    ${backer.amount.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Zap className="w-5 h-5 text-green-500" />
                              Recent Community Activity
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {[
                                {
                                  action: "pledged $500",
                                  user: "Sarah M.",
                                  time: "2 hours ago",
                                },
                                {
                                  action: "shared the campaign",
                                  user: "Alex K.",
                                  time: "5 hours ago",
                                },
                                {
                                  action: "pledged $250",
                                  user: "Mike R.",
                                  time: "1 day ago",
                                },
                                {
                                  action: "left a comment",
                                  user: "Emma L.",
                                  time: "2 days ago",
                                },
                                {
                                  action: "pledged $1,000",
                                  user: "David P.",
                                  time: "3 days ago",
                                },
                              ].map((activity, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="font-semibold text-gray-900">
                                      {activity.user}
                                    </span>
                                    <span className="text-gray-600">
                                      {activity.action}
                                    </span>
                                  </div>
                                  <span className="text-gray-500">
                                    {activity.time}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>

                {/* Related Projects Section (replacing comments/backers) */}
                <Card className="border-0 shadow-xl rounded-2xl">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-2xl font-black text-gray-900">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      Related Projects
                    </CardTitle>
                    <p className="text-gray-600 font-medium">
                      Discover other innovative projects you might find
                      interesting
                    </p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {relatedCampaigns.map((project) => {
                        const projectFundingPercentage = Math.round(
                          (project.current_funding / project.funding_goal) *
                            100,
                        );

                        return (
                          <Card
                            key={project.id}
                            className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                          >
                            <div className="aspect-video relative overflow-hidden">
                              <img
                                src={project.cover_image}
                                alt={project.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              <Badge className="absolute top-3 left-3 bg-white/95 text-gray-800 font-bold px-3 py-1 text-xs">
                                {project.category.toUpperCase()}
                              </Badge>
                              <div className="absolute bottom-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                {project.daysLeft} days left
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <h4 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
                                {project.title}
                              </h4>
                              <div className="space-y-3 mb-4">
                                <div className="relative">
                                  <Progress
                                    value={Math.min(
                                      projectFundingPercentage,
                                      100,
                                    )}
                                    className="h-2 bg-gray-200"
                                  />
                                  <div className="absolute -top-5 right-0 text-xs font-bold text-green-600">
                                    {projectFundingPercentage}%
                                  </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <div>
                                    <div className="font-bold text-green-600">
                                      $
                                      {(project.current_funding / 1000).toFixed(
                                        0,
                                      )}
                                      K
                                    </div>
                                    <div className="text-gray-500">raised</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-gray-900">
                                      {project.backers}
                                    </div>
                                    <div className="text-gray-500">backers</div>
                                  </div>
                                </div>
                              </div>
                              <Button
                                className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-2 rounded-lg transition-all duration-300"
                                asChild
                              >
                                <Link href={`/campaigns/${project.id}`}>
                                  View Project
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-8">
                {/* Available Rewards */}
                <Card className="border-0 shadow-xl rounded-2xl sticky top-8" data-rewards-section>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl font-black text-gray-900">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <Gift className="w-5 h-5 text-white" />
                      </div>
                      Available Rewards
                    </CardTitle>
                    <p className="text-gray-600 text-sm font-medium">
                      Choose your support level and get exclusive rewards
                    </p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                    {campaign.reward_tiers &&
                    campaign.reward_tiers.length > 0 ? (
                      campaign.reward_tiers
                        .sort((a: import("@/lib/supabase").RewardTier, b: import("@/lib/supabase").RewardTier) => a.display_order - b.display_order)
                        .map((tier: import("@/lib/supabase").RewardTier, index: number) => {
                          const isPopular = index === 1;
                          const rewardImages = [
                            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&q=80",
                            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&q=80",
                            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&q=80",
                          ];
                          const backerCounts = [89, 208, 156];
                          const quantityLeft = [3, 9, 15];
                          const quantityTotal = [50, 12, 25];

                          return (
                            <div
                              key={tier.id}
                              className={`relative border-2 rounded-xl p-5 transition-all duration-300 cursor-pointer group hover:shadow-lg ${
                                isPopular
                                  ? "border-green-500 bg-green-50 shadow-md"
                                  : "border-gray-200 bg-white hover:border-green-300"
                              }`}
                            >
                              {isPopular && (
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                    POPULAR
                                  </div>
                                </div>
                              )}

                              {/* Reward Image */}
                              <div className="w-full h-32 mb-4 rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  src={rewardImages[index] || rewardImages[0]}
                                  alt={tier.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>

                              {/* Title and Price */}
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-lg group-hover:text-green-700 transition-colors">
                                  {tier.title}
                                </h4>
                                <div className="text-2xl font-black text-green-600">
                                  ${(tier.amount / 100).toFixed(0)}
                                </div>
                              </div>

                              {/* Subtitle - Backers */}
                              <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600 font-medium">
                                  {backerCounts[index]} backers
                                </span>
                              </div>

                              {/* Estimated Delivery */}
                              <div className="flex items-center gap-2 mb-3">
                                <Calendar className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-600 font-medium">
                                  Estimated delivery: Oct 2025
                                </span>
                              </div>

                              {/* Limited Quantity */}
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">
                                    !
                                  </span>
                                </div>
                                <span className="text-sm text-orange-600 font-semibold">
                                  {quantityLeft[index]} left of{" "}
                                  {quantityTotal[index]}
                                </span>
                              </div>

                              {/* Description */}
                              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                                {tier.description}
                              </p>

                              {/* Additional Details */}
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Shield className="w-3 h-3" />
                                  <span className="font-medium">
                                    100% satisfaction guaranteed
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-green-600">
                                  <CheckCircle className="w-3 h-3" />
                                  <span className="font-medium">
                                    Includes shipping worldwide
                                  </span>
                                </div>
                              </div>

                              {/* Pledge Button */}
                              <Button
                                className={`w-full font-semibold py-3 text-sm rounded-lg transition-all duration-300 ${
                                  isPopular
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "bg-gray-900 hover:bg-black text-white"
                                }`}
                                onClick={() => {
                                  // Store pledge intent in localStorage
                                  const pledgeIntent = {
                                    campaignId: campaign.id,
                                    campaignTitle: campaign.title,
                                    tierId: tier.id,
                                    tierTitle: tier.title,
                                    amount: tier.amount,
                                    timestamp: new Date().toISOString()
                                  };
                                  localStorage.setItem('pledgeIntent', JSON.stringify(pledgeIntent));
                                  
                                  // Redirect to payment page or show payment modal
                                  window.location.href = `/payment?campaign=${campaign.id}&tier=${tier.id}&amount=${tier.amount}`;
                                }}
                              >
                                <Heart className="w-4 h-4 mr-2" />
                                Pledge ${(tier.amount / 100).toFixed(0)}
                              </Button>
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Gift className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">
                          No rewards available
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Support this project with any amount!
                        </p>
                        <Button 
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 font-semibold rounded-lg"
                          onClick={() => {
                            // Store pledge intent for general support
                            const pledgeIntent = {
                              campaignId: campaign.id,
                              campaignTitle: campaign.title,
                              tierId: null,
                              tierTitle: 'General Support',
                              amount: 0, // Will be set by user
                              timestamp: new Date().toISOString()
                            };
                            localStorage.setItem('pledgeIntent', JSON.stringify(pledgeIntent));
                            
                            // Redirect to payment page
                            window.location.href = `/payment?campaign=${campaign.id}&amount=0`;
                          }}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Support Now
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Campaign Timeline */}
                <Card className="border-0 shadow-xl rounded-2xl sticky top-[400px]">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl font-black text-gray-900">
                      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      Campaign Timeline
                    </CardTitle>
                    <p className="text-gray-600 text-sm font-medium">
                      Key milestones and progress updates
                    </p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Timeline Items */}
                    <div className="space-y-4">
                      {keyMilestones.map((milestone, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div
                            className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                              milestone.completed
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                          <div className="flex-1">
                            <h4
                              className={`font-semibold text-sm ${
                                milestone.completed
                                  ? "text-green-700"
                                  : "text-gray-700"
                              }`}
                            >
                              {milestone.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-1">
                              {milestone.description}
                            </p>
                            <span
                              className={`text-xs font-medium ${
                                milestone.completed
                                  ? "text-green-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {milestone.date}
                            </span>
                          </div>
                          {milestone.completed && (
                            <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                          )}
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Campaign Stats */}
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 mb-3">
                        Campaign Performance
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-black text-green-600">
                            {campaignStats.fundingPercentage}%
                          </div>
                          <div className="text-xs text-gray-600">Funded</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-black text-blue-600">
                            {campaignStats.totalBackers.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Backers</div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg"
                      onClick={() => {
                        const followed = localStorage.getItem("followedCampaigns") || "[]";
                        const followedCampaigns = JSON.parse(followed);
                        if (!followedCampaigns.includes(campaign.id)) {
                          followedCampaigns.push(campaign.id);
                          localStorage.setItem("followedCampaigns", JSON.stringify(followedCampaigns));
                          // Show success feedback
                          const button = document.querySelector('[data-follow-button]') as HTMLButtonElement;
                          if (button) {
                            const originalText = button.innerHTML;
                            button.innerHTML = '<CheckCircle className="w-4 h-4 mr-2" />Following';
                            button.classList.add('bg-green-600', 'hover:bg-green-700');
                            setTimeout(() => {
                              button.innerHTML = originalText;
                              button.classList.remove('bg-green-600', 'hover:bg-green-700');
                            }, 2000);
                          }
                        } else {
                          // Unfollow
                          const updatedCampaigns = followedCampaigns.filter((id: string) => id !== campaign.id);
                          localStorage.setItem("followedCampaigns", JSON.stringify(updatedCampaigns));
                          const button = document.querySelector('[data-follow-button]') as HTMLButtonElement;
                          if (button) {
                            const originalText = button.innerHTML;
                            button.innerHTML = '<Star className="w-4 h-4 mr-2" />Follow Updates';
                            button.classList.remove('bg-green-600', 'hover:bg-green-700');
                            setTimeout(() => {
                              button.innerHTML = originalText;
                            }, 2000);
                          }
                        }
                      }}
                      data-follow-button
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Follow Updates
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
