'use client';

import { MessageSquare, PhoneCall, HelpCircle, Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function SupportPage() {
  const recentOrders = [
    { id: 'ORD-1004', name: 'Premium Tumbler', status: 'Out for Delivery' },
    { id: 'ORD-1002', name: 'Daily Roast Coffee', status: 'Delivered' }
  ];

  const faqs = [
    'Where is my order?',
    'How do I return an item?',
    'What is your refund policy?',
    'How do I cancel my order?'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-medium">Help & Support</h3>
        <p className="text-sm text-muted-foreground">
          Find answers, contact us, or get help with an order.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search FAQs, articles, or topics..." className="pl-8" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Package className="w-5 h-5 mr-2" /> Help with an Order
            </CardTitle>
            <CardDescription>Select an order to get context-specific help.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentOrders.map((order) => (
              <Button
                key={order.id}
                variant="outline"
                className="w-full justify-start h-auto py-3 px-4"
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{order.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {order.id} • {order.status}
                  </span>
                </div>
              </Button>
            ))}
            <Button variant="link" className="px-0 h-auto">
              View all orders
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" /> Contact Us
            </CardTitle>
            <CardDescription>We're here to help you 24/7.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start h-12">
              <MessageSquare className="w-4 h-4 mr-3" /> Start a Live Chat
            </Button>
            <Button variant="secondary" className="w-full justify-start h-12">
              <PhoneCall className="w-4 h-4 mr-3" /> Request a Callback
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <HelpCircle className="w-5 h-5 mr-2" /> Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {faqs.map((faq, idx) => (
            <Button key={idx} variant="outline" className="justify-start h-12">
              {faq}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
