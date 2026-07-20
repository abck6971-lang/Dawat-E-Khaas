const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const map = {
  "Classic Smash Burger": "/images/menu/smash_burger.png",
  "Zinger Burger": "/images/menu/zinger_burger.png",
  "Chicken Biryani": "/images/menu/chicken_biryani.png",
  "Mutton Karahi": "/images/menu/mutton_karahi.png",
  "Seekh Kabab Platter": "/images/menu/seekh_kabab.png",
  "Mint Margarita": "/images/menu/mint_margarita.png"
};

async function main() {
  for (const [name, url] of Object.entries(map)) {
    await prisma.menuItem.updateMany({
      where: { name },
      data: { imageUrl: url }
    });
    console.log(`Updated ${name}`);
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
