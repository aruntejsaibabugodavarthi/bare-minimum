require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const nodemailer = require('nodemailer');
const multer = require('multer');

// Configure Multer for product image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/images/products'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// --- PRODUCTION LOGGING ---
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const app = express();
const PORT = process.env.PORT || 8081;

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// --- SECURITY: HTTP Headers ---
app.use(helmet({
  contentSecurityPolicy: false, // Disabling CSP for now to allow Razorpay checkout script
}));

// --- SECURITY: Rate Limiting ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login/OTP requests per hour
  message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});

app.use('/api/', apiLimiter);

// --- SECURITY: Lock down CORS to known origins ---
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [`http://localhost:${PORT}`];
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

async function verifyAdmin(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user && user.role === 'admin') {
      req.user.role = 'admin';
      next();
    } else {
      res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }
  } catch (error) {
    logger.error('Error in verifyAdmin middleware:', error);
    res.status(500).json({ success: false, message: 'Server error checking admin role' });
  }
}

// Admin Auth Middleware
async function authorizeAdmin(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// --- SECURITY: Serve static files from 'public/' only (not project root) ---
// This prevents .env, server.js, prisma/dev.db from being downloadable
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- EMAIL SERVICE (Ethereal Mock) ---
let emailTransporter;
nodemailer.createTestAccount().then(account => {
  emailTransporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: { user: account.user, pass: account.pass }
  });
  logger.info('Ethereal Email transporter created for development.');
}).catch(err => {
  logger.error('Failed to create Ethereal Email test account (network issue). Emails will not be sent.', err.message);
});

