"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Check,
  X,
  Heart,
  MessageCircle,
  TrendingUp,
  Gift,
  Calendar,
  Users,
  DollarSign,
  Settings,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  type: "pledge" | "comment" | "milestone" | "reward" | "campaign" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  avatar?: string;
  metadata?: {
    amount?: number;
    campaignTitle?: string;
    userName?: string;
  };
}

interface NotificationSystemProps {
  userId?: string;
}

export default function NotificationSystem({
  userId = "default-user",
}: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "pledge",
      title: "New Pledge Received!",
      message: "Sarah Martinez pledged $500 to your Coffee House campaign",
      timestamp: "2024-01-20T10:30:00Z",
      read: false,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      metadata: {
        amount: 500,
        campaignTitle: "Cozy Corner Coffee House",
        userName: "Sarah Martinez",
      },
    },
    {
      id: "2",
      type: "milestone",
      title: "Funding Milestone Reached!",
      message: "Your campaign has reached 95% of its funding goal",
      timestamp: "2024-01-20T08:15:00Z",
      read: false,
      metadata: {
        campaignTitle: "Smart Investment Platform",
      },
    },
    {
      id: "3",
      type: "comment",
      title: "New Comment",
      message: "Michael Chen left a comment on your campaign",
      timestamp: "2024-01-19T16:45:00Z",
      read: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
      metadata: {
        campaignTitle: "Tech Innovation Hub",
        userName: "Michael Chen",
      },
    },
    {
      id: "4",
      type: "reward",
      title: "Reward Ready for Fulfillment",
      message: "Premium Package rewards are ready to be shipped",
      timestamp: "2024-01-19T14:20:00Z",
      read: true,
      metadata: {
        campaignTitle: "Artisan Craft Brewery",
      },
    },
    {
      id: "5",
      type: "system",
      title: "Campaign Analytics Update",
      message: "Your weekly campaign performance report is ready",
      timestamp: "2024-01-19T09:00:00Z",
      read: true,
    },
  ]);
  const [filter, setFilter] = useState<string>("all");

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "pledge":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "milestone":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "reward":
        return <Gift className="w-5 h-5 text-purple-500" />;
      case "campaign":
        return <Calendar className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "pledge":
        return "border-l-red-500 bg-red-50";
      case "comment":
        return "border-l-blue-500 bg-blue-50";
      case "milestone":
        return "border-l-green-500 bg-green-50";
      case "reward":
        return "border-l-purple-500 bg-purple-50";
      case "campaign":
        return "border-l-orange-500 bg-orange-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId),
    );
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notif.read;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center relative">
              <Bell className="w-6 h-6 text-white" />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Notifications
              </CardTitle>
              <p className="text-muted-foreground">
                Stay updated with your campaign activity
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter("all")}>
                  All Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("unread")}>
                  Unread Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("pledge")}>
                  Pledges
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("milestone")}>
                  Milestones
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("comment")}>
                  Comments
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("reward")}>
                  Rewards
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <Check className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No notifications found
            </h3>
            <p className="text-gray-600">
              {filter === "unread"
                ? "All caught up! No unread notifications."
                : "You'll see notifications here when there's activity on your campaigns."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`border-l-4 transition-all duration-300 hover:shadow-md ${
                notification.read
                  ? "bg-white"
                  : getNotificationColor(notification.type)
              } ${!notification.read ? "shadow-sm" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Notification Icon or Avatar */}
                  <div className="flex-shrink-0">
                    {notification.avatar ? (
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={notification.avatar} />
                        <AvatarFallback>
                          {notification.metadata?.userName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {notification.message}
                    </p>

                    {/* Metadata */}
                    {notification.metadata && (
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        {notification.metadata.campaignTitle && (
                          <span className="font-medium">
                            {notification.metadata.campaignTitle}
                          </span>
                        )}
                        {notification.metadata.amount && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />$
                            {notification.metadata.amount}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Mark Read
                        </Button>
                      )}
                      {notification.actionUrl && (
                        <Button size="sm" className="premium-button">
                          View Details
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
