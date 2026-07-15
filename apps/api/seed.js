const prisma = require('./src/utils/prisma');

const PRODUCTS = [
  {
    id: 'signature-tumbler',
    name: 'Signature Tumbler',
    category: 'Drinkware',
    price: 3040,
    mrp: 3800,
    countryOfOrigin: 'India',
    gstSlab: 18,
    netQuantity: '1 Unit',
    manufacturerDetails:
      'Bare Minimum Mfg, 123 Industrial Area, Phase 1, Bangalore, Karnataka 560001',
    image: 'assets/images/tumbler.png',
    images: ['assets/images/tumbler.png', 'assets/images/mug.png'],
    description:
      'Double-walled insulated tumbler with our signature copper band. Keeps drinks cold for 24 hours or hot for 12. Matte charcoal finish with ergonomic handle.',
    details:
      '18/8 stainless steel, BPA-free lid, 24oz capacity. Hand wash recommended. Copper band is electroplated for lasting finish.',
    variants: [
      { id: 'v1', size: '24oz', color: 'Charcoal', stock: 15 },
      { id: 'v2', size: '24oz', color: 'Cream', stock: 5 }
    ],
    isNew: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 124,
    reviews: [
      {
        author: 'Sarah M.',
        rating: 5,
        date: '2025-10-12',
        text: 'Keeps my coffee hot all day. The matte finish feels incredibly premium.'
      },
      {
        author: 'James T.',
        rating: 4,
        date: '2025-09-28',
        text: 'Great tumbler, but I wish it was dishwasher safe.'
      }
    ]
  },
  {
    id: 'canvas-tote',
    name: 'Canvas Tote',
    category: 'Bags',
    price: 4400,
    mrp: 5000,
    countryOfOrigin: 'India',
    gstSlab: 12,
    netQuantity: '1 Unit',
    manufacturerDetails: 'Bare Minimum Textiles, 45 Textile Hub, Tiruppur, Tamil Nadu 641603',
    image: 'assets/images/tote.png',
    images: ['assets/images/tote.png', 'assets/images/notebook.png'],
    description:
      'Heavyweight organic cotton canvas tote with our minimalist brand mark. Reinforced stitching, internal pocket, and generous proportions for everyday carry.',
    details:
      '16oz organic cotton canvas. Dimensions: 15" W x 16" H x 5" D. Reinforced cotton handles with 10" drop. Machine washable.',
    variants: [
      { id: 'v3', size: 'One Size', color: 'Natural', stock: 22 },
      { id: 'v4', size: 'One Size', color: 'Charcoal', stock: 0 }
    ],
    isNew: false,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 89,
    reviews: [
      {
        author: 'Elena K.',
        rating: 5,
        date: '2025-11-03',
        text: 'My new daily driver. Fits my laptop, gym clothes, and groceries effortlessly.'
      }
    ]
  },
  {
    id: 'linen-notebook',
    name: 'Linen Notebook',
    category: 'Stationery',
    price: 2560,
    mrp: 3000,
    countryOfOrigin: 'India',
    gstSlab: 12,
    netQuantity: '1 Unit',
    manufacturerDetails: 'Bare Minimum Paper Co., 12 Print Street, Okhla, New Delhi 110020',
    image: 'assets/images/notebook.png',
    images: ['assets/images/notebook.png'],
    description:
      'Hardbound linen journal with copper foil accent. 192 pages of premium 100gsm paper, lay-flat binding, and ribbon bookmark.',
    details:
      'Belgian linen cover, acid-free paper, dotted grid. Dimensions: 5.5" x 8.25". Thread-sewn binding with lay-flat spine.',
    variants: [
      { id: 'v5', size: '5.5" x 8.25"', color: 'Charcoal', stock: 12 },
      { id: 'v6', size: '5.5" x 8.25"', color: 'Stone', stock: 8 }
    ],
    isNew: false,
    isFeatured: true,
    rating: 4.7,
    reviewCount: 42,
    reviews: [
      {
        author: 'Marcus L.',
        rating: 5,
        date: '2025-08-15',
        text: 'The paper quality is unmatched. No bleeding with my fountain pens.'
      }
    ]
  },
  {
    id: 'minimalist-hoodie',
    name: 'Minimalist Hoodie',
    category: 'Apparel',
    price: 6800,
    mrp: 8000,
    countryOfOrigin: 'India',
    gstSlab: 5,
    netQuantity: '1 Unit',
    manufacturerDetails: 'Bare Minimum Textiles, 45 Textile Hub, Tiruppur, Tamil Nadu 641603',
    image: 'assets/images/hoodie.png',
    images: ['assets/images/hoodie.png'],
    description:
      'Ultra-soft organic cotton hoodie with a relaxed fit. Pre-shrunk and dyed with eco-friendly pigments.',
    details: '100% organic cotton. Relaxed fit. Machine wash cold, tumble dry low.',
    variants: [
      { id: 'v7', size: 'S', color: 'Black', stock: 4 },
      { id: 'v8', size: 'M', color: 'Black', stock: 10 },
      { id: 'v9', size: 'L', color: 'Black', stock: 2 },
      { id: 'v10', size: 'S', color: 'Grey', stock: 0 },
      { id: 'v11', size: 'M', color: 'Grey', stock: 5 },
      { id: 'v12', size: 'L', color: 'Grey', stock: 5 }
    ],
    isNew: true,
    isFeatured: true,
    rating: 4.5,
    reviewCount: 215,
    reviews: [
      {
        author: 'David W.',
        rating: 4,
        date: '2025-11-20',
        text: 'Super comfortable but fits slightly large.'
      },
      {
        author: 'Chloe S.',
        rating: 5,
        date: '2025-10-05',
        text: 'Literally live in this hoodie now. The organic cotton is so soft.'
      }
    ]
  },
  {
    id: 'daily-set',
    name: 'The Daily Set',
    category: 'Bundles',
    price: 9200,
    mrp: 12000,
    countryOfOrigin: 'India',
    gstSlab: 18,
    netQuantity: '1 Set (3 Items)',
    manufacturerDetails:
      'Bare Minimum Mfg, 123 Industrial Area, Phase 1, Bangalore, Karnataka 560001',
    image: 'assets/images/gift-set.png',
    images: ['assets/images/gift-set.png'],
    description:
      'Our curated essentials bundle — the perfect gift or personal starter set. Includes Signature Tumbler, Soy Candle, and Linen Notebook in a premium gift box.',
    details:
      'Includes: 1x Signature Tumbler, 1x Soy Candle (Sandalwood & Amber), 1x Linen Notebook. Presented in our signature cream gift box with tissue paper.',
    variants: [{ id: 'v13', size: 'One Size', color: 'Standard', stock: 30 }],
    isNew: true,
    isFeatured: false,
    rating: 5.0,
    reviewCount: 56,
    reviews: [
      {
        author: 'Jessica R.',
        rating: 5,
        date: '2025-12-10',
        text: 'Bought this as a gift for my sister and she was blown away by the packaging.'
      }
    ]
  },
  {
    id: 'cork-coasters',
    name: 'Cork Coaster Set',
    category: 'Home',
    price: 2240,
    mrp: 2800,
    countryOfOrigin: 'India',
    gstSlab: 18,
    netQuantity: '4 Units',
    manufacturerDetails:
      'Bare Minimum Mfg, 123 Industrial Area, Phase 1, Bangalore, Karnataka 560001',
    image: 'assets/images/coasters.png',
    images: ['assets/images/coasters.png'],
    description:
      'Set of 4 natural cork coasters. Sustainably sourced Portuguese cork with a smooth, sealed surface that protects your surfaces with understated elegance.',
    details:
      'Natural Portuguese cork. Set of 4. Diameter: 4". Thickness: 5mm. Sealed surface for easy cleaning. Wipe clean with damp cloth.',
    variants: [{ id: 'v14', size: 'One Size', color: 'Natural', stock: 50 }],
    isNew: false,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 34,
    reviews: [
      {
        author: 'Tom B.',
        rating: 5,
        date: '2025-07-22',
        text: 'Simple, minimal, and does exactly what they need to do without looking cheap.'
      }
    ]
  },
  {
    id: 'ceramic-mug',
    name: 'Ceramic Mug',
    category: 'Drinkware',
    price: 2560,
    mrp: 3200,
    countryOfOrigin: 'India',
    gstSlab: 18,
    netQuantity: '1 Unit',
    manufacturerDetails:
      'Bare Minimum Mfg, 123 Industrial Area, Phase 1, Bangalore, Karnataka 560001',
    image: 'assets/images/mug.png',
    images: ['assets/images/mug.png'],
    description:
      'Hand-finished matte ceramic mug with a comfortable weighted base. The perfect vessel for your morning ritual, crafted by local artisans.',
    details:
      'Stoneware ceramic, food-safe matte glaze. 12oz capacity. Microwave and dishwasher safe. Each piece has slight variations due to handmade nature.',
    variants: [
      { id: 'v15', size: '12oz', color: 'Cream', stock: 8 },
      { id: 'v16', size: '12oz', color: 'Stone', stock: 2 }
    ],
    isNew: false,
    isFeatured: false,
    rating: 4.9,
    reviewCount: 112,
    reviews: [
      {
        author: 'Amanda K.',
        rating: 5,
        date: '2025-09-12',
        text: 'Has a beautiful weight to it. The matte finish is stunning.'
      }
    ]
  },
  {
    id: 'santal-oak-soy-candle',
    name: 'Santal & Oak Soy Candle',
    category: 'Home',
    price: 3360,
    mrp: 4000,
    countryOfOrigin: 'India',
    gstSlab: 18,
    netQuantity: '1 Unit',
    manufacturerDetails:
      'Bare Minimum Mfg, 123 Industrial Area, Phase 1, Bangalore, Karnataka 560001',
    image: 'assets/images/candle.png',
    images: ['assets/images/candle.png'],
    description:
      'Hand-poured vegan soy candle with notes of Australian sandalwood, aged oak, and a hint of smoked amber.',
    details:
      '100% vegan soy wax, lead-free cotton wick. 60-hour burn time. Hand-poured in Los Angeles. Frosted glass vessel can be repurposed.',
    variants: [
      { id: 'v17', size: '8oz', color: 'Natural', stock: 12 },
      { id: 'v18', size: '12oz', color: 'Natural', stock: 0 }
    ],
    isNew: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 78,
    reviews: [
      {
        author: 'Ryan P.',
        rating: 5,
        date: '2025-11-01',
        text: 'The scent throw on this is incredible. Fills my entire apartment without being overpowering.'
      }
    ]
  }
];

async function seed() {
  for (const p of PRODUCTS) {
    const { id, name, category, price, gstSlab, image, images, description, ...metadata } = p;
    // Calculate total stock
    let totalStock = 0;
    if (metadata.variants) {
      totalStock = metadata.variants.reduce((acc, v) => acc + v.stock, 0);
    }

    // Add image back to metadata to simplify things
    metadata.image = image;

    await prisma.product.upsert({
      where: { slug: id },
      update: {
        name,
        category,
        price,
        gstSlab,
        description,
        stock: totalStock,
        images: JSON.stringify(images),
        metadata: JSON.stringify(metadata)
      },
      create: {
        slug: id,
        name,
        category,
        price,
        gstSlab,
        description,
        stock: totalStock,
        images: JSON.stringify(images),
        metadata: JSON.stringify(metadata)
      }
    });
  }
  console.log('Seeded products');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
