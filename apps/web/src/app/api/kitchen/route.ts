import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

// Public kitchen endpoint — no admin JWT needed, kitchen screen accesses this
export async function GET() {
  try {
    const activeOrders = await prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'PREPARING', 'READY'] },
      },
      include: {
        customer: true,
        orderItems: {
          include: { menuItem: true },
        },
      },
      orderBy: { createdAt: 'asc' }, // oldest first — FIFO
    });

    const completedOrders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
      },
      include: {
        customer: true,
        orderItems: {
          include: { menuItem: true },
        },
      },
      orderBy: { updatedAt: 'desc' }, // newest completed first
      take: 20,
    });

    return NextResponse.json([...activeOrders, ...completedOrders]);
  } catch (err) {
    console.error('[kitchen GET]', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        orderItems: { include: { menuItem: true } },
      },
    });
    return NextResponse.json(order);
  } catch (err) {
    console.error('[kitchen PATCH]', err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
