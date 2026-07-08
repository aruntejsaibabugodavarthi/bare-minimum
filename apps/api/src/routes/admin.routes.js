const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { logger } = require('../middleware/error.middleware');
const { authenticateToken, verifyAdmin } = require('../middleware/auth.middleware');

router.get('/dashboard-stats', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count();
    const totalRevenueResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: ['CONFIRMED', 'DELIVERED'] } }
    });
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenueResult._sum.totalAmount || 0
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/users', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json({ success: true, users });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/products', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    // Basic validation
    if (!name || !price || !stock) {
      return res.status(400).json({ success: false, message: 'Name, price and stock are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        category,
        imageUrl: '/assets/placeholder.jpg' // Default image for now
      }
    });

    res.json({ success: true, product });
  } catch (error) {
    logger.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
