"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Eye,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Campaign } from "@/lib/database";
import { getCampaignsByOwner } from "@/lib/database";

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // Check for mock user first
      if (typeof window !== 'undefined') {
        const mockUser = localStorage.getItem('mockUser');
        if (mockUser) {
          const user = JSON.parse(mockUser);
          setCurrentUser(user);
          await loadUserCampaigns(user.id);
          return;
        }
      }

      // Try Supabase auth
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        setCurrentUser(user);
        await loadUserCampaigns(user.id);
      } else {
        // No user found, redirect to sign in
        router.push('/auth/signin');
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setError("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserCampaigns = async (userId: string) => {
    try {
      const userCampaigns = await getCampaignsByOwner(userId);
      setCampaigns(userCampaigns);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      setError("Failed to load campaigns");
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear mock user
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mockUser');
      }
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-green-50/20 to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2 text-primary" />
            <span className="text-lg font-medium">Loading dashboard...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-green-50/20 to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-green-50/20 to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">Please sign in to access your dashboard</p>
            <Button onClick={() => router.push('/auth/signin')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalFunding = campaigns.reduce((sum, campaign) => sum + (campaign.current_funding || 0), 0);
  const totalGoal = campaigns.reduce((sum, campaign) => sum + campaign.funding_goal, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/20 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text-hero mb-2">
              Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome back, {currentUser.full_name || currentUser.email?.split('@')[0] || 'User'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push('/campaign/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Funding</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalFunding)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold">{activeCampaigns}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                  <p className="text-2xl font-bold">{campaigns.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {totalGoal > 0 ? Math.round((totalFunding / totalGoal) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Campaigns</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {campaigns.filter(c => c.status === 'active').length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No active campaigns yet</p>
                  <Button onClick={() => router.push('/campaign/create')}>
                    Create Your First Campaign
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {campaigns
                  .filter(c => c.status === 'active')
                  .map((campaign) => (
                    <Card key={campaign.id} className="overflow-hidden">
                      {campaign.cover_image && (
                        <div className="aspect-video bg-muted">
                          <img
                            src={campaign.cover_image}
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{campaign.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {campaign.description}
                            </CardDescription>
                          </div>
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{formatCurrency(campaign.current_funding || 0)} / {formatCurrency(campaign.funding_goal)}</span>
                          </div>
                          <Progress value={calculateProgress(campaign.current_funding || 0, campaign.funding_goal)} />
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {getDaysRemaining(campaign.end_date)} days left
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            View Campaign
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Analytics
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {campaigns.filter(c => c.status === 'completed').length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">No completed campaigns yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {campaigns
                  .filter(c => c.status === 'completed')
                  .map((campaign) => (
                    <Card key={campaign.id} className="overflow-hidden">
                      <CardHeader>
                        <CardTitle>{campaign.title}</CardTitle>
                        <CardDescription>{campaign.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span>Final Funding: {formatCurrency(campaign.current_funding || 0)}</span>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="drafts" className="space-y-6">
            {campaigns.filter(c => c.status === 'draft').length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">No draft campaigns</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {campaigns
                  .filter(c => c.status === 'draft')
                  .map((campaign) => (
                    <Card key={campaign.id} className="overflow-hidden">
                      <CardHeader>
                        <CardTitle>{campaign.title}</CardTitle>
                        <CardDescription>{campaign.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-2" />
                            Continue Editing
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
