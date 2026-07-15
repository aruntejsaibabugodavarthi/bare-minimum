const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const prisma = require('../utils/prisma');
const { logger } = require('../middleware/error.middleware');

const router = express.Router();

// -----------------------------------------
// PROFILE ROUTES
// -----------------------------------------

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        profilePhoto: true,
        twoFactorEnabled: true,
        notificationPrefs: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    logger.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, dateOfBirth, notificationPrefs } = req.body;

    // Note: Email and Phone changes usually require OTP verification.
    // This is basic profile update.
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        dateOfBirth,
        ...(notificationPrefs && { notificationPrefs: JSON.stringify(notificationPrefs) })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        profilePhoto: true,
        notificationPrefs: true
      }
    });

    res.json({ success: true, user });
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -----------------------------------------
// ADDRESS ROUTES
// -----------------------------------------

router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });
    res.json({ success: true, addresses });
  } catch (error) {
    logger.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/addresses', authenticateToken, async (req, res) => {
  try {
    const { address1, address2, city, state, pincode, landmark, isDefault } = req.body;

    if (isDefault) {
      // Unset other defaults
      await prisma.address.updateMany({
        where: { userId: req.user.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        address1,
        address2,
        city,
        state,
        pincode,
        landmark,
        isDefault: isDefault || false
      }
    });

    res.json({ success: true, address });
  } catch (error) {
    logger.error('Error creating address:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { address1, address2, city, state, pincode, landmark, isDefault } = req.body;

    // Check ownership
    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Address not found' });

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id, id: { not: id }, isDefault: true },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: { address1, address2, city, state, pincode, landmark, isDefault }
    });

    res.json({ success: true, address });
  } catch (error) {
    logger.error('Error updating address:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Address not found' });

    await prisma.address.delete({ where: { id } });

    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    logger.error('Error deleting address:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -----------------------------------------
// ORDER ROUTES (Customer View)
// -----------------------------------------

router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;

    const whereClause = { userId: req.user.id };
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: {
              select: { name: true, images: true }
            },
            variant: {
              select: { size: true, color: true }
            }
          }
        },
        shipment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, orders });
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: { id, userId: req.user.id },
      include: {
        address: true,
        items: {
          include: {
            product: {
              select: { name: true, images: true, slug: true }
            },
            variant: {
              select: { size: true, color: true }
            }
          }
        },
        shipment: true
      }
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, order });
  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
