'use client';

import { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';
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

const MOCK_ORDERS = [
  {
    id: 'ORD-1001',
    customer: 'Rahul Sharma',
    email: 'rahul@example.com',
    total: 1299,
    status: 'PENDING',
    date: '2023-11-20',
    paymentMethod: 'COD'
  },
  {
    id: 'ORD-1002',
    customer: 'Priya Patel',
    email: 'priya@example.com',
    total: 499,
    status: 'CONFIRMED',
    date: '2023-11-20',
    paymentMethod: 'UPI'
  },
  {
    id: 'ORD-1003',
    customer: 'Amit Singh',
    email: 'amit@example.com',
    total: 3499,
    status: 'SHIPPED',
    date: '2023-11-19',
    paymentMethod: 'Card'
  },
  {
    id: 'ORD-1004',
    customer: 'Neha Gupta',
    email: 'neha@example.com',
    total: 699,
    status: 'DELIVERED',
    date: '2023-11-18',
    paymentMethod: 'UPI'
  },
  {
    id: 'ORD-1005',
    customer: 'Vikram Kumar',
    email: 'vikram@example.com',
    total: 1599,
    status: 'CANCELLED',
    date: '2023-11-18',
    paymentMethod: 'COD'
  }
];

export default function OrdersPage() {
  const [search, setSearch] = useState('');

  const filteredOrders = MOCK_ORDERS.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'default';
      case 'SHIPPED':
        return 'default'; // could be a different shade
      case 'CONFIRMED':
        return 'secondary';
      case 'PENDING':
        return 'outline';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">Manage incoming orders, shipments, and returns.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Order ID or Customer..."
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
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <Link href={`/orders/${order.id}`} className="hover:underline text-primary">
                    {order.id}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{order.customer}</span>
                    <span className="text-xs text-muted-foreground">{order.email}</span>
                  </div>
                </TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(order.status) as any}>{order.status}</Badge>
                </TableCell>
                <TableCell>{order.paymentMethod}</TableCell>
                <TableCell className="text-right font-medium">₹{order.total}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/orders/${order.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Generate Invoice</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Mark as Shipped</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
