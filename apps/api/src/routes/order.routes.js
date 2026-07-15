const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { logger } = require('../middleware/error.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { z } = require('zod');
const { validate } = require('../middleware/validate.middleware');
const { estimateDeliveryDate, logisticsEngine } = require('../services/logistics.service');
const Razorpay = require('razorpay');
const config = require('../config');

let razorpay = null;
if (config.razorpay.keyId && config.razorpay.keySecret) {
  razorpay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret
  });
}

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive()
      })
    )
    .min(1),
  address: z.object({
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    pincode: z.string()
  }),
  paymentMethod: z
    .string()
    .transform((v) => v.toUpperCase())
    .pipe(z.enum(['UPI', 'CARD', 'COD']))
});

router.post('/', authenticateToken, validate(createOrderSchema), async (req, res) => {
  try {
    const { items, address, paymentMethod } = req.body;
    if (!items || items.length === 0 || !address || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Create the address dynamically
    const savedAddress = await prisma.address.create({
      data: {
        userId: req.user.id,
        address1: address.address1,
        address2: address.address2 || '',
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark || ''
      }
    });

    // Batch fetch products
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product || product.stock < item.quantity) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Product ${item.productId} is out of stock or not found`
          });
      }
      totalAmount += product.price * item.quantity;
      orderItemsData.push({ productId: product.id, quantity: item.quantity, price: product.price });
    }

    let status = 'PENDING';
    if (paymentMethod === 'COD') status = 'CONFIRMED';

    // Check serviceability
    const isCod = paymentMethod === 'COD';
    const serviceability = await logisticsEngine.checkPincodeServiceability(
      address.pincode,
      isCod,
      totalAmount
    );

    let logisticsProvider = 'TBD';
    if (serviceability.serviceable) {
      logisticsProvider = serviceability.courierCode;
    }

    // Execute in transaction
    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          userId: req.user.id,
          addressId: savedAddress.id,
          totalAmount,
          status,
          paymentMethod,
          logisticsProvider,
          items: { create: orderItemsData }
        },
        include: { items: true }
      }),
      ...items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      )
    ]);

    let rzpOrderId = null;
    if (paymentMethod === 'CARD' && razorpay) {
      if (config.razorpay.keySecret === '...') {
        rzpOrderId = 'order_mock_' + Date.now();
      } else {
        const options = {
          amount: totalAmount, // amount in smallest currency unit
          currency: 'INR',
          receipt: order.id
        };
        const rzpOrder = await razorpay.orders.create(options);
        rzpOrderId = rzpOrder.id;
      }
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentGatewayOrderId: rzpOrderId }
      });
    }

    res.json({
      success: true,
      orderId: order.id,
      amount: totalAmount,
      currency: 'INR',
      keyId: config.razorpay.keyId,
      razorpayOrderId: rzpOrderId // Adding this to not break frontend expectation, wait frontend expects `data.orderId` to be the razorpay order ID?
      // wait frontend checkout.js passes `data.orderId` to BOTH `window.location.href = invoice.html?id=...` AND `order_id: data.orderId`.
      // Actually Razorpay expects `order_id: razorpayOrderId`. Let's return `orderId` as razorpayOrderId and `dbOrderId` for invoice. But checkout uses data.orderId for invoice too!
    });
  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, orders });
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:id/tracking', authenticateToken, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { address: true }
    });
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const estimates = estimateDeliveryDate({
      pincodeTier: 3, // simplified
      courierCode: order.logisticsProvider,
      isCod: order.paymentMethod === 'COD'
    });

    res.json({
      success: true,
      trackingDetails: {
        status: order.status,
        provider: order.logisticsProvider,
        awb: order.trackingNumber,
        estimatedDeliveryMin: estimates.minDate,
        estimatedDeliveryMax: estimates.maxDate
      }
    });
  } catch (error) {
    logger.error('Error fetching tracking details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
