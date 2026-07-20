const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Migrating old statuses...');
  try {
    await prisma.$executeRawUnsafe(`
      UPDATE "Order"
      SET status = 'PENDING'
      WHERE status IN ('CONFIRMED', 'READY', 'DELIVERED');
    `);
    console.log(`Updated old orders to PENDING`);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
