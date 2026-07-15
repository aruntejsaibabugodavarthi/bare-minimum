'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Truck,
  CheckCircle2,
  Circle,
  Clock,
  Receipt,
  RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const router = useRouter();

  // Mock data
  const order = {
    id: id || 'ORD-1004',
    date: 'Nov 20, 2023 at 2:30 PM',
    total: 699,
    status: 'Out for Delivery',
    eta: 'Today, 4:00 PM',
    paymentMethod: 'UPI',
    address: {
      name: 'Rahul Sharma',
      line1: '123, MG Road, Indiranagar',
      city: 'Bengaluru, Karnataka 560038'
    },
    items: [{ name: 'Premium Tumbler', price: 649, qty: 1, image: '🥤' }],
    summary: {
      subtotal: 649,
      shipping: 50,
      total: 699
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-xl font-medium">Order Details</h3>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Tracking & Items */}
        <div className="flex-1 space-y-6">
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50/50 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-blue-900">{order.status}</CardTitle>
                  <p className="text-sm text-blue-700 mt-1">Arriving {order.eta}</p>
                </div>
                <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
                  Track
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Mock Map Placeholder */}
              <div className="h-48 bg-slate-100 w-full flex items-center justify-center text-muted-foreground relative">
                <MapPin className="h-8 w-8 absolute z-10 text-blue-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-md" />
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")"
                  }}
                ></div>
                <p className="relative z-10 mt-16 text-sm font-medium">Live Map View</p>
              </div>

              {/* Blinkit Style Timeline */}
              <div className="p-6">
                <div className="relative border-l-2 border-blue-500 ml-3 space-y-8">
                  <div className="relative">
                    <CheckCircle2 className="absolute -left-[17px] -top-1 bg-white text-blue-500 h-8 w-8" />
                    <div className="ml-8">
                      <p className="font-medium text-sm">Order Confirmed</p>
                      <p className="text-xs text-muted-foreground">Nov 20, 2:31 PM</p>
                    </div>
                  </div>
                  <div className="relative">
                    <CheckCircle2 className="absolute -left-[17px] -top-1 bg-white text-blue-500 h-8 w-8" />
                    <div className="ml-8">
                      <p className="font-medium text-sm">Shipped</p>
                      <p className="text-xs text-muted-foreground">Nov 21, 9:00 AM • Delhivery</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Truck className="absolute -left-[17px] -top-1 bg-blue-500 text-white p-1.5 rounded-full h-8 w-8 ring-4 ring-white" />
                    <div className="ml-8">
                      <p className="font-medium text-sm text-blue-700">Out for Delivery</p>
                      <p className="text-xs text-blue-600">
                        Nov 22, 10:15 AM • Courier is on the way
                      </p>
                    </div>
                  </div>
                  <div className="relative border-l-2 border-white -ml-[2px] h-full absolute inset-y-0 top-[80%]" />
                  <div className="relative">
                    <Circle className="absolute -left-[17px] -top-1 bg-white text-slate-300 h-8 w-8" />
                    <div className="ml-8">
                      <p className="font-medium text-sm text-slate-400">Delivered</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items in this order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="h-20 w-20 bg-slate-100 rounded-md border flex items-center justify-center text-4xl">
                    {item.image}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                    </div>
                    <p className="font-semibold">₹{item.price}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="bg-slate-50 flex gap-2 p-4">
              <Button variant="outline" className="w-full">
                <RefreshCcw className="w-4 h-4 mr-2" /> Return Item
              </Button>
              <Button className="w-full">Buy Again</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Order Info */}
        <div className="w-full md:w-80 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Order ID</p>
                <p className="font-medium">{order.id}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Order Date</p>
                <p className="font-medium">{order.date}</p>
              </div>
              <Separator />
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.summary.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>₹{order.summary.shipping}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2">
                  <span>Total</span>
                  <span>₹{order.summary.total}</span>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Payment Method</p>
                <p className="font-medium">{order.paymentMethod}</p>
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Receipt className="w-4 h-4 mr-2" /> Download Invoice
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">{order.address.name}</p>
              <p className="text-muted-foreground">{order.address.line1}</p>
              <p className="text-muted-foreground">{order.address.city}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
