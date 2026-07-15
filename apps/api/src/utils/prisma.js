const { PrismaClient } = require('@prisma/client');
const { fieldEncryptionExtension } = require('prisma-field-encryption');

// Prevent multiple instances of Prisma Client in development
// and provide a single shared connection pool for production.
const globalForPrisma = global;

const prismaClient = new PrismaClient();
const prisma = globalForPrisma.prisma || prismaClient.$extends(fieldEncryptionExtension());

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
