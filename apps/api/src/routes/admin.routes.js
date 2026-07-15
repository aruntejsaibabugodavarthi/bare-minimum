const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { logger } = require('../middleware/error.middleware');
const { authenticateToken, verifyAdmin } = require('../middleware/auth.middleware');
const { adminAudit } = require('../middleware/audit.middleware');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../old-web/public/assets/images'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Apply audit middleware to all admin routes
router.use(adminAudit);

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

router.get('/orders', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to 50 for admin dashboard to prevent overload
    });
    res.json({ success: true, orders });
  } catch (error) {
    logger.error('Error fetching admin orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/orders/:id/status', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RTO'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    req.audit = {
      action: 'UPDATE_ORDER_STATUS',
      resource: `Order:${id}`,
      details: { status }
    };

    res.json({ success: true, order });
  } catch (error) {
    logger.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post(
  '/products',
  authenticateToken,
  verifyAdmin,
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, description, price, stock, category, gstSlab } = req.body;
      // Basic validation
      if (!name || !price || !stock) {
        return res
          .status(400)
          .json({ success: false, message: 'Name, price and stock are required' });
      }

      const slug =
        name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

      const product = await prisma.product.create({
        data: {
          name,
          slug,
          description,
          price: parseInt(price, 10),
          stock: parseInt(stock, 10),
          category,
          gstSlab: gstSlab ? parseInt(gstSlab, 10) : 18,
          images: req.file
            ? JSON.stringify(['assets/images/' + req.file.filename])
            : '["assets/images/tumbler.png"]'
        }
      });

      req.audit = {
        action: 'CREATE_PRODUCT',
        resource: `Product:${product.id}`,
        details: { name, price, stock }
      };

      res.json({ success: true, product });
    } catch (error) {
      logger.error('Error creating product:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

module.exports = router;
