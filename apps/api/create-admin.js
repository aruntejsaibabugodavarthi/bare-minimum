const prisma = require('./src/utils/prisma');
const bcrypt = require('bcrypt');

async function createAdmin() {
  const email = 'admin@bareminimum.com';
  const password = 'AdminPassword123';

  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (existingAdmin) {
    console.log('Admin already exists.');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name: 'System Admin',
      role: 'admin',
      isVerified: true
    }
  });
  console.log(`Admin created: ${email} / ${password}`);
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
