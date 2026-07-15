'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, Wallet, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';

export default function AccountHomePage() {
  // Mock data - in real app, fetch from /api/account/profile and /api/account/orders
  const user = { name: 'Rahul Sharma', walletBalance: 1250 };
  const activeOrders = [
    { id: 'ORD-1004', status: 'Out for Delivery', items: 'Premium Tumbler', eta: 'Today, 4:00 PM' }
  ];
  const frequentItems = [
    { id: '1', name: 'Daily Roast Coffee - 250g', price: 499, image: '☕' },
    { id: '2', name: 'Almond Butter', price: 399, image: '🥜' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-medium">Hello, {user.name}!</h3>
        <p className="text-sm text-muted-foreground">Welcome to your account dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/account/orders">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeOrders.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeOrders.length > 0 ? '1 order arriving today' : 'No active orders'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/account/wallet">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{user.walletBalance}</div>
              <p className="text-xs text-muted-foreground mt-1">Available store credit</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {activeOrders.length > 0 && (
        <Card className="border-blue-100 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-600" />
              In Transit
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="flex justify-between items-center bg-white p-3 rounded-md border shadow-sm"
              >
                <div>
                  <p className="font-medium text-sm">{order.items}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.status} • {order.eta}
                  </p>
                </div>
                <Link
                  href={`/account/orders/${order.id}`}
                  className={buttonVariants({ size: 'sm', variant: 'outline' })}
                >
                  Track
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h4 className="text-lg font-medium">Buy it again</h4>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {frequentItems.map((item) => (
            <Card key={item.id} className="min-w-[200px] flex-shrink-0">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <div className="text-4xl">{item.image}</div>
                <div>
                  <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                  <p className="text-sm text-muted-foreground">₹{item.price}</p>
                </div>
                <Button size="sm" className="w-full mt-2">
                  <Package className="w-4 h-4 mr-2" /> Reorder
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
