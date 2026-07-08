const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logger } = require('../middleware/error.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const Razorpay = require('razorpay');

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: 'Payment gateway not configured' });
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      const order = await prisma.order.findFirst({ where: { paymentGatewayOrderId: razorpay_order_id } });
      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { 
            status: 'CONFIRMED',
            paymentId: razorpay_payment_id
          }
        });
        return res.json({ success: true, message: 'Payment verified successfully' });
      } else {
        return res.status(404).json({ success: false, message: 'Order not found for this payment' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    logger.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
