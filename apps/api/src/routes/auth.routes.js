const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validate } = require('../middleware/validate.middleware');
const { z } = require('zod');
const { sendPasswordResetTokenEmail } = require('../services/email.service');
const { logger } = require('../middleware/error.middleware');
const config = require('../config');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for auth routes
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional()
});

router.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash: hashedPassword, name }
    });
    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post('/login-password', authLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const accessToken = jwt.sign({ userId: user.id }, config.jwt.accessSecret, { expiresIn: '15m' });
    const refreshTokenStr = jwt.sign({ userId: user.id }, config.jwt.refreshSecret, { expiresIn: '7d' });
    
    await prisma.refreshToken.create({
      data: { tokenHash: await bcrypt.hash(refreshTokenStr, 10), userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    });
    
    res.json({ success: true, accessToken, refreshToken: refreshTokenStr, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = await bcrypt.hash(resetToken, 10);
      
      await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
        }
      });
      await sendPasswordResetTokenEmail(user.email, resetToken);
    }
    res.json({ success: true, message: 'If an account exists with this email, a password reset link has been sent.' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
  email: z.string().email()
});

router.post('/reset-password', authLimiter, validate(resetPasswordSchema), async (req, res) => {
  try {
    const { token, newPassword, email } = req.body;
    const user = await prisma.user.findUnique({ 
      where: { email }, 
      include: { 
        passwordResetTokens: {
          where: { expiresAt: { gt: new Date() } }
        } 
      } 
    });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid request' });
    
    const now = new Date();
    let validTokenId = null;

    for (const resetToken of user.passwordResetTokens) {
      const isValid = await bcrypt.compare(token, resetToken.tokenHash);
      if (isValid) {
          validTokenId = resetToken.id;
        break;
      }
    }

    if (!validTokenId) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash }
    });

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    res.json({ success: true, message: 'Password has been successfully reset' });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
