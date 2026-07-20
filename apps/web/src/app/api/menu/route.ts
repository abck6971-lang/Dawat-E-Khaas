import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const menuItems = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ categories, menuItems });
  } catch (err) {
    console.error('[public menu GET]', err);
    return NextResponse.json({ categories: [], menuItems: [], error: String(err) });
  }
}
