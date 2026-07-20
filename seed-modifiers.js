const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: "postgresql://postgres.jfgcblixkgkfyndexvhr:Mahad%406225425@aws-1-us-east-2.pooler.supabase.com:5432/postgres" } }
});

const modifiersMap = {
  "Classic Smash Burger": [
    {
      name: "Spice Level",
      type: "radio",
      required: true,
      options: [
        { label: "Mild",        price: 0 },
        { label: "Normal",      price: 0 },
        { label: "Extra Spicy", price: 0 },
      ]
    },
    {
      name: "Add-ons",
      type: "checkbox",
      required: false,
      options: [
        { label: "Extra Cheese",    price: 100 },
        { label: "Extra Patty",     price: 200 },
        { label: "Add Fries",       price: 180 },
        { label: "Add Drink",       price: 120 },
      ]
    }
  ],

  "Zinger Burger": [
    {
      name: "Spice Level",
      type: "radio",
      required: true,
      options: [
        { label: "Mild",        price: 0 },
        { label: "Normal",      price: 0 },
        { label: "Extra Spicy", price: 0 },
      ]
    },
    {
      name: "Add-ons",
      type: "checkbox",
      required: false,
      options: [
        { label: "Extra Cheese",  price: 100 },
        { label: "Double Zinger", price: 250 },
        { label: "Add Fries",     price: 180 },
        { label: "Add Drink",     price: 120 },
      ]
    }
  ],

  "Chicken Biryani": [
    {
      name: "Portion Size",
      type: "radio",
      required: true,
      options: [
        { label: "Half Plate",  price: 0   },
        { label: "Full Plate",  price: 200 },
      ]
    },
    {
      name: "Extras",
      type: "checkbox",
      required: false,
      options: [
        { label: "Extra Raita",  price: 60 },
        { label: "Extra Salad",  price: 50 },
        { label: "Add Drink",    price: 120 },
      ]
    }
  ],

  "Mutton Karahi": [
    {
      name: "Portion",
      type: "radio",
      required: true,
      options: [
        { label: "Half Kg",  price: 0   },
        { label: "Full Kg",  price: 600 },
      ]
    },
    {
      name: "Spice Level",
      type: "radio",
      required: true,
      options: [
        { label: "Mild",        price: 0 },
        { label: "Normal",      price: 0 },
        { label: "Extra Spicy", price: 0 },
      ]
    },
    {
      name: "Bread",
      type: "checkbox",
      required: false,
      options: [
        { label: "Naan",    price: 30 },
        { label: "Roti",    price: 20 },
        { label: "Paratha", price: 50 },
      ]
    }
  ],

  "Seekh Kabab Platter": [
    {
      name: "Quantity",
      type: "radio",
      required: true,
      options: [
        { label: "4 Pieces",  price: 0   },
        { label: "6 Pieces",  price: 400 },
        { label: "8 Pieces",  price: 750 },
      ]
    },
    {
      name: "Spice Level",
      type: "radio",
      required: true,
      options: [
        { label: "Mild",        price: 0 },
        { label: "Normal",      price: 0 },
        { label: "Extra Spicy", price: 0 },
      ]
    },
    {
      name: "Bread",
      type: "checkbox",
      required: false,
      options: [
        { label: "Naan",  price: 30 },
        { label: "Roti",  price: 20 },
      ]
    },
    {
      name: "Extras",
      type: "checkbox",
      required: false,
      options: [
        { label: "Extra Mint Chutney", price: 40 },
        { label: "Add Drink",          price: 120 },
      ]
    }
  ],

  "Mint Margarita": [
    {
      name: "Size",
      type: "radio",
      required: true,
      options: [
        { label: "Regular (250ml)",  price: 0  },
        { label: "Large (500ml)",    price: 80 },
      ]
    },
    {
      name: "Ice Level",
      type: "radio",
      required: false,
      options: [
        { label: "Less Ice",   price: 0 },
        { label: "Normal Ice", price: 0 },
        { label: "Extra Ice",  price: 0 },
      ]
    }
  ],
};

async function main() {
  for (const [name, modifiers] of Object.entries(modifiersMap)) {
    const result = await prisma.menuItem.updateMany({
      where: { name },
      data: { modifiers }
    });
    if (result.count > 0) {
      console.log(`✅ ${name} — ${modifiers.length} modifier group(s) set`);
    } else {
      console.log(`⚠️  ${name} — item not found in DB`);
    }
  }
  console.log('\nDone!');
}

main().then(() => prisma.$disconnect()).catch(console.error);
