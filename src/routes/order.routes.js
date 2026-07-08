const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logger } = require('../middleware/error.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { estimateDeliveryDate, logisticsEngine } = require('../services/logistics.service');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, addressId, paymentMethod } = req.body;
    if (!items || items.length === 0 || !addressId || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const address = await prisma.address.findUnique({ where: { id: addressId, userId: req.user.id } });
    if (!address) return res.status(400).json({ success: false, message: 'Invalid address' });

    let totalAmount = 0;
    const orderItemsData = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Product ${item.productId} is out of stock or not found` });
      }
      totalAmount += product.price * item.quantity;
      orderItemsData.push({ productId: product.id, quantity: item.quantity, price: product.price });
    }

    let status = 'PENDING';
    if (paymentMethod === 'COD') status = 'CONFIRMED';
    
    // Check serviceability
    const isCod = paymentMethod === 'COD';
    const serviceability = await logisticsEngine.checkPincodeServiceability(address.pincode, isCod, totalAmount);
    
    let logisticsProvider = 'TBD';
    if (serviceability.serviceable) {
      logisticsProvider = serviceability.courierCode;
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        addressId,
        totalAmount,
        status,
        paymentMethod,
        logisticsProvider,
        items: { create: orderItemsData }
      },
      include: { items: true }
    });

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    res.json({ success: true, order });
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
