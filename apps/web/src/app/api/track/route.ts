import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone')?.trim();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Find customer by phone, then return their orders
    const customer = await prisma.customer.findFirst({
      where: { phone: { contains: phone } },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            orderItems: {
              include: { menuItem: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (!customer || customer.orders.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    // Shape data for the client — only expose what's needed
    const orders = customer.orders.map(o => ({
      id: o.id,
      status: o.status,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      itemCount: o.orderItems.reduce((s, i) => s + i.quantity, 0),
      items: o.orderItems.map(i => i.menuItem.name),
    }));

    return NextResponse.json({ orders, customerName: customer.name });
  } catch (err) {
    console.error('[track_lookup]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
