require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 8081,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET
  },
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:8081']
};

// Validate critical config on startup
const requiredKeys = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
for (const key of requiredKeys) {
  if (!process.env[key]) {
    console.error(`FATAL ERROR: Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

module.exports = config;
