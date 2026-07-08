const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');
const { errorHandler } = require('./middleware/error.middleware');
const config = require('./config');
const compression = require('compression');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, // Disabling CSP for now to allow local dev assets
}));
app.use(compression());

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', globalLimiter);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || config.allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const staticDir = config.env === 'production' ? '../../old-web/dist' : '../../old-web/public';

// Legacy static file rewrite middleware
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/') && !path.extname(req.path) && req.path !== '/') {
    const filePath = path.join(__dirname, staticDir, req.path + '.html');
    return res.sendFile(filePath, (err) => {
      if (err) next();
    });
  }
  next();
});

app.use(express.static(path.join(__dirname, staticDir), {
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
}));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// Fallback to index.html for SPA (if it was an SPA, but this is multi-page so we just serve static)

// Error handling middleware should be last
app.use(errorHandler);

module.exports = app;
