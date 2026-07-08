const winston = require('winston');
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

function errorHandler(err, req, res, next) {
  logger.error('Unhandled Exception:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
}

module.exports = {
  errorHandler,
  logger
};
