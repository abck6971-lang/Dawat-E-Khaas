import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const imageMap: Record<string, string> = {
    'Classic Smash Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop',
    'Zinger Burger': 'https://images.unsplash.com/photo-1610440042657-612c34d95e9f?q=80&w=800&auto=format&fit=crop',
    'Chicken Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop',
    'Mutton Karahi': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800&auto=format&fit=crop',
    'Palak Paneer': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop',
    'Seekh Kabab Platter': 'https://images.unsplash.com/photo-1599487405902-1811e58f0003?q=80&w=800&auto=format&fit=crop',
    'Chicken Malai Boti': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop',
    'Mint Margarita': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop',
    'Soft Drink': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop',
  };

  const items = await prisma.menuItem.findMany();
  
  for (const item of items) {
    if (imageMap[item.name]) {
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { imageUrl: imageMap[item.name] }
      });
      console.log(`Updated image for ${item.name}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
