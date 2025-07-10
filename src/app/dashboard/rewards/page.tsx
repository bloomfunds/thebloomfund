"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Gift,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit3,
  Eye,
  Download,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RewardFulfillment {
  id: string;
  campaignTitle: string;
  rewardTitle: string;
  backerName: string;
  backerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  pledgeAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  notes?: string;
  createdAt: string;
}

const mockRewardFulfillments: RewardFulfillment[] = [
  {
    id: "rf-001",
    campaignTitle: "Cozy Corner Coffee House",
    rewardTitle: "Premium Coffee Package",
    backerName: "Sarah Johnson",
    backerEmail: "sarah@example.com",
    shippingAddress: {
      street: "123 Main St",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      country: "USA",
    },
    pledgeAmount: 4900,
    status: "processing",
    estimatedDelivery: "2024-03-15",
    notes: "Customer requested expedited shipping",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "rf-002",
    campaignTitle: "Tech Innovation Hub",
    rewardTitle: "Early Bird Access",
    backerName: "Michael Chen",
    backerEmail: "michael@example.com",
    shippingAddress: {
      street: "456 Tech Ave",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "USA",
    },
    pledgeAmount: 5000,
    status: "shipped",
    trackingNumber: "1Z999AA1234567890",
    estimatedDelivery: "2024-03-10",
    notes: "Digital access codes included",
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "rf-003",
    campaignTitle: "Community Garden Project",
    rewardTitle: "Garden Starter Kit",
    backerName: "Emma Davis",
    backerEmail: "emma@example.com",
    shippingAddress: {
      street: "789 Garden Ln",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      country: "USA",
    },
    pledgeAmount: 7500,
    status: "delivered",
    trackingNumber: "1Z999AA1234567891",
    estimatedDelivery: "2024-02-28",
    actualDelivery: "2024-02-26",
    createdAt: "2024-01-05T00:00:00Z",
  },
];

