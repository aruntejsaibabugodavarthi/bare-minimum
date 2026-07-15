'use client';

import { useState } from 'react';
import { Bell, Gift, Package, Tag, Check, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 'N-1',
      type: 'order',
      title: 'Out for Delivery',
      message: 'Your order ORD-1004 is out for delivery and will arrive today by 4 PM.',
      time: '2 hours ago',
      isRead: false
    },
    {
      id: 'N-2',
      type: 'promo',
      title: 'Price Drop Alert!',
      message: 'An item in your wishlist (Smart Watch) just dropped by ₹5,000.',
      time: '1 day ago',
      isRead: false
    },
    {
      id: 'N-3',
      type: 'loyalty',
      title: 'Points Earned',
      message: 'You earned 150 points for your recent purchase.',
      time: '1 week ago',
      isRead: true
    }
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'promo':
        return <Tag className="w-5 h-5 text-red-600" />;
      case 'loyalty':
        return <Gift className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-medium">Notifications & Rewards</h3>
          <p className="text-sm text-muted-foreground">
            Stay updated on your orders and loyalty points.
          </p>
        </div>
      </div>

      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-purple-900 flex items-center">
            <Coins className="w-5 h-5 mr-2 text-purple-600" /> BareMinimum Rewards
          </CardTitle>
          <CardDescription className="text-purple-800">Your loyalty balance</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-purple-950">
              2,450 <span className="text-lg font-medium text-purple-700">pts</span>
            </div>
            <p className="text-sm text-purple-800/80 mt-1">Equivalent to ₹245.00</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">Redeem Now</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Bell className="w-5 h-5 mr-2" /> Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 bg-red-500">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <Check className="w-4 h-4 mr-2" /> Mark all read
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-slate-200 mb-4" />
              <p className="text-lg font-medium text-slate-600">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 flex gap-4 transition-colors ${notif.isRead ? 'bg-white' : 'bg-blue-50/30'}`}
                >
                  <div
                    className={`mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${notif.isRead ? 'bg-slate-100' : 'bg-white shadow-sm ring-1 ring-slate-100'}`}
                  >
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-medium ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}
                      >
                        {notif.title}
                      </p>
                      <span className="text-xs text-muted-foreground">{notif.time}</span>
                    </div>
                    <p className={`text-sm ${notif.isRead ? 'text-slate-500' : 'text-slate-700'}`}>
                      {notif.message}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
