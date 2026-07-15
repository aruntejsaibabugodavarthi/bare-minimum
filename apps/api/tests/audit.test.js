const request = require('supertest');
const express = require('express');

// We must require prisma first to create the user
const prisma = require('../src/utils/prisma');

// Variable to store the user id
const mockData = { userId: null };

jest.mock('../src/middleware/auth.middleware', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: mockData.userId, role: 'ADMIN' };
    next();
  },
  verifyAdmin: (req, res, next) => next()
}));

const adminRoutes = require('../src/routes/admin.routes');
const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

describe('Admin Audit Logging Middleware', () => {
  beforeAll(async () => {
    const testUser = await prisma.user.upsert({
      where: { email: 'admin-audit-test@example.com' },
      update: {},
      create: {
        name: 'Test Admin',
        email: 'admin-audit-test@example.com',
        passwordHash: 'hash',
        role: 'ADMIN'
      }
    });
    mockData.userId = testUser.id;
    await prisma.auditLog.deleteMany({ where: { adminId: mockData.userId } });
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({ where: { adminId: mockData.userId } });
    await prisma.$disconnect();
  });

  it('should automatically log an order status update', async () => {
    const mockOrderUpdate = jest
      .spyOn(prisma.order, 'update')
      .mockResolvedValue({ id: 'order-123', status: 'SHIPPED' });

    const res = await request(app)
      .put('/api/admin/orders/order-123/status')
      .send({ status: 'SHIPPED' });

    expect(res.statusCode).toBe(200);

    // Wait for the fire-and-forget audit log to be created
    await new Promise((r) => setTimeout(r, 200));

    const log = await prisma.auditLog.findFirst({
      where: {
        adminId: mockData.userId,
        action: 'UPDATE_ORDER_STATUS',
        resource: 'Order:order-123'
      }
    });

    expect(log).toBeDefined();
    expect(log).not.toBeNull();
    expect(log.details).toContain('SHIPPED');

    mockOrderUpdate.mockRestore();
  });
});
