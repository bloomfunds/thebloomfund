"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Heart,
  Share2,
  Calendar,
  Target,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

// Mock analytics data
const campaignPerformanceData = [
  { name: "Jan", funding: 12000, backers: 120, views: 2400 },
  { name: "Feb", funding: 19000, backers: 190, views: 3200 },
  { name: "Mar", funding: 25000, backers: 250, views: 4100 },
  { name: "Apr", funding: 35000, backers: 350, views: 5200 },
  { name: "May", funding: 45000, backers: 450, views: 6800 },
  { name: "Jun", funding: 65000, backers: 650, views: 8900 },
];

const trafficSourceData = [
  { name: "Direct", value: 35, color: "#0ea5e9" },
  { name: "Social Media", value: 28, color: "#10b981" },
  { name: "Search", value: 20, color: "#f59e0b" },
  { name: "Referral", value: 12, color: "#ef4444" },
  { name: "Email", value: 5, color: "#8b5cf6" },
];

const conversionFunnelData = [
  { stage: "Page Views", count: 15420, percentage: 100 },
  { stage: "Campaign Views", count: 8930, percentage: 58 },
  { stage: "Pledge Initiated", count: 2140, percentage: 14 },
  { stage: "Pledge Completed", count: 1680, percentage: 11 },
];

const geographicData = [
  { country: "United States", backers: 450, funding: 45000 },
  { country: "Canada", backers: 120, funding: 12000 },
  { country: "United Kingdom", backers: 89, funding: 8900 },
  { country: "Germany", backers: 67, funding: 6700 },
  { country: "Australia", backers: 45, funding: 4500 },
];

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleExport = () => {
    // Simulate export functionality
    const data = {
      period: selectedPeriod,
      campaign: selectedCampaign,
      performance: campaignPerformanceData,
      traffic: trafficSourceData,
      conversion: conversionFunnelData,
      geographic: geographicData,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${selectedPeriod}-${Date.now()}.json`;
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
              Campaign Analytics
            </h1>
            <p className="text-lg text-muted-foreground">
              Track performance, understand your audience, and optimize your
              campaigns
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={selectedCampaign}
              onValueChange={setSelectedCampaign}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                <SelectItem value="coffee">Coffee House Campaign</SelectItem>
                <SelectItem value="tech">Tech Innovation Hub</SelectItem>
                <SelectItem value="garden">Community Garden</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Total Funding
                  </p>
                  <p className="text-3xl font-bold gradient-text">$275K</p>
                  <div className="flex items-center mt-2 text-sm text-green-600">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    <span>+12.5% from last month</span>
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
                  <p className="text-3xl font-bold text-blue-600">2,750</p>
                  <div className="flex items-center mt-2 text-sm text-blue-600">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    <span>+8.2% from last month</span>
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
                    Page Views
                  </p>
                  <p className="text-3xl font-bold text-purple-600">45.2K</p>
                  <div className="flex items-center mt-2 text-sm text-purple-600">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    <span>+15.3% from last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Conversion Rate
                  </p>
                  <p className="text-3xl font-bold text-orange-600">3.7%</p>
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                    <span>-2.1% from last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="performance" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
            <TabsTrigger value="performance" className="rounded-xl">
              <BarChart3 className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="audience" className="rounded-xl">
              <Users className="w-4 h-4 mr-2" />
              Audience
            </TabsTrigger>
            <TabsTrigger value="traffic" className="rounded-xl">
              <TrendingUp className="w-4 h-4 mr-2" />
              Traffic
            </TabsTrigger>
            <TabsTrigger value="conversion" className="rounded-xl">
              <Target className="w-4 h-4 mr-2" />
              Conversion
            </TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-white border-0 shadow-2xl rounded-3xl">
              <CardHeader className="pb-8 bg-gradient-to-r from-slate-900 to-gray-900 text-white rounded-t-3xl">
                <CardTitle className="text-2xl font-bold">
                  Campaign Performance Over Time
                </CardTitle>
                <p className="text-gray-300">
                  Track funding progress, backer growth, and engagement metrics
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={campaignPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        stroke="#6b7280"
                        fontSize={12}
                        fontWeight={600}
                      />
                      <YAxis stroke="#6b7280" fontSize={12} fontWeight={600} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "16px",
                          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                          fontWeight: 600,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="funding"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.2}
                        strokeWidth={3}
                      />
                      <Area
                        type="monotone"
                        dataKey="backers"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle>Daily Funding Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={campaignPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="funding"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle>Backer Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={campaignPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="backers"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {geographicData.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-semibold">{item.country}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.backers} backers
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            ${(item.funding / 1000).toFixed(0)}K
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle>Audience Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Age Distribution</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">18-24</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full">
                              <div className="w-3/5 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium">15%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">25-34</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full">
                              <div className="w-4/5 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium">35%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">35-44</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full">
                              <div className="w-3/4 h-2 bg-purple-500 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium">28%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">45+</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full">
                              <div className="w-1/2 h-2 bg-orange-500 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium">22%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">
                        Gender Distribution
                      </h4>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">Male (52%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
                          <span className="text-sm">Female (45%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                          <span className="text-sm">Other (3%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Traffic Tab */}
          <TabsContent value="traffic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={trafficSourceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {trafficSourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {trafficSourceData.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle>Top Referrers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { source: "Facebook", visits: 1240, percentage: 28 },
                      { source: "Twitter", visits: 890, percentage: 20 },
                      { source: "LinkedIn", visits: 650, percentage: 15 },
                      { source: "Instagram", visits: 420, percentage: 10 },
                      { source: "Reddit", visits: 380, percentage: 9 },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-semibold">{item.source}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.visits} visits
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">
                            {item.percentage}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conversion Tab */}
          <TabsContent value="conversion" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <p className="text-muted-foreground">
                  Track how visitors move through your campaign funnel
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionFunnelData.map((stage, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{stage.stage}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {stage.count.toLocaleString()}
                          </span>
                          <Badge variant="secondary">{stage.percentage}%</Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${stage.percentage}%` }}
                        />
                      </div>
                      {index < conversionFunnelData.length - 1 && (
                        <div className="flex justify-center mt-2">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-gray-400"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    3.7%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    From page views to pledges
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Avg. Pledge Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    $164
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Per successful pledge
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Return Visitors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    24%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Of total visitors
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
