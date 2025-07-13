"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Shield,
  DollarSign,
  Clock,
} from "lucide-react";
import { getCurrentUser } from "@/lib/supabase";
import { getUserProfile, updateUserStripeConnect } from "@/lib/database";
import type { User } from "@/lib/database";

export default function ConnectStripePage() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { user } = await getCurrentUser();
      if (user) {
        setUser(user);
        const profile = await getUserProfile(user.id);
        setUserProfile(profile);
        
        // Pre-fill form with user data
        if (profile) {
          setFormData({
            businessName: profile.full_name || "",
            firstName: profile.full_name?.split(" ")[0] || "",
            lastName: profile.full_name?.split(" ").slice(1).join(" ") || "",
            email: profile.email,
            phone: "",
          });
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConnectAccount = async () => {
    if (!user) return;

    setCreatingAccount(true);
    try {
      const response = await fetch("/api/stripe/connect/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          businessName: formData.businessName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Update user profile with Connect account info
        await updateUserStripeConnect(
          user.id,
          result.accountId,
          "pending"
        );

        // Redirect to Stripe Connect onboarding
        window.location.href = result.onboardingUrl;
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating Connect account:", error);
      alert("Failed to create Stripe Connect account. Please try again.");
    } finally {
      setCreatingAccount(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "restricted":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "disabled":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-blue-100 text-blue-700";
      case "restricted":
        return "bg-orange-100 text-orange-700";
      case "disabled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-green-50/20 to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
            <span className="text-lg font-medium">Loading...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-green-50/20 to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              You must be signed in to set up your Stripe Connect account.
            </p>
            <Button asChild>
              <a href="/auth/signin">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/20 to-background">
      <div className="container py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 gradient-text-hero">
              Set Up Your Stripe Connect Account
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect your bank account to receive payouts from your successful campaigns. 
              This is required to receive funds from your crowdfunding campaigns.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Status */}
              {userProfile?.stripe_connect_status && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Account Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(userProfile.stripe_connect_status)}
                        <div>
                          <p className="font-medium">Stripe Connect Account</p>
                          <p className="text-sm text-muted-foreground">
                            {userProfile.stripe_connect_status === "active" 
                              ? "Your account is active and ready to receive payouts"
                              : userProfile.stripe_connect_status === "pending"
                              ? "Your account is being reviewed by Stripe"
                              : "Your account needs attention"}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(userProfile.stripe_connect_status)}>
                        {userProfile.stripe_connect_status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Setup Form */}
              {(!userProfile?.stripe_connect_status || userProfile.stripe_connect_status === "not_setup") && (
                <Card>
                  <CardHeader>
                    <CardTitle>Create Your Stripe Connect Account</CardTitle>
                    <p className="text-muted-foreground">
                      Fill in your business information to create your Stripe Connect account.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="Your Business Name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <Button
                      onClick={handleCreateConnectAccount}
                      disabled={creatingAccount || !formData.firstName || !formData.lastName || !formData.businessName || !formData.email}
                      className="w-full"
                    >
                      {creatingAccount ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Stripe Connect Account
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Pending Status */}
              {userProfile?.stripe_connect_status === "pending" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      Account Under Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your Stripe Connect account is currently under review. This typically takes 1-2 business days. 
                        You'll receive an email notification once your account is approved.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Why Stripe Connect?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Secure Payouts</p>
                      <p className="text-xs text-muted-foreground">Direct bank transfers to your account</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Fast Processing</p>
                      <p className="text-xs text-muted-foreground">Receive funds within 2-3 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Compliance Ready</p>
                      <p className="text-xs text-muted-foreground">Meets all regulatory requirements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payout Policy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Payout Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium mb-2">How it works:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Campaign ends + 7 days waiting period</li>
                      <li>• Request payout from dashboard</li>
                      <li>• 30-day window to claim funds</li>
                      <li>• Unclaimed funds become Bloom's after 30 days</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    Security & Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your financial information is encrypted and secure. We use Stripe's industry-leading 
                    security standards to protect your data.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 