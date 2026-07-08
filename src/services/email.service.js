const nodemailer = require('nodemailer');
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

let emailTransporter;
nodemailer.createTestAccount().then(account => {
  emailTransporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: { user: account.user, pass: account.pass }
  });
  logger.info('Ethereal Email transporter created for development.');
}).catch(err => {
  logger.error('Failed to create Ethereal Email test account (network issue). Emails will not be sent.', err.message);
});

async function sendOrderConfirmationEmail(userEmail, orderDetails) {
  if (!emailTransporter || !userEmail) return;
  try {
    const info = await emailTransporter.sendMail({
      from: '"Bare Minimum" <noreply@bareminimum.shop>',
      to: userEmail,
      subject: `Order Confirmation - ${orderDetails.id}`,
      text: `Thank you for your order! Your total was Rs. ${orderDetails.totalAmount / 100}.`
    });
    logger.info(`Preview Confirmation Email: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    logger.error('Failed to send confirmation email', error);
  }
}

async function sendPasswordResetEmail(userEmail, tempPassword) {
  if (!emailTransporter || !userEmail) return;
  try {
    const info = await emailTransporter.sendMail({
      from: '"Bare Minimum" <noreply@bareminimum.shop>',
      to: userEmail,
      subject: 'Password Reset — Bare Minimum',
      text: `Your temporary password is: ${tempPassword}\n\nPlease log in and change your password in your Account settings.`
    });
    logger.info(`Preview Reset Email: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    logger.error('Failed to send reset email', error);
  }
}

async function sendPasswordResetTokenEmail(userEmail, token) {
  if (!emailTransporter || !userEmail) return;
  try {
    const resetUrl = `http://localhost:8081/reset-password.html?token=${token}`; // Adjust in production
    const info = await emailTransporter.sendMail({
      from: '"Bare Minimum" <noreply@bareminimum.shop>',
      to: userEmail,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link to reset your password: ${resetUrl}\n\nIf you did not request this, please ignore this email.`
    });
    logger.info(`Preview Reset Email: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    logger.error('Failed to send reset email', error);
  }
}

module.exports = {
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendPasswordResetTokenEmail
};