export default function RewardsPage() {
  const [rewards, setRewards] = useState<RewardFulfillment[]>(
    mockRewardFulfillments,
  );
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReward, setSelectedReward] =
    useState<RewardFulfillment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "processing":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "shipped":
        return <Truck className="w-4 h-4 text-orange-500" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-orange-100 text-orange-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const updateRewardStatus = (
    rewardId: string,
    newStatus: string,
    trackingNumber?: string,
  ) => {
    setRewards((prev) =>
      prev.map((reward) =>
        reward.id === rewardId
          ? {
              ...reward,
              status: newStatus as any,
              trackingNumber: trackingNumber || reward.trackingNumber,
              actualDelivery:
                newStatus === "delivered"
                  ? new Date().toISOString().split("T")[0]
                  : reward.actualDelivery,
            }
          : reward,
      ),
    );
  };

  const filteredRewards = rewards.filter((reward) => {
    const matchesTab = selectedTab === "all" || reward.status === selectedTab;
    const matchesSearch =
      searchQuery === "" ||
      reward.backerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.rewardTitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const statusCounts = {
    all: rewards.length,
    pending: rewards.filter((r) => r.status === "pending").length,
    processing: rewards.filter((r) => r.status === "processing").length,
    shipped: rewards.filter((r) => r.status === "shipped").length,
    delivered: rewards.filter((r) => r.status === "delivered").length,
  };

  const handleBulkExport = () => {
    const csvContent = [
      [
        "ID",
        "Campaign",
        "Reward",
        "Backer",
        "Email",
        "Status",
        "Tracking",
        "Estimated Delivery",
      ].join(","),
      ...filteredRewards.map((reward) =>
        [
          reward.id,
          reward.campaignTitle,
          reward.rewardTitle,
          reward.backerName,
          reward.backerEmail,
          reward.status,
          reward.trackingNumber || "",
          reward.estimatedDelivery,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rewards-fulfillment-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/20 to-background pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text-hero mb-2">
              Reward Fulfillment
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage and track reward deliveries for your campaign backers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleBulkExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button className="premium-button">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Update
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Total Rewards
                  </p>
                  <p className="text-3xl font-bold gradient-text">
                    {statusCounts.all}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Pending
                  </p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {statusCounts.pending}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    In Transit
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {statusCounts.shipped}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Delivered
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {statusCounts.delivered}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by backer name, campaign, or reward..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedTab} onValueChange={setSelectedTab}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Status ({statusCounts.all})
                  </SelectItem>
                  <SelectItem value="pending">
                    Pending ({statusCounts.pending})
                  </SelectItem>
                  <SelectItem value="processing">
                    Processing ({statusCounts.processing})
                  </SelectItem>
                  <SelectItem value="shipped">
                    Shipped ({statusCounts.shipped})
                  </SelectItem>
                  <SelectItem value="delivered">
                    Delivered ({statusCounts.delivered})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Rewards List */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-500" />
              Reward Fulfillments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredRewards.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No rewards found
                </h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : "No reward fulfillments to display"}
                </p>
              </div>
            ) : (
              filteredRewards.map((reward) => (
                <Card
                  key={reward.id}
                  className="border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge
                            className={`${getStatusColor(reward.status)} border-0`}
                          >
                            {getStatusIcon(reward.status)}
                            <span className="ml-1 capitalize">
                              {reward.status}
                            </span>
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            #{reward.id}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Campaign & Reward Info */}
                          <div>
                            <h3 className="font-semibold text-lg mb-1">
                              {reward.rewardTitle}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {reward.campaignTitle}
                            </p>
                            <div className="text-lg font-bold text-green-600">
                              ${(reward.pledgeAmount / 100).toFixed(0)}
                            </div>
                          </div>

                          {/* Backer Info */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">
                                {reward.backerName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {reward.backerEmail}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {reward.shippingAddress.city},{" "}
                                {reward.shippingAddress.state}
                              </span>
                            </div>
                          </div>

                          {/* Delivery Info */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                Est:{" "}
                                {new Date(
                                  reward.estimatedDelivery,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {reward.trackingNumber && (
                              <div className="flex items-center gap-2 mb-2">
                                <Truck className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-mono">
                                  {reward.trackingNumber}
                                </span>
                              </div>
                            )}
                            {reward.actualDelivery && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-600">
                                  Delivered:{" "}
                                  {new Date(
                                    reward.actualDelivery,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {reward.notes && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {reward.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Reward Details</DialogTitle>
                              <DialogDescription>
                                Complete information for reward fulfillment #
                                {reward.id}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="font-semibold">
                                    Campaign
                                  </Label>
                                  <p>{reward.campaignTitle}</p>
                                </div>
                                <div>
                                  <Label className="font-semibold">
                                    Reward
                                  </Label>
                                  <p>{reward.rewardTitle}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="font-semibold">
                                    Backer Name
                                  </Label>
                                  <p>{reward.backerName}</p>
                                </div>
                                <div>
                                  <Label className="font-semibold">Email</Label>
                                  <p>{reward.backerEmail}</p>
                                </div>
                              </div>

                              <div>
                                <Label className="font-semibold">
                                  Shipping Address
                                </Label>
                                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                  <p>{reward.shippingAddress.street}</p>
                                  <p>
                                    {reward.shippingAddress.city},{" "}
                                    {reward.shippingAddress.state}{" "}
                                    {reward.shippingAddress.zipCode}
                                  </p>
                                  <p>{reward.shippingAddress.country}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="font-semibold">
                                    Status
                                  </Label>
                                  <div className="mt-1">
                                    <Badge
                                      className={`${getStatusColor(reward.status)} border-0`}
                                    >
                                      {getStatusIcon(reward.status)}
                                      <span className="ml-1 capitalize">
                                        {reward.status}
                                      </span>
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label className="font-semibold">
                                    Pledge Amount
                                  </Label>
                                  <p className="text-lg font-bold text-green-600">
                                    ${(reward.pledgeAmount / 100).toFixed(0)}
                                  </p>
                                </div>
                              </div>

                              {reward.trackingNumber && (
                                <div>
                                  <Label className="font-semibold">
                                    Tracking Number
                                  </Label>
                                  <p className="font-mono">
                                    {reward.trackingNumber}
                                  </p>
                                </div>
                              )}

                              {reward.notes && (
                                <div>
                                  <Label className="font-semibold">Notes</Label>
                                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                    <p>{reward.notes}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                updateRewardStatus(reward.id, "processing")
                              }
                              disabled={reward.status === "processing"}
                            >
                              <Package className="w-4 h-4 mr-2" />
                              Mark as Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const tracking = prompt(
                                  "Enter tracking number:",
                                );
                                if (tracking) {
                                  updateRewardStatus(
                                    reward.id,
                                    "shipped",
                                    tracking,
                                  );
                                }
                              }}
                              disabled={
                                reward.status === "shipped" ||
                                reward.status === "delivered"
                              }
                            >
                              <Truck className="w-4 h-4 mr-2" />
                              Mark as Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateRewardStatus(reward.id, "delivered")
                              }
                              disabled={reward.status === "delivered"}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Delivered
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