async function sendOrderConfirmationEmail(userEmail, orderDetails) {
  if (!emailTransporter || !userEmail) return;
  try {
    const info = await emailTransporter.sendMail({
      from: '"Bare Minimum" <noreply@bareminimum.shop>',
      to: userEmail,
      subject: `Order Confirmation - ${orderDetails.id}`,
      text: `Thank you for your order! Your total was Rs. ${orderDetails.totalAmount / 100}.`
    });
    logger.info(`Preview Confirmation Email: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    logger.error('Failed to send confirmation email', error);
  }
}

// ---------------------------------------------
// LOGISTICS MODULE
// ---------------------------------------------

class CourierAdapter {
  constructor() {
    this.supportsCod = true; // Default capability
  }
  async checkServiceability(pincode) { throw new Error("Not implemented"); }
  async createShipment(orderDetails) { throw new Error("Not implemented"); }
}

class DelhiveryAdapter extends CourierAdapter {
  constructor() {
    super();
    this.supportsCod = true;
  }
  async checkServiceability(pincode) {
    // Mocking the external courier API check
    if (pincode === '793001') return { serviceable: false };
    return { serviceable: true, estimated_days_min: 3 };
  }
  async createShipment(orderDetails) {
    return { awbNumber: `DEL_${Date.now()}`, courierCode: "delhivery" };
  }
}

class ShiprocketAdapter extends CourierAdapter {
  constructor() {
    super();
    this.supportsCod = true;
  }
  async checkServiceability(pincode) {
    // Mocking the external courier API check
    if (pincode === '793001') return { serviceable: true, estimated_days_min: 6 }; // Shiprocket serves it but slower
    return { serviceable: true, estimated_days_min: 4 };
  }
  async createShipment(orderDetails) {
    return { awbNumber: `SR_${Date.now()}`, courierCode: "shiprocket" };
  }
}

class BluedartAdapter extends CourierAdapter {
  constructor() {
    super();
    this.supportsCod = false; // ISP: Bluedart doesn't support COD in our config
  }
  async checkServiceability(pincode) {
    // Mocking the external courier API check (Bluedart only serves metro/Tier 1)
    const tier1Pincodes = ['400001', '110001'];
    if (!tier1Pincodes.includes(pincode)) return { serviceable: false };
    return { serviceable: true, estimated_days_min: 1 };
  }
  async createShipment(orderDetails) {
    return { awbNumber: `BD_${Date.now()}`, courierCode: "bluedart" };
  }
}

class LogisticsEngine {
  constructor() {
    this.registry = new Map();
  }

  // OCP: Open for extension (register new couriers), closed for modification
  registerCourier(courierCode, adapterInstance) {
    if (!(adapterInstance instanceof CourierAdapter)) {
      throw new Error("Adapter must extend CourierAdapter");
    }
    this.registry.set(courierCode, adapterInstance);
  }

  _getPriorityOrder(orderValue, isCod) {
    // High-value prepaid orders prioritize Bluedart
    if (orderValue > 5000 && !isCod && this.registry.has("bluedart")) {
      return ["bluedart", "delhivery", "shiprocket"];
    }
    return ["delhivery", "shiprocket", "bluedart"];
  }

  async checkPincodeServiceability(pincode, isCod, orderValue) {
    const priorityOrder = this._getPriorityOrder(orderValue, isCod);
    
    for (const courierCode of priorityOrder) {
      const adapter = this.registry.get(courierCode);
      if (!adapter) continue;

      // ISP: Check capabilities before calling API
      if (isCod && !adapter.supportsCod) {
        continue;
      }

      const result = await adapter.checkServiceability(pincode);
      
      if (result.serviceable) {
        return { courierCode, ...result };
      }
    }
    
    return { serviceable: false, courierCode: null };
  }
}

// Instantiate and configure the high-level engine (DIP)
const logisticsEngine = new LogisticsEngine();
logisticsEngine.registerCourier("delhivery", new DelhiveryAdapter());
logisticsEngine.registerCourier("shiprocket", new ShiprocketAdapter());
logisticsEngine.registerCourier("bluedart", new BluedartAdapter());

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function estimateDeliveryDate({ pincodeTier, courierCode, isCod }) {
  const baseEstimates = {
    1: { min: 1, max: 3 },
    2: { min: 3, max: 6 },
    3: { min: 5, max: 10 },
  };
  const estimate = baseEstimates[pincodeTier] || baseEstimates[3];
  const codBuffer = isCod ? 1 : 0;
  const today = new Date();
  return {
    minDate: addDays(today, estimate.min + codBuffer),
    maxDate: addDays(today, estimate.max + codBuffer),
  };
}

// Endpoint to check pincode serviceability
app.get('/api/logistics/pincode/:pincode', async (req, res) => {
  try {
    const pincode = req.params.pincode;
    const pInfo = await prisma.pincode.findUnique({ where: { pincode } });
    
    if (!pInfo) {
      return res.json({ success: false, message: 'Pincode not found or invalid.' });
    }

    const serviceability = await logisticsEngine.checkPincodeServiceability(pincode, false, 0);
    const deliveryEstimate = estimateDeliveryDate({ pincodeTier: pInfo.tier, courierCode: serviceability.courierCode, isCod: false });

    res.json({
      success: true,
      city: pInfo.city,
      state: pInfo.state,
      tier: pInfo.tier,
      serviceable: serviceability.serviceable,
      estimatedMin: deliveryEstimate.minDate.toISOString(),
      estimatedMax: deliveryEstimate.maxDate.toISOString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// ---------------------------------------------

// ==========================================
// CATALOG & INVENTORY ENDPOINTS
// ==========================================

app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: { id: true, slug: true, name: true, price: true, description: true, category: true, images: true, inventoryCount: true, metadata: true }
    });
    res.json({ success: true, products: products.map(p => ({ ...p, images: JSON.parse(p.images), metadata: p.metadata ? JSON.parse(p.metadata) : {} })) });
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/products', authenticateToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, price, gstSlab, inventoryCount } = req.body;
    
    // Generate a simple slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
    
    let images = [];
    if (req.file) {
      // Create relative URL for frontend
      images.push('/images/products/' + req.file.filename);
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        category,
        price: parseInt(price, 10),
        gstSlab: parseInt(gstSlab, 10),
        inventoryCount: parseInt(inventoryCount, 10) || 0,
        images: JSON.stringify(images)
      }
    });
    
    res.json({ success: true, product: { ...product, images: JSON.parse(product.images) } });
  } catch (error) {
    logger.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/products/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { slug: req.params.slug } });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product: { ...product, images: JSON.parse(product.images) } });
  } catch (error) {
    logger.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Endpoint to create an order
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { currency = 'INR', receipt, paymentMethod, items, contact, address } = req.body;
    const userId = req.user.id;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided' });
    }

    if (paymentMethod === 'cod') {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.isVerified) {
        return res.status(403).json({ success: false, message: 'Account must be verified to use COD' });
      }
    }

    // Fetch products from DB
    const productSlugs = items.map(item => item.productId);
    const dbProducts = await prisma.product.findMany({ where: { slug: { in: productSlugs } } });
    
    let serverSubtotal = 0;
    
    // Check inventory and calculate total
    for (const item of items) {
      const product = dbProducts.find(p => p.slug === item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Unknown product: ${item.productId}` });
      }
      if (product.inventoryCount < (item.quantity || 1)) {
        return res.status(400).json({ success: false, message: `Insufficient inventory for ${product.name}` });
      }
      serverSubtotal += product.price * (item.quantity || 1);
    }
    
    const serverShipping = serverSubtotal >= 600000 ? 0 : 50000; // 6000 INR = 600000 paise
    const serverTotal = serverSubtotal + serverShipping;

    let orderId;
    let paymentGatewayOrderId = null;
    let shipmentDetails = null;

    if (address && address.pincode) {
      const isCod = (paymentMethod === 'cod');
      const serviceability = await logisticsEngine.checkPincodeServiceability(address.pincode, isCod, serverTotal);
      
      if (serviceability.serviceable) {
        const adapter = logisticsEngine.registry.get(serviceability.courierCode);
        shipmentDetails = await adapter.createShipment({ amount: serverTotal, address });
        
        const pInfo = await prisma.pincode.findUnique({ where: { pincode: address.pincode } });
        if (pInfo) {
          const estimate = estimateDeliveryDate({ pincodeTier: pInfo.tier, courierCode: serviceability.courierCode, isCod });
          shipmentDetails.estimatedMin = estimate.minDate;
          shipmentDetails.estimatedMax = estimate.maxDate;
        }
      }
    }

    if (paymentMethod !== 'cod') {
      const options = {
        amount: Math.round(serverTotal), 
        currency,
        receipt: receipt || `receipt_${Date.now()}`
      };
      const razorpayOrder = await razorpay.orders.create(options);
      paymentGatewayOrderId = razorpayOrder.id;
    }
    
    // Use transaction to atomically create order and deduct inventory
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Deduct inventory only for COD (others will deduct on payment verification)
      if (paymentMethod === 'cod') {
        for (const item of items) {
          await tx.product.update({
            where: { slug: item.productId },
            data: { inventoryCount: { decrement: item.quantity || 1 } }
          });
        }
      }

      // Create Order
      return await tx.order.create({
        data: {
          userId: userId || undefined,
          totalAmount: Math.round(serverTotal),
          paymentMethod,
          paymentGatewayOrderId,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
          metadata: JSON.stringify({ items, subtotal: serverSubtotal, tax: 0, shipping: serverShipping, contact, address, currency }),
          ...(shipmentDetails ? {
            shipment: {
              create: {
                courierCode: shipmentDetails.courierCode,
                awbNumber: shipmentDetails.awbNumber,
                status: 'manifested',
                estimatedMin: shipmentDetails.estimatedMin || undefined,
                estimatedMax: shipmentDetails.estimatedMax || undefined
              }
            }
          } : {})
        }
      });
    });

    orderId = paymentMethod === 'cod' ? createdOrder.id : paymentGatewayOrderId;
    
    // If COD, send confirmation email immediately since no payment gateway is involved
    if (paymentMethod === 'cod' && contact?.email) {
      sendOrderConfirmationEmail(contact.email, createdOrder).catch(console.error);
    }
    
    res.json({
      success: true,
      orderId: orderId,
      amount: Math.round(serverTotal), 
      currency: currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
});
// Endpoint to fetch all orders (Admin only)
app.get('/api/orders/all', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        shipment: true
      }
    });
    res.json({ success: true, orders });
  } catch (error) {
    logger.error('Error fetching all orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Endpoint to fetch orders for the authenticated user
app.get('/api/orders/me', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { shipment: true }
    });

    const mappedOrders = orders.map(order => {
      const metadata = order.metadata ? JSON.parse(order.metadata) : {};
      return {
        id: order.id,
        amount: order.totalAmount / 100,
        status: order.paymentStatus === 'paid' ? 'placed' : 'created', 
        paymentMethod: order.paymentMethod,
        date: order.createdAt,
        shipmentDetails: order.shipment,
        ...metadata
      };
    });

    res.json({ success: true, orders: mappedOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Endpoint to fetch order details for invoice
app.get('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { paymentGatewayOrderId: orderId }
        ]
      },
      include: { shipment: true }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const metadata = order.metadata ? JSON.parse(order.metadata) : {};
    
    const legacyOrderObj = {
      id: order.id,
      amount: order.totalAmount / 100, // convert back to INR
      status: order.paymentStatus === 'paid' ? 'placed' : 'created', 
      paymentMethod: order.paymentMethod,
      date: order.createdAt,
      shipmentDetails: order.shipment,
      ...metadata
    };
    
    res.json({ success: true, order: legacyOrderObj });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Endpoint to track an order
app.get('/api/orders/track/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { paymentGatewayOrderId: orderId }
        ]
      },
      include: { shipment: true }
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const metadata = order.metadata ? JSON.parse(order.metadata) : {};
    
    const legacyOrderObj = {
      id: order.id,
      amount: order.totalAmount / 100,
      status: order.paymentStatus === 'paid' ? 'placed' : 'created', 
      paymentMethod: order.paymentMethod,
      date: order.createdAt,
      shipmentDetails: order.shipment,
      ...metadata
    };

    res.json({ success: true, order: legacyOrderObj });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Dev endpoint to simulate order status progression
app.post('/api/orders/demo-advance/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { paymentGatewayOrderId: orderId }
        ]
      },
      include: { shipment: true }
    });
    
    if (!order || !order.shipment) {
      return res.status(404).json({ success: false, message: 'Order or shipment not found' });
    }

    const statuses = ['manifested', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(order.shipment.status);
    
    if (currentIndex < statuses.length - 1) {
      const nextStatus = statuses[currentIndex + 1];
      await prisma.shipment.update({
        where: { id: order.shipment.id },
        data: { status: nextStatus }
      });
      res.json({ success: true, status: nextStatus });
    } else {
      res.json({ success: true, status: order.shipment.status });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Endpoint to verify payment signature
app.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      // Payment is successful
      const order = await prisma.order.findFirst({ where: { paymentGatewayOrderId: razorpay_order_id } });
      if (order && order.paymentStatus !== 'paid') {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'paid',
            paymentId: razorpay_payment_id
          }
        });
        
        const metadata = JSON.parse(order.metadata || '{}');
        
        // Deduct inventory
        if (metadata.items && Array.isArray(metadata.items)) {
          for (const item of metadata.items) {
            await prisma.product.update({
              where: { slug: item.productId },
              data: { inventoryCount: { decrement: item.quantity || 1 } }
            }).catch(console.error);
          }
        }

        if (metadata.contact?.email) {
          sendOrderConfirmationEmail(metadata.contact.email, order).catch(console.error);
        }
      }

      return res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Internal server error during verification' });
  }
});

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  
  if (!signature) return res.status(400).send('No signature found');

  try {
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature === signature) {
      console.log('Webhook verified successfully:', req.body.event);
      
      const payload = req.body.payload;
      if (req.body.event === 'payment.captured' && payload.payment.entity.order_id) {
         await prisma.order.updateMany({
           where: { paymentGatewayOrderId: payload.payment.entity.order_id },
           data: {
             paymentStatus: 'paid',
             paymentId: payload.payment.entity.id
           }
         });
      }
      
      res.status(200).send('OK');
    } else {
      console.log('Webhook signature verification failed');
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook error');
  }
});

