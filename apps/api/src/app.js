const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const config = require('./config');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');
const logisticsRoutes = require('./routes/logistics.routes');
const accountRoutes = require('./routes/account.routes');
const { errorHandler } = require('./middleware/error.middleware');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: config.env === 'production' ? undefined : false
  })
);
app.use(compression());
app.use(cookieParser());

const { generateCsrfToken, verifyCsrfToken } = require('./middleware/csrf.middleware');
app.use(generateCsrfToken);
app.use('/api', verifyCsrfToken);

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', globalLimiter);

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const staticDir = config.env === 'production' ? '../../old-web/dist' : '../../old-web/public';

app.use(
  express.static(path.join(__dirname, staticDir), {
    extensions: ['html'],
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    }
  })
);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// CSRF Token endpoint for clients
app.get('/api/csrf-token', (req, res) => {
  res.json({ success: true, csrfToken: req.csrfToken });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/account', accountRoutes);

// Fallback to index.html for SPA (if it was an SPA, but this is multi-page so we just serve static)

// 404 Handler
app.use((req, res, next) => {
  res.status(404).send('404 Not Found');
});

// Error handling middleware should be last
app.use(errorHandler);

module.exports = app;
