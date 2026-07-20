import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  // Create 1x1 green image
  const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgHwk536AAAAAElFTkSuQmCC";
  const filePath = 'public/uploads/plain_green.png';
  if (!fs.existsSync('public/uploads')) {
    fs.mkdirSync('public/uploads', { recursive: true });
  }
  fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
  console.log('Created green image at public/uploads/plain_green.png');

  // Get a category, or create one
  let category = await prisma.category.findFirst({ where: { name: 'Fresh Greens' } });
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Fresh Greens',
        slug: 'fresh-greens',
        sortOrder: 1,
      }
    });
  }

  // Create items
  const items = [
    { name: 'Mint Margarita Special', price: 250, description: 'A perfectly refreshing mint drink for the summer.', categoryId: category.id, imageUrl: '/uploads/plain_green.png', isFeatured: true, isVegetarian: true },
    { name: 'Spinach & Feta Salad', price: 450, description: 'Healthy spinach salad topped with imported feta cheese.', categoryId: category.id, imageUrl: '/uploads/plain_green.png', isVegetarian: true },
    { name: 'Palak Paneer Classic', price: 650, description: 'A beloved classic, cottage cheese cubes simmered in fresh spinach.', categoryId: category.id, imageUrl: '/uploads/plain_green.png', isSpicy: true, isVegetarian: true },
  ];

  for (const item of items) {
    await prisma.menuItem.create({ data: item });
    console.log('Added:', item.name);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
