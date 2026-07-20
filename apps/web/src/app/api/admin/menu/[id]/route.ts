import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        isSpicy: data.isSpicy,
        isVegetarian: data.isVegetarian,
        isFeatured: data.isFeatured,
        isAvailable: data.isAvailable,
        modifiers: data.modifiers ?? [],
      },
      include: { category: true },
    });
    return NextResponse.json(item);
  } catch (err) {
    console.error('[menu PATCH]', err);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.menuItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[menu DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