// ==========================================
// AUTHENTICATION GATEWAY
// ==========================================

const generateTokens = async (user, req) => {
  const payload = { userId: user.id };
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshTokenStr = crypto.randomBytes(40).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(refreshTokenStr).digest('hex');
  
  const deviceFingerprint = req?.headers['idempotency-key'] || req?.headers['user-agent'] || 'unknown'; // simplistic fallback
  
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: tokenHash,
      deviceFingerprint: deviceFingerprint,
      ipAddress: req?.ip || 'unknown',
      userAgent: req?.headers['user-agent'] || 'unknown',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  return { accessToken, refreshToken: refreshTokenStr };
};

app.post('/api/auth/request-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number required' });

    const ip = req.ip || 'unknown';
    const idempotencyKey = req.headers['idempotency-key'];

    // Rate limiting logic
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const phoneAttempts = await prisma.loginAttempt.count({ where: { phoneOrIp: phone, createdAt: { gte: tenMinsAgo } } });
    const ipAttempts = await prisma.loginAttempt.count({ where: { phoneOrIp: ip, createdAt: { gte: oneHourAgo } } });
    
    if (phoneAttempts >= 3 || ipAttempts >= 10) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
    }

    await prisma.loginAttempt.create({ data: { phoneOrIp: phone, success: false } });
    await prisma.loginAttempt.create({ data: { phoneOrIp: ip, success: false } });

    // Handle Idempotency (if identical request within a short window, do not resend SMS)
    if (idempotencyKey) {
      const recentOtp = await prisma.otpRequest.findFirst({
        where: { phone, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' }
      });
      // In a real app we'd map idempotencyKey to the request. Here we just rely on active OTP.
      if (recentOtp) {
        return res.json({ success: true, message: 'OTP already sent.' }); // Don't fire SMS
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    await prisma.otpRequest.create({
      data: { phone, otpHash, expiresAt }
    });

    logger.info(`[MOCK SMS] OTP for ${phone} is: ${otp}`);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    logger.error('Request OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    const record = await prisma.otpRequest.findFirst({
      where: { phone, expiresAt: { gt: new Date() }, verifiedAt: null },
      orderBy: { createdAt: 'desc' }
    });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (record.attempts >= 5) {
      return res.status(400).json({ success: false, message: 'Too many attempts. Request a new OTP.' });
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (record.otpHash !== otpHash) {
      await prisma.otpRequest.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Success
    await prisma.otpRequest.update({ where: { id: record.id }, data: { verifiedAt: new Date() } });

    let user = await prisma.user.findUnique({ where: { phone } });
    let isNewUser = false;

    if (!user) {
      user = await prisma.user.create({
        data: { phone, isVerified: true }
      });
      isNewUser = true;
    } else if (!user.isVerified) {
      user = await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
    }

    const tokens = await generateTokens(user, req);
    res.json({ success: true, ...tokens, user, new_user: isNewUser });
  } catch (error) {
    logger.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        passwordHash,
        isVerified: true,
        role: 'user'
      }
    });

    const tokens = await generateTokens(user, req);
    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, ...tokens, user: safeUser });
  } catch (error) {
    logger.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/login-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (user.deletedAt) {
      return res.status(401).json({ success: false, message: 'This account has been deactivated' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const tokens = await generateTokens(user, req);
    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, ...tokens, user: safeUser });
  } catch (error) {
    logger.error('Login Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always respond with success to prevent email enumeration attacks
    if (!user || !user.passwordHash) {
      logger.info(`[FORGOT PASSWORD] No account found for ${email}, responding with generic success.`);
      return res.json({ success: true, message: 'If an account exists with this email, a password reset link has been sent.' });
    }

    // Generate a temporary password and hash it
    const tempPassword = crypto.randomBytes(4).toString('hex'); // 8-char random password
    const newHash = await bcrypt.hash(tempPassword, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    });

    // Send email with temp password
    if (emailTransporter) {
      const info = await emailTransporter.sendMail({
        from: '"Bare Minimum" <noreply@bareminimum.shop>',
        to: email,
        subject: 'Password Reset — Bare Minimum',
        text: `Your temporary password is: ${tempPassword}\n\nPlease log in and change your password in your Account settings.`
      });
      logger.info(`[FORGOT PASSWORD] Temp password for ${email}: ${tempPassword}`);
      logger.info(`Preview Reset Email: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      // If email service is down, log temp password to console for dev
      logger.info(`[FORGOT PASSWORD] (Email service unavailable) Temp password for ${email}: ${tempPassword}`);
    }

    res.json({ success: true, message: 'If an account exists with this email, a password reset link has been sent.' });
  } catch (error) {
    logger.error('Forgot Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {

  try {
    const { refreshToken } = req.body;
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    const session = await prisma.session.findFirst({
      where: { refreshTokenHash: tokenHash }
    });

    if (!session || new Date() > session.expiresAt || session.revokedAt) {
      // Possible token theft detected! Revoke all sessions for this user.
      if (session) {
        logger.warn(`Token reuse detected for user ${session.userId}. Revoking all sessions.`);
        await prisma.session.updateMany({
          where: { userId: session.userId },
          data: { revokedAt: new Date() }
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    // Revoke the old token (rotation)
    await prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || user.deletedAt) return res.status(401).json({ success: false, message: 'User not found' });

    const tokens = await generateTokens(user, req);
    res.json({ success: true, ...tokens });
  } catch (error) {
    logger.error('Refresh Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await prisma.session.updateMany({
        where: { refreshTokenHash: tokenHash, userId: req.user.id },
        data: { revokedAt: new Date() }
      });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.delete('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() }
    });

    await prisma.session.updateMany({
      where: { userId },
      data: { revokedAt: new Date() }
    });

    logger.info(`[DPDP] User ${userId} requested erasure. Soft deleted.`);
    res.json({ success: true, message: 'Account and personal data scheduled for deletion' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get current user profile and addresses
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { addresses: true }
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Remove sensitive info
    const { passwordHash, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update Profile endpoint
app.put('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const { name, email, dateOfBirth, address } = req.body;
    
    // Use transaction to update user and handle address
    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: req.user.id },
        data: { name, email, dateOfBirth }
      });

      if (address) {
        // Find existing default address or first address
        const existingAddress = await tx.address.findFirst({
          where: { userId: req.user.id }
        });

        if (existingAddress) {
          await tx.address.update({
            where: { id: existingAddress.id },
            data: {
              address1: address.address1,
              address2: address.address2 || null,
              city: address.city,
              state: address.state,
              pincode: address.pincode,
              landmark: address.landmark || null,
            }
          });
        } else {
          await tx.address.create({
            data: {
              userId: req.user.id,
              address1: address.address1,
              address2: address.address2 || null,
              city: address.city,
              state: address.state,
              pincode: address.pincode,
              landmark: address.landmark || null,
              isDefault: true
            }
          });
        }
      }
      
      return tx.user.findUnique({
        where: { id: req.user.id },
        include: { addresses: true }
      });
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update Phone endpoint
app.post('/api/users/me/update-phone', authenticateToken, async (req, res) => {
  try {
    const { newPhone, otp } = req.body;
    
    // Check if newPhone already exists
    const existingUser = await prisma.user.findUnique({ where: { phone: newPhone } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone number is already registered to another account.' });
    }

    // Verify OTP
    const record = await prisma.otpRequest.findFirst({
      where: { phone: newPhone, expiresAt: { gt: new Date() }, verifiedAt: null },
      orderBy: { createdAt: 'desc' }
    });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (record.attempts >= 5) {
      return res.status(400).json({ success: false, message: 'Too many attempts. Request a new OTP.' });
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (record.otpHash !== otpHash) {
      await prisma.otpRequest.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Success - mark OTP as verified
    await prisma.otpRequest.update({ where: { id: record.id }, data: { verifiedAt: new Date() } });

    // Update user's phone
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { phone: newPhone, isVerified: true },
      include: { addresses: true }
    });

    const { passwordHash, ...safeUser } = updatedUser;
    res.json({ success: true, message: 'Phone number updated successfully', user: safeUser });
  } catch (error) {
    logger.error('Error updating phone:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- CENTRALIZED ERROR HANDLER ---
app.use((err, req, res, next) => {
  logger.error('Unhandled Exception:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// --- BACKGROUND JOBS ---
// Run every 5 minutes to clean up expired OTPs (DPDP compliance)
setInterval(async () => {
  try {
    const deleted = await prisma.otpRequest.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    });
    if (deleted.count > 0) {
      logger.info(`[Cleanup] Deleted ${deleted.count} expired OTP records.`);
    }
  } catch (error) {
    logger.error('Error cleaning up OTPs:', error);
  }
}, 5 * 60 * 1000);

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// --- GRACEFUL SHUTDOWN ---
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await prisma.$disconnect();
      logger.info('Prisma disconnected.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown:', err);
      process.exit(1);
    }
  });
  
  // Force shutdown after 10s if not closed
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
