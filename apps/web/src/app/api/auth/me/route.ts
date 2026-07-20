import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: payload.customerId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            orderItems: {
              include: { menuItem: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });
    }

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      orders: customer.orders,
    });
  } catch (err) {
    console.error('[auth/me]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
