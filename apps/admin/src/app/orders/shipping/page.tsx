'use client';

import { useState } from 'react';
import { Printer, Download, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const MOCK_CONFIRMED_ORDERS = [
  {
    id: 'ORD-1002',
    customer: 'Priya Patel',
    destination: 'Mumbai, MH',
    items: 2,
    weight: '1.2 kg',
    courier: 'Delhivery'
  },
  {
    id: 'ORD-1006',
    customer: 'Arjun Reddy',
    destination: 'Hyderabad, TS',
    items: 1,
    weight: '0.5 kg',
    courier: 'BlueDart'
  },
  {
    id: 'ORD-1007',
    customer: 'Simran Kaur',
    destination: 'Chandigarh, PB',
    items: 4,
    weight: '3.1 kg',
    courier: 'XpressBees'
  },
  {
    id: 'ORD-1008',
    customer: 'Rohan Das',
    destination: 'Kolkata, WB',
    items: 1,
    weight: '0.2 kg',
    courier: 'Ecom Express'
  }
];

export default function BulkShippingPage() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const toggleAll = () => {
    if (selectedOrders.length === MOCK_CONFIRMED_ORDERS.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(MOCK_CONFIRMED_ORDERS.map((o) => o.id));
    }
  };

  const toggleOrder = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((oId) => oId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const handleGenerateLabels = () => {
    if (selectedOrders.length === 0) return;
    alert(`Generating labels for ${selectedOrders.length} orders...`);
    // Mock generation action
  };

  return (
    <div className="flex-1 space-y-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shipping Labels</h2>
          <p className="text-muted-foreground">
            Select confirmed orders to generate shipping labels in bulk.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" disabled={selectedOrders.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Download Manifest
          </Button>
          <Button onClick={handleGenerateLabels} disabled={selectedOrders.length === 0}>
            <Printer className="mr-2 h-4 w-4" /> Generate Labels ({selectedOrders.length})
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Ready to Ship</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">Pending fulfillment</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-white mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedOrders.length === MOCK_CONFIRMED_ORDERS.length &&
                    MOCK_CONFIRMED_ORDERS.length > 0
                  }
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Courier</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Weight</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_CONFIRMED_ORDERS.map((order) => (
              <TableRow
                key={order.id}
                className={selectedOrders.includes(order.id) ? 'bg-muted/50' : ''}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onCheckedChange={() => toggleOrder(order.id)}
                    aria-label={`Select order ${order.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.destination}</TableCell>
                <TableCell>
                  <Badge variant="outline">{order.courier}</Badge>
                </TableCell>
                <TableCell className="text-right">{order.items}</TableCell>
                <TableCell className="text-right text-muted-foreground">{order.weight}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
