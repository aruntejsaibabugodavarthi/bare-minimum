import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string; // JSON string e.g. '["assets/images/tumbler.png"]'
  category: string | null;
  stock: number;
  slug: string;
  createdAt: string;
}

function getFirstImage(images: string): string {
  try {
    const parsed = JSON.parse(images);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) {
      // Images are stored as relative paths like "assets/images/tumbler.png"
      // Serve them through the old-web proxy or local public dir
      const img = parsed[0];
      if (img.startsWith('/')) return img;
      return '/' + img;
    }
  } catch {
    // ignore parse errors
  }
  return '/assets/images/placeholder.png';
}

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = getFirstImage(product.images);

  return (
    <Link href={`/shop/${product.slug || product.id}`} className="product-card reveal visible">
      <div className="product-card-image" style={{ position: 'relative', aspectRatio: '4/5' }}>
        <Image src={imageUrl} alt={product.name} fill style={{ objectFit: 'cover' }} />
        <div className="product-card-overlay">
          <span className="btn btn-sm btn-outline-light">View Details</span>
        </div>
      </div>
      <div className="product-card-body">
        <div className="product-card-category">{product.category || 'Essentials'}</div>
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-price">₹{product.price}</div>
      </div>
    </Link>
  );
}
