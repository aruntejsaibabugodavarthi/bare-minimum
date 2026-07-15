'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Search, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function OrdersPage() {
  const [orders] = useState([
    {
      id: 'ORD-1004',
      date: 'Nov 20, 2023',
      total: 699,
      status: 'Out for Delivery',
      items: [{ name: 'Premium Tumbler', image: '🥤' }]
    },
    {
      id: 'ORD-1002',
      date: 'Nov 15, 2023',
      total: 1299,
      status: 'Delivered',
      items: [
        { name: 'Daily Roast Coffee - 250g', image: '☕' },
        { name: 'Almond Butter', image: '🥜' }
      ]
    },
    {
      id: 'ORD-0988',
      date: 'Oct 22, 2023',
      total: 399,
      status: 'Returned',
      items: [{ name: 'Ceramic Mug', image: '🍵' }]
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'Returned':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-medium">My Orders</h3>
          <p className="text-sm text-muted-foreground">Track, return, or buy items again.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search all orders..." className="pl-8" />
        </div>
        <Select defaultValue="6months">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="6months">Past 6 months</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            {/* Desktop header */}
            <div className="bg-slate-50 border-b p-4 hidden md:flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex gap-8">
                <div>
                  <p className="uppercase text-xs font-semibold">Order Placed</p>
                  <p className="text-foreground">{order.date}</p>
                </div>
                <div>
                  <p className="uppercase text-xs font-semibold">Total</p>
                  <p className="text-foreground">₹{order.total}</p>
                </div>
                <div>
                  <p className="uppercase text-xs font-semibold">Ship To</p>
                  <p className="text-blue-600 hover:underline cursor-pointer">Rahul Sharma</p>
                </div>
              </div>
              <div className="text-right">
                <p className="uppercase text-xs font-semibold">Order # {order.id}</p>
                <div className="flex space-x-2 mt-1">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Details
                  </Link>
                  <span>|</span>
                  <Link href="#" className="text-blue-600 hover:underline">
                    Invoice
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile header */}
            <div className="bg-slate-50 border-b p-4 md:hidden flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{order.id}</p>
                <p className="text-xs text-muted-foreground">
                  {order.date} • ₹{order.total}
                </p>
              </div>
              <Badge variant="secondary" className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
            </div>

            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4 flex-1">
                  <div className="hidden md:block mb-4">
                    <h4 className="font-semibold text-lg">{order.status}</h4>
                  </div>

                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <div className="h-16 w-16 bg-slate-100 rounded-md flex items-center justify-center text-3xl border">
                        {item.image}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium hover:text-blue-600 cursor-pointer line-clamp-1">
                          {item.name}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" className="h-8">
                            Buy it again
                          </Button>
                          <Button variant="outline" size="sm" className="h-8">
                            Track package
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden md:flex flex-col gap-2 ml-4 w-48 shrink-0">
                  <Button variant="outline" className="w-full justify-center">
                    Track package
                  </Button>
                  <Button variant="outline" className="w-full justify-center">
                    Return or replace items
                  </Button>
                  <Button variant="outline" className="w-full justify-center">
                    Write a product review
                  </Button>
                </div>

                {/* Mobile view details chevron */}
                <div className="md:hidden flex items-center self-stretch ml-2">
                  <Link href={`/account/orders/${order.id}`}>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
