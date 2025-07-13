"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Loader2,
  Grid3X3,
  List,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { searchCampaigns } from "@/lib/database";
import { Tables } from "@/types/supabase";

type Campaign = Tables<"campaigns">;
import { useSearchParams } from "next/navigation";

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "most_funded" | "ending_soon";

const categories = [
  "All Categories",
  "Technology",
  "Food & Beverage",
  "Retail",
  "Services",
  "Manufacturing",
  "Environment",
  "Arts & Culture",
  "Health & Wellness",
  "Other",
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All Categories",
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, [searchQuery, selectedCategory, sortBy]);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const sortMapping = {
        newest: { sortBy: "created_at", sortOrder: "desc" as const },
        oldest: { sortBy: "created_at", sortOrder: "asc" as const },
        most_funded: { sortBy: "current_funding", sortOrder: "desc" as const },
        ending_soon: { sortBy: "end_date", sortOrder: "asc" as const },
      };

      const { sortBy: sortField, sortOrder } = sortMapping[sortBy];

      const data = await searchCampaigns({
        query: searchQuery || undefined,
        category:
          selectedCategory === "All Categories"
            ? undefined
            : selectedCategory.toLowerCase(),
        sortBy: sortField,
        sortOrder,
        limit: 24,
      });

      // Convert database Campaign type to Supabase Campaign type
      const convertedData = data.map(campaign => ({
        ...campaign,
        cover_image: campaign.cover_image || null,
        current_funding: campaign.current_funding ?? null,
        owner_id: campaign.owner_id || '',
        created_at: campaign.created_at || null,
        updated_at: campaign.updated_at || null,
        website: campaign.website || null,
        owner_avatar: campaign.owner_avatar || null,
        payout_status: campaign.payout_status ?? null,
        payout_amount: campaign.payout_amount ?? null,
        payout_requested_at: campaign.payout_requested_at ?? null,
        payout_processed_at: campaign.payout_processed_at ?? null,
        stripe_transfer_id: campaign.stripe_transfer_id ?? null,
      }));
      setCampaigns(convertedData);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      setCampaigns([]);
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

  const calculateFundingPercentage = (current: number | null, goal: number) => {
    const currentAmount = current || 0;
    return Math.min(Math.round((currentAmount / goal) * 100), 100);
  };

  const CampaignCard = ({
    campaign,
    isListView = false,
  }: {
    campaign: Campaign;
    isListView?: boolean;
  }) => {
    const daysRemaining = calculateDaysRemaining(campaign.end_date);
    const fundingPercentage = calculateFundingPercentage(
      campaign.current_funding,
      campaign.funding_goal,
    );

    if (isListView) {
      return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex">
            <div className="w-48 h-32 flex-shrink-0">
              <img
                src={
                  campaign.cover_image ||
                  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&q=80"
                }
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{campaign.category.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {campaign.location}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-1 line-clamp-1">
                    {campaign.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {campaign.description}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    by {campaign.business_name}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold">
                    ${(campaign.current_funding || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    of ${campaign.funding_goal.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {daysRemaining} days left
                  </div>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-3">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${fundingPercentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {fundingPercentage}% funded
                </div>
                <Button asChild size="sm">
                  <Link href={`/campaigns/${campaign.id}`}>View Campaign</Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] transform">
        <div className="aspect-video relative">
          <img
            src={
              campaign.cover_image ||
              "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&q=80"
            }
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="shadow-lg">
              {campaign.category}
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="text-white font-medium">
              {fundingPercentage}% Funded
            </div>
          </div>
        </div>
        <CardHeader>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="h-3 w-3 mr-1" />
            {campaign.location}
          </div>
          <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {campaign.description}
          </CardDescription>
          <p className="text-sm font-medium text-muted-foreground">
            by {campaign.business_name}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${fundingPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-bold">
                ${(campaign.current_funding || 0).toLocaleString()}
              </span>
              <span className="text-muted-foreground">
                Goal: ${campaign.funding_goal.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {daysRemaining} days left
              </div>
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />0 backers
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={`/campaigns/${campaign.id}`}>View Campaign</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text-hero">
            Search Campaigns
          </h1>
          <p className="text-lg text-muted-foreground">
            Find the perfect project to support from thousands of innovative
            campaigns
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-6 mb-8">
          {/* Main Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for campaigns, businesses, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex flex-1 gap-4">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger className="w-40 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="most_funded">Most Funded</SelectItem>
                  <SelectItem value="ending_soon">Ending Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Advanced Filters Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <Card className="p-6 bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Funding Goal Range
                  </label>
                  <div className="flex gap-2">
                    <Input placeholder="Min" className="flex-1" />
                    <Input placeholder="Max" className="flex-1" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Location
                  </label>
                  <Input placeholder="City, State, Country" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Time Remaining
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any time</SelectItem>
                      <SelectItem value="week">Less than 1 week</SelectItem>
                      <SelectItem value="month">Less than 1 month</SelectItem>
                      <SelectItem value="more">More than 1 month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All Categories");
                    setSortBy("newest");
                  }}
                >
                  Clear All
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all campaigns
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
              }}
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}{" "}
                found
                {searchQuery && (
                  <span>
                    {" "}
                    for &quot;<strong>{searchQuery}</strong>&quot;
                  </span>
                )}
              </p>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {campaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    isListView
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
