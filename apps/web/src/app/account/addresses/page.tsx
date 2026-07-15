'use client';

import { useState } from 'react';
import { MapPin, Plus, Star, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([
    {
      id: '1',
      label: 'Home',
      addressLine1: '123, MG Road',
      addressLine2: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      isDefault: true
    },
    {
      id: '2',
      label: 'Work',
      addressLine1: 'Tech Park, Tower B',
      addressLine2: 'Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066',
      isDefault: false
    }
  ]);

  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-medium">Saved Addresses</h3>
          <p className="text-sm text-muted-foreground">Manage your shipping addresses.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add New
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>Add New Address</CardTitle>
            <CardDescription>We will use your current location to speed this up.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-100 h-32 rounded-md flex items-center justify-center border text-muted-foreground text-sm">
              <MapPin className="w-4 h-4 mr-2" /> Map Provider Placeholder (Google Maps / Mapbox)
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Pincode</Label>
                <div className="flex space-x-2">
                  <Input placeholder="6 digits" maxLength={6} />
                  <Button variant="secondary">Check</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input placeholder="Auto-filled from pincode" />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input placeholder="Auto-filled from pincode" />
              </div>
              <div className="space-y-2">
                <Label>Label (Optional)</Label>
                <Input placeholder="e.g. Home, Office" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address Line 1</Label>
                <Input placeholder="House/Flat No., Building Name" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address Line 2 (Optional)</Label>
                <Input placeholder="Street, Area, Landmark" />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch id="default" />
              <Label htmlFor="default">Set as default address</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button>Save Address</Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <Card key={address.id} className={address.isDefault ? 'border-primary/50' : ''}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base flex items-center">
                  {address.label || 'Address'}
                  {address.isDefault && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      Default
                    </Badge>
                  )}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  {!address.isDefault && (
                    <DropdownMenuItem>
                      <Star className="w-4 h-4 mr-2" /> Set as Default
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>
                  {address.city}, {address.state} {address.pincode}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
