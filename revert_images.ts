import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const imageMap: Record<string, string> = {
    'Classic Smash Burger': '/images/menu/smash_burger.png',
    'Zinger Burger': '/images/menu/zinger_burger.png',
    'Chicken Biryani': '/images/menu/chicken_biryani.png',
    'Mutton Karahi': '/images/menu/mutton_karahi.png',
    'Seekh Kabab Platter': '/images/menu/seekh_kabab.png',
    'Mint Margarita': '/images/menu/mint_margarita.png',
  };

  const items = await prisma.menuItem.findMany();
  
  for (const item of items) {
    if (imageMap[item.name]) {
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { imageUrl: imageMap[item.name] }
      });
      console.log(`Reverted image for ${item.name} to ${imageMap[item.name]}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
