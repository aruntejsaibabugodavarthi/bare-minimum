const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Use a separate test database or mock in a real scenario, but for now we'll just test the endpoints.
// Since we don't want to pollute dev.db heavily, we'll just test validation errors.

describe('Auth Endpoints', () => {
  it('should return 400 for invalid email on register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'invalidemail', password: 'password123' });
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for short password on register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '123' });
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('should fail login with missing credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login-password')
      .send({ email: 'test@example.com' });
    expect(res.statusCode).toEqual(400);
  });
});
