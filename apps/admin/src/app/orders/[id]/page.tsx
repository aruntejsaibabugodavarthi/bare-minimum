'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Truck, FileText, User, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Link from 'next/link';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  // Mock data
  const order = {
    id: id || 'ORD-1001',
    date: 'November 20, 2023 at 2:30 PM',
    status: 'PENDING',
    customer: {
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '+91 9876543210'
    },
    shipping: {
      addressLine1: '123, MG Road',
      addressLine2: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      country: 'India'
    },
    payment: {
      method: 'Cash on Delivery',
      status: 'UNPAID'
    },
    items: [
      {
        id: 1,
        name: 'Premium Coffee Tumbler',
        sku: 'TUMB-001',
        price: 1299,
        quantity: 1,
        image: '/assets/images/tumbler.png'
      },
      {
        id: 2,
        name: 'Minimalist Notebook',
        sku: 'NOTE-002',
        price: 499,
        quantity: 2,
        image: '/assets/images/notebook.png'
      }
    ],
    summary: {
      subtotal: 2297,
      discount: 0,
      shipping: 50,
      total: 2347
    }
  };

  return (
    <div className="flex-1 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Order #{order.id}</h2>
          <Badge variant="outline" className="ml-2 text-sm">
            {order.status}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Print Invoice
          </Button>
          <Button>
            <Truck className="mr-2 h-4 w-4" /> Ship Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-slate-100 rounded-md border flex items-center justify-center text-xs">
                        Img
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <div className="text-sm text-right">
                      <p>
                        ₹{item.price} x {item.quantity}
                      </p>
                      <p className="font-medium">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{order.summary.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span>-₹{order.summary.discount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>₹{order.summary.shipping}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>₹{order.summary.total}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border bg-white shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900 text-sm">Order Placed</div>
                      <time className="font-caveat font-medium text-indigo-500 text-xs">
                        Nov 20, 2:30 PM
                      </time>
                    </div>
                    <div className="text-slate-500 text-xs">Order was placed successfully.</div>
                  </div>
                </div>
                {/* Additional timeline steps would go here */}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="mr-2 h-5 w-5" /> Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{order.customer.name}</p>
              <p className="text-muted-foreground text-blue-600 hover:underline cursor-pointer">
                {order.customer.email}
              </p>
              <p className="text-muted-foreground">{order.customer.phone}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="mr-2 h-5 w-5" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p className="text-foreground font-medium">{order.customer.name}</p>
              <p>{order.shipping.addressLine1}</p>
              <p>{order.shipping.addressLine2}</p>
              <p>
                {order.shipping.city}, {order.shipping.state} {order.shipping.pincode}
              </p>
              <p>{order.shipping.country}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="mr-2 h-5 w-5" /> Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{order.payment.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={order.payment.status === 'PAID' ? 'default' : 'destructive'}>
                  {order.payment.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Select defaultValue={order.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Update</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
