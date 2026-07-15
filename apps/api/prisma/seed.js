const prisma = require('../src/utils/prisma');

const PRODUCTS = [
  {
    slug: 'signature-tumbler',
    name: 'Signature Insulated Tumbler',
    description: 'Keep your drinks cold for 24 hours or hot for 12. Matte finish.',
    price: 3040,
    gstSlab: 18,
    stock: 150,
    images: JSON.stringify(['/assets/images/tumbler.png'])
  },
  {
    slug: 'canvas-tote',
    name: 'Heavyweight Canvas Tote',
    description: 'Durable everyday carry. Reinforced stitching and inner pocket.',
    price: 4400,
    gstSlab: 12,
    stock: 200,
    images: JSON.stringify(['/assets/images/tote.png'])
  },
  {
    slug: 'linen-notebook',
    name: 'Linen Bound Notebook',
    description: '160 pages of 120gsm dot-grid paper. Lies perfectly flat.',
    price: 2560,
    gstSlab: 12,
    stock: 300,
    images: JSON.stringify(['/assets/images/notebook.png'])
  },
  {
    slug: 'minimalist-hoodie',
    name: 'Minimalist Hoodie',
    description: 'Premium organic cotton. Relaxed fit.',
    price: 6800,
    gstSlab: 5,
    stock: 50,
    images: JSON.stringify(['/assets/images/hoodie.png'])
  },
  {
    slug: 'daily-set',
    name: 'The Daily Set',
    description: 'Our core collection: Tumbler, Notebook, and Tote.',
    price: 9200,
    gstSlab: 18,
    stock: 40,
    images: JSON.stringify(['/assets/images/set.png'])
  },
  {
    slug: 'cork-coasters',
    name: 'Natural Cork Coasters (Set of 4)',
    description: 'Sustainable and stylish table protection.',
    price: 2240,
    gstSlab: 18,
    stock: 100,
    images: JSON.stringify(['/assets/images/coasters.png'])
  },
  {
    slug: 'ceramic-mug',
    name: 'Handcrafted Ceramic Mug',
    description: 'Unique glaze. Dishwasher safe.',
    price: 2560,
    gstSlab: 18,
    stock: 80,
    images: JSON.stringify(['/assets/images/mug.png'])
  },
  {
    slug: 'santal-oak-soy-candle',
    name: 'Santal & Oak Soy Candle',
    description: '40 hour burn time. Hand-poured.',
    price: 3360,
    gstSlab: 18,
    stock: 120,
    images: JSON.stringify(['/assets/images/candle.png'])
  }
];

async function main() {
  console.log('Start seeding...');
  for (const p of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p
    });
    console.log(`Created product with id: ${product.id} (${product.name})`);
  }
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
