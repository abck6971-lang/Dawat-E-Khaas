import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { menuItems: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (err) {
    console.error('[categories GET]', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    console.error('[categories POST]', err);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
