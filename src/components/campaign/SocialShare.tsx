"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageCircle,
  Copy,
  Check,
  Instagram,
  Send,
  Users,
  Heart,
  ExternalLink,
} from "lucide-react";
import { Tables } from "@/types/supabase";

type Campaign = Tables<"campaigns">;

interface SocialShareProps {
  campaign: Campaign;
  className?: string;
}

export default function SocialShare({ campaign, className }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState(
    `Check out this amazing campaign: ${campaign.title}! Help ${campaign.owner_name} reach their goal of $${(campaign.funding_goal / 100).toLocaleString()}.`,
  );

  const campaignUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/campaigns/${campaign.id}`;

  const shareData = {
    title: campaign.title,
    description: campaign.description.substring(0, 150) + "...",
    url: campaignUrl,
    hashtags: ["crowdfunding", "startup", "entrepreneur", "bloom"],
    via: "BloomCrowdfund",
  };

  const socialPlatforms = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(customMessage)}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-sky-500 hover:bg-sky-600",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(customMessage)}&url=${encodeURIComponent(shareData.url)}&hashtags=${shareData.hashtags.join(",")}&via=${shareData.via}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}&summary=${encodeURIComponent(shareData.description)}`,
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-600 hover:bg-green-700",
      url: `https://wa.me/?text=${encodeURIComponent(customMessage + " " + shareData.url)}`,
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-gray-600 hover:bg-gray-700",
      url: `mailto:?subject=${encodeURIComponent(`Check out: ${shareData.title}`)}&body=${encodeURIComponent(customMessage + "\n\n" + shareData.url)}`,
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-blue-500 hover:bg-blue-600",
      url: `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(customMessage)}`,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: customMessage,
          url: shareData.url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    }
  };

  const handleSocialShare = (platform: (typeof socialPlatforms)[0]) => {
    window.open(
      platform.url,
      "_blank",
      "width=600,height=400,scrollbars=yes,resizable=yes",
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Share2 className="w-4 h-4 mr-2" />
          Share Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share This Campaign
          </DialogTitle>
          <DialogDescription>
            Help {campaign.owner_name} reach their funding goal by sharing this
            campaign with your network.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Preview */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-start gap-4">
              <img
                src={
                  campaign.cover_image ||
                  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&q=80"
                }
                alt={campaign.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {campaign.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  by {campaign.owner_name}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-700">
                      ${((campaign.current_funding || 0) / 100).toLocaleString()}
                    </span>
                    <span className="text-gray-600">raised</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700"
                  >
                    {Math.round(
                      ((campaign.current_funding || 0) / campaign.funding_goal) * 100,
                    )}
                    % funded
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Customize Your Message</Label>
            <Textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="min-h-[100px]"
              placeholder="Add a personal message to encourage people to support this campaign..."
            />
            <p className="text-sm text-muted-foreground">
              {customMessage.length}/280 characters
            </p>
          </div>

          {/* Social Media Platforms */}
          <div className="space-y-3">
            <Label>Share on Social Media</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <Button
                    key={platform.name}
                    onClick={() => handleSocialShare(platform)}
                    className={`${platform.color} text-white border-0 hover:scale-105 transition-all duration-200`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {platform.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <Label>Campaign Link</Label>
            <div className="flex gap-2">
              <Input
                value={shareData.url}
                readOnly
                className="flex-1 bg-gray-50"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className={copied ? "text-green-600 border-green-600" : ""}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Native Share (Mobile) */}
          {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
            <Button
              onClick={handleNativeShare}
              className="w-full premium-button"
            >
              <Users className="w-4 h-4 mr-2" />
              Share via Device
            </Button>
          )}

          {/* Share Statistics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Why Sharing Matters
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">3x</div>
                <div className="text-muted-foreground">
                  More likely to succeed
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary">67%</div>
                <div className="text-muted-foreground">
                  Come from social shares
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary">24h</div>
                <div className="text-muted-foreground">Peak sharing window</div>
              </div>
            </div>
          </div>

          {/* Suggested Hashtags */}
          <div className="space-y-2">
            <Label>Suggested Hashtags</Label>
            <div className="flex flex-wrap gap-2">
              {shareData.hashtags.map((hashtag) => (
                <Badge
                  key={hashtag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => {
                    const hashtagText = `#${hashtag}`;
                    if (!customMessage.includes(hashtagText)) {
                      setCustomMessage(customMessage + " " + hashtagText);
                    }
                  }}
                >
                  #{hashtag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-blue-900 mb-2">Sharing Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Add a personal note about why you support this campaign</li>
              <li>• Share during peak hours (9-11 AM, 7-9 PM)</li>
              <li>• Tag friends who might be interested</li>
              <li>• Share updates as the campaign progresses</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
