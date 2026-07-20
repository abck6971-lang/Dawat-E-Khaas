import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const category = await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      description: data.description ?? null,
      sortOrder: data.sortOrder ?? 0,
    },
  });
  return NextResponse.json(category);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
