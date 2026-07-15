'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [variants, setVariants] = useState([
    { id: 1, sku: '', size: '', color: '', price: '', stock: '' }
  ]);

  const addVariant = () => {
    setVariants([
      ...variants,
      { id: Date.now(), sku: '', size: '', color: '', price: '', stock: '' }
    ]);
  };

  const removeVariant = (id: number) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save
    alert('Product saved!');
    router.push('/products');
  };

  return (
    <div className="flex-1 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Add Product</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Discard</Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save Product
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6 md:col-span-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the primary details for this product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" placeholder="e.g., Premium Leather Tote" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" placeholder="e.g., L-TOTE-BLK" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" placeholder="e.g., Bare Minimum" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea id="description" placeholder="A brief summary..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long-description">Detailed Description</Label>
                <Textarea
                  id="long-description"
                  className="min-h-[120px]"
                  placeholder="Full HTML or markdown description..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & GST */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Tax</CardTitle>
              <CardDescription>Configure base pricing and GST slabs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Base Price (₹) *</Label>
                  <Input id="price" type="number" placeholder="0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gst">GST Slab *</Label>
                  <Select defaultValue="18">
                    <SelectTrigger>
                      <SelectValue placeholder="Select GST" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="18">18%</SelectItem>
                      <SelectItem value="28">28%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hsn">HSN/SAC Code</Label>
                  <Input id="hsn" placeholder="e.g., 4202" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Variants</CardTitle>
                <CardDescription>Add sizes, colors, or other options.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                <Plus className="mr-2 h-4 w-4" /> Add Option
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="grid grid-cols-6 gap-2 items-end border p-4 rounded-md"
                >
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">SKU</Label>
                    <Input placeholder="Variant SKU" />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <Label className="text-xs">Size</Label>
                    <Input placeholder="Size" />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <Label className="text-xs">Color</Label>
                    <Input placeholder="Color" />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <Label className="text-xs">Price(₹)</Label>
                    <Input type="number" placeholder="Price" />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <Label className="text-xs">Stock</Label>
                    <div className="flex items-center space-x-2">
                      <Input type="number" placeholder="Qty" />
                      {variants.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive shrink-0"
                          onClick={() => removeVariant(variant.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status & Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue="DRAFT">
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="drinkware">Drinkware</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="cod" defaultChecked />
                <Label htmlFor="cod" className="font-normal cursor-pointer">
                  Eligible for COD
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory & Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Base Stock (if no variants)</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Low Stock Threshold</Label>
                <Input type="number" placeholder="5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-2 hover:bg-muted/50 cursor-pointer">
                <Plus className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm font-medium">Click to upload</div>
                <div className="text-xs text-muted-foreground">PNG, JPG up to 5MB</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
