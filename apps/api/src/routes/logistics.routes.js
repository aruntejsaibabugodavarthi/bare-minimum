const express = require('express');
const router = express.Router();
const { logger } = require('../middleware/error.middleware');

router.get('/pincode/:pin', async (req, res) => {
  try {
    const pin = req.params.pin;

    // Simple dummy validation: must be 6 digits
    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format'
      });
    }

    // Accept most standard Indian pincodes (starting with 1-8)
    const isServiceable = /^[1-8]\d{5}$/.test(pin);

    if (isServiceable) {
      // Calculate a dummy estimated delivery date (2-5 days from now)
      const now = new Date();
      const estimatedMin = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      const estimatedMax = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

      return res.json({
        success: true,
        serviceable: true,
        city: 'Mock City',
        state: 'Mock State',
        estimatedMin: estimatedMin.toISOString(),
        estimatedMax: estimatedMax.toISOString()
      });
    } else {
      return res.json({
        success: true,
        serviceable: false,
        message: 'We currently do not deliver to this pincode'
      });
    }
  } catch (error) {
    logger.error('Error in pincode validation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
