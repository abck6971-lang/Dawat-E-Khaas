import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();
  const order = await prisma.order.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json(order);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // OrderItems are cascade-deleted via the schema relation
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[order DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
