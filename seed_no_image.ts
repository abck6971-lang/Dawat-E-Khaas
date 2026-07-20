import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Define categories
  const categoryData = [
    { name: 'Burgers', slug: 'burgers', sortOrder: 1 },
    { name: 'Desi', slug: 'desi', sortOrder: 2 },
    { name: 'BBQ', slug: 'bbq', sortOrder: 3 },
    { name: 'Beverages', slug: 'beverages', sortOrder: 4 },
  ];

  // Insert categories and keep track of their IDs
  const categories: Record<string, string> = {};
  for (const c of categoryData) {
    const created = await prisma.category.create({ data: c });
    categories[c.name] = created.id;
    console.log(`Created category: ${c.name}`);
  }

  // Define items
  const items = [
    { name: 'Classic Smash Burger', description: 'Double beef patty smashed to perfection with cheese.', price: 850, categoryId: categories['Burgers'], isFeatured: true, isSpicy: false, isVegetarian: false, isAvailable: true },
    { name: 'Zinger Burger', description: 'Crispy fried chicken breast with spicy mayo.', price: 750, categoryId: categories['Burgers'], isFeatured: false, isSpicy: true, isVegetarian: false, isAvailable: true },
    { name: 'Chicken Biryani', description: 'Aromatic basmati rice cooked with spiced chicken.', price: 650, categoryId: categories['Desi'], isFeatured: true, isSpicy: true, isVegetarian: false, isAvailable: true },
    { name: 'Mutton Karahi', description: 'Tender mutton cooked in a rich tomato and ginger gravy.', price: 1800, categoryId: categories['Desi'], isFeatured: true, isSpicy: true, isVegetarian: false, isAvailable: true },
    { name: 'Palak Paneer', description: 'Cottage cheese cubes simmered in fresh spinach.', price: 700, categoryId: categories['Desi'], isFeatured: false, isSpicy: false, isVegetarian: true, isAvailable: true },
    { name: 'Seekh Kabab Platter', description: 'Four juicy beef seekh kababs served with mint chutney.', price: 1200, categoryId: categories['BBQ'], isFeatured: true, isSpicy: true, isVegetarian: false, isAvailable: true },
    { name: 'Chicken Malai Boti', description: 'Creamy, tender chicken cubes grilled over charcoal.', price: 950, categoryId: categories['BBQ'], isFeatured: false, isSpicy: false, isVegetarian: false, isAvailable: true },
    { name: 'Mint Margarita', description: 'Refreshing blend of fresh mint, lemon, and ice.', price: 250, categoryId: categories['Beverages'], isFeatured: true, isSpicy: false, isVegetarian: true, isAvailable: true },
    { name: 'Soft Drink', description: 'Chilled soda can.', price: 100, categoryId: categories['Beverages'], isFeatured: false, isSpicy: false, isVegetarian: true, isAvailable: true },
  ];

  // Insert items
  for (const item of items) {
    await prisma.menuItem.create({ data: item });
    console.log(`Created item: ${item.name}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
