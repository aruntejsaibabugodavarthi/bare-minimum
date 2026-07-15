const prisma = require('../utils/prisma');
const { logger } = require('./error.middleware');

const adminAudit = (req, res, next) => {
  if (['GET', 'OPTIONS', 'HEAD'].includes(req.method)) return next();

  const originalJson = res.json;
  res.json = function (body) {
    // Only log successful mutations
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const auditMeta = req.audit || {};

      const action = auditMeta.action || `${req.method}_${req.baseUrl}${req.path}`;
      const resource = auditMeta.resource || 'UNKNOWN_RESOURCE';

      const details = {
        payload: req.body,
        before: auditMeta.before || null,
        after: auditMeta.after || body
      };

      // Fire and forget automatic audit
      prisma.auditLog
        .create({
          data: {
            adminId: req.user ? req.user.id : 'SYSTEM',
            action: action,
            resource: resource,
            details: JSON.stringify(details),
            ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
          }
        })
        .catch((err) => logger.error('Failed to write automatic audit log:', err));
    }
    return originalJson.call(this, body);
  };
  next();
};

module.exports = { adminAudit };
