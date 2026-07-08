const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logger } = require('../middleware/error.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { z } = require('zod');
const { validate } = require('../middleware/validate.middleware');

router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json({ success: true, products });
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    logger.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.id },
      include: { user: { select: { name: true } } }
    });
    res.json({ success: true, reviews });
  } catch (error) {
    logger.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional()
});

router.post('/:id/reviews', authenticateToken, validate(reviewSchema), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    
    // Check if user has purchased the product
    const orderItems = await prisma.orderItem.findMany({
      where: {
        productId: req.params.id,
        order: { userId: req.user.id }
      }
    });

    if (orderItems.length === 0) {
      return res.status(403).json({ success: false, message: 'You can only review products you have purchased' });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        productId: req.params.id,
        userId: req.user.id
      }
    });

    res.json({ success: true, review });
  } catch (error) {
    logger.error('Error submitting review:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
