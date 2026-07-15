const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const config = require('../config');
const { logger } = require('./error.middleware');

function authenticateToken(req, res, next) {
  let token = null;

  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
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

module.exports = {
  authenticateToken,
  verifyAdmin
};
