'use client';

import { useState } from 'react';
import { Trash2, ShoppingCart, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function WishlistPage() {
  const [items, setItems] = useState([
    {
      id: 'W-1',
      productId: 'P-101',
      name: 'Smart Watch Series 9',
      price: 24999,
      originalPrice: 29999,
      inStock: true,
      image: '⌚',
      priceDrop: true
    },
    {
      id: 'W-2',
      productId: 'P-102',
      name: 'Wireless Noise Cancelling Earbuds',
      price: 12499,
      originalPrice: 12499,
      inStock: false,
      image: '🎧',
      priceDrop: false
    },
    {
      id: 'W-3',
      productId: 'P-103',
      name: 'Leather Minimalist Wallet',
      price: 999,
      originalPrice: 1499,
      inStock: true,
      image: '👝',
      priceDrop: true
    }
  ]);

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-medium">My Wishlist</h3>
          <p className="text-sm text-muted-foreground">{items.length} items saved for later.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-slate-50">
          <p className="text-lg font-medium text-slate-600">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground mt-1">
            Save items you like to buy them later.
          </p>
          <Button className="mt-4">Continue Shopping</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden flex flex-col group relative">
              {item.priceDrop && (
                <div className="absolute top-2 left-2 z-10 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center shadow-sm border border-green-200">
                  <TrendingDown className="w-3 h-3 mr-1" /> Price Drop
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-red-50 hover:text-red-600"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="h-48 bg-slate-100 flex items-center justify-center text-7xl relative">
                {item.image}
                {!item.inStock && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <Badge variant="destructive" className="text-sm">
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4 flex flex-col flex-1">
                <p className="font-medium line-clamp-2 min-h-[40px]">{item.name}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-lg font-bold">₹{item.price.toLocaleString()}</span>
                  {item.originalPrice > item.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="mt-auto pt-4">
                  <Button className="w-full" disabled={!item.inStock}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {item.inStock ? 'Move to Cart' : 'Notify Me'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
