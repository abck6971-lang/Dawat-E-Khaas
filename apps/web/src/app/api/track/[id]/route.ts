import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true, phone: true } },
        orderItems: {
          include: { menuItem: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error('[track_order]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
