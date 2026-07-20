import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error('[menu GET]', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const item = await prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        isSpicy: data.isSpicy ?? false,
        isVegetarian: data.isVegetarian ?? false,
        isFeatured: data.isFeatured ?? false,
        isAvailable: data.isAvailable ?? true,
        modifiers: data.modifiers ?? [],
      },
      include: { category: true },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error('[menu POST]', err);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
