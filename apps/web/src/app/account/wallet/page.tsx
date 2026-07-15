'use client';

import { useState } from 'react';
import { Wallet, CreditCard, Plus, Trash2, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WalletPage() {
  const [balance] = useState(1250);
  const [transactions] = useState([
    {
      id: 'TXN-1',
      type: 'Refund',
      amount: 1250,
      date: 'Nov 22, 2023',
      orderId: 'ORD-1002',
      status: 'Success',
      isCredit: true
    },
    {
      id: 'TXN-2',
      type: 'Order Payment',
      amount: 499,
      date: 'Nov 15, 2023',
      orderId: 'ORD-1004',
      status: 'Success',
      isCredit: false
    },
    {
      id: 'TXN-3',
      type: 'Cashback',
      amount: 50,
      date: 'Nov 01, 2023',
      orderId: 'ORD-0988',
      status: 'Success',
      isCredit: true
    }
  ]);

  const [paymentMethods] = useState([
    { id: 'PM-1', type: 'Card', network: 'Visa', last4: '4242', isDefault: true, expiry: '12/25' },
    { id: 'PM-2', type: 'UPI', idString: 'rahul@okicici', isDefault: false }
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-medium">Payments & Wallet</h3>
        <p className="text-sm text-muted-foreground">
          Manage your saved payment methods and wallet balance.
        </p>
      </div>

      <Tabs defaultValue="wallet" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="wallet">Wallet Balance</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="wallet" className="space-y-6 pt-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardDescription>Available Store Credit</CardDescription>
              <CardTitle className="text-4xl">₹{balance.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Can be used for instant checkout on all eligible products.
              </p>
            </CardContent>
            <CardFooter>
              <Button>Add Money to Wallet</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent wallet activity and refunds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-full ${txn.isCredit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {txn.isCredit ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{txn.type}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {txn.date} • {txn.orderId}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${txn.isCredit ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {txn.isCredit ? '+' : '-'}₹{txn.amount}
                    </p>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {txn.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {transactions.length > 0 && <Separator className="my-4" />}
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No transactions found.</p>
              ) : (
                <Button variant="ghost" className="w-full text-blue-600">
                  View All Transactions
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-6 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Saved Cards & UPI</CardTitle>
                <CardDescription>
                  Fast, secure checkout without entering details every time.
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" /> Add New
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-slate-50/50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-12 bg-white border rounded flex items-center justify-center">
                      {method.type === 'Card' ? (
                        <CreditCard className="w-6 h-6 text-slate-700" />
                      ) : (
                        <span className="font-bold text-sm text-slate-700">UPI</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium flex items-center">
                        {method.type === 'Card'
                          ? `${method.network} ending in ${method.last4}`
                          : method.idString}
                        {method.isDefault && (
                          <Badge variant="secondary" className="ml-2 text-[10px]">
                            Default
                          </Badge>
                        )}
                      </p>
                      {method.type === 'Card' && (
                        <p className="text-xs text-muted-foreground">Expires {method.expiry}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800 flex items-start">
                <div className="shrink-0 mr-3 mt-0.5 text-blue-600">🛡️</div>
                <p>
                  We use industry-standard tokenization. Your full card number is never stored on
                  our servers.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
