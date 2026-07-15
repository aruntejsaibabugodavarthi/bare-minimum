'use client';

import { useState } from 'react';
import { Star, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ReviewsPage() {
  const [reviews] = useState([
    {
      id: 'REV-1',
      productName: 'Premium Tumbler',
      rating: 5,
      date: 'Nov 22, 2023',
      comment:
        'Absolutely love this tumbler. Keeps my coffee hot for hours and the build quality is top notch.',
      image: '🥤'
    },
    {
      id: 'REV-2',
      productName: 'Daily Roast Coffee - 250g',
      rating: 4,
      date: 'Nov 16, 2023',
      comment:
        'Good flavor, but slightly more acidic than I expected. Still a solid daily drinker.',
      image: '☕'
    }
  ]);

  const [pendingReviews] = useState([
    {
      id: 'PEND-1',
      productName: 'Almond Butter',
      deliveredOn: 'Nov 15, 2023',
      image: '🥜'
    }
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-medium">My Reviews</h3>
        <p className="text-sm text-muted-foreground">Manage your product reviews and ratings.</p>
      </div>

      <Tabs defaultValue="published" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="published">Published ({reviews.length})</TabsTrigger>
          <TabsTrigger value="pending">To Review ({pendingReviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="space-y-4 pt-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-slate-50">
              <p className="text-lg font-medium text-slate-600">No reviews yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Check the 'To Review' tab to rate your past purchases.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 bg-slate-100 rounded border flex items-center justify-center text-2xl">
                      {review.image}
                    </div>
                    <div>
                      <CardTitle className="text-base">{review.productName}</CardTitle>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 -mr-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit2 className="w-4 h-4 mr-2" /> Edit Review
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">{review.comment}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 pt-4">
          {pendingReviews.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-slate-50">
              <p className="text-lg font-medium text-slate-600">You're all caught up!</p>
              <p className="text-sm text-muted-foreground mt-1">
                You have reviewed all your past purchases.
              </p>
            </div>
          ) : (
            pendingReviews.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex gap-4 items-center w-full sm:w-auto">
                    <div className="h-16 w-16 bg-slate-100 rounded border flex items-center justify-center text-3xl">
                      {item.image}
                    </div>
                    <div>
                      <p className="font-medium text-base">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        Delivered on {item.deliveredOn}
                      </p>
                    </div>
                  </div>
                  <Button className="w-full sm:w-auto">Write a Review</Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
