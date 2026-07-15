'use client';

import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Premium Coffee Tumbler',
    sku: 'TUMB-001',
    price: 1299,
    stock: 45,
    status: 'PUBLISHED',
    category: 'Drinkware'
  },
  {
    id: '2',
    name: 'Minimalist Notebook',
    sku: 'NOTE-002',
    price: 499,
    stock: 12,
    status: 'PUBLISHED',
    category: 'Stationery'
  },
  {
    id: '3',
    name: 'Leather Tote Bag',
    sku: 'BAG-003',
    price: 3499,
    stock: 0,
    status: 'OUT_OF_STOCK',
    category: 'Accessories'
  },
  {
    id: '4',
    name: 'Ceramic Mug',
    sku: 'MUG-004',
    price: 699,
    stock: 120,
    status: 'DRAFT',
    category: 'Drinkware'
  }
];

export default function ProductsPage() {
  const [search, setSearch] = useState('');

  const filteredProducts = MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your product catalog, pricing, and stock.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center space-x-2 py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products or SKUs..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.status === 'PUBLISHED'
                        ? 'default'
                        : product.status === 'OUT_OF_STOCK'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {product.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">₹{product.price}</TableCell>
                <TableCell className="text-right">
                  <span className={product.stock < 15 ? 'text-destructive font-medium' : ''}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit Product</DropdownMenuItem>
                      <DropdownMenuItem>View Variants</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
