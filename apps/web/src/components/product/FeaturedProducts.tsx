'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string; // JSON string from Prisma
  category: string | null;
  stock: number;
  slug: string;
  createdAt: string;
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products?limit=4');
        const data = await res.json();
        if (data.success && data.products) {
          setProducts(data.products.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem 0' }}>
        Loading products...
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem 0' }}>
        No products found.
      </p>
    );
  }

  return (
    <>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </>
  );
}
