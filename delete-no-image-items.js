const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: "postgresql://postgres.jfgcblixkgkfyndexvhr:Mahad%406225425@aws-1-us-east-2.pooler.supabase.com:5432/postgres" } }
});

async function main() {
  // Find all menu items without images
  const items = await prisma.menuItem.findMany({ where: { imageUrl: null } });
  console.log(`Found ${items.length} items without images:`, items.map(i => i.name));

  for (const item of items) {
    // Delete related OrderItems first (to avoid FK constraint)
    await prisma.orderItem.deleteMany({ where: { menuItemId: item.id } });
    console.log(`Deleted order items for: ${item.name}`);

    // Now delete the menu item
    await prisma.menuItem.delete({ where: { id: item.id } });
    console.log(`Deleted menu item: ${item.name}`);
  }

  console.log('Done!');
}

main().then(() => prisma.$disconnect()).catch(console.error);
