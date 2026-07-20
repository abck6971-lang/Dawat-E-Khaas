import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, phone, address, notes, totalAmount, items } = data;

    if (!name || !phone || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Since our form only asks for phone, we'll generate a placeholder email for the DB
    const cleanPhone = phone.replace(/\s+/g, '');
    const email = `${cleanPhone}@guest.dawat.com`;

    // 1. Create or find customer
    const customer = await prisma.customer.upsert({
      where: { email },
      update: { name, phone }, // Update their name/phone if they changed it
      create: { name, email, phone },
    });

    // 2. Create the order
    const orderNotes = address && address !== 'Pickup' ? `Delivery Address: ${address}\n${notes || ''}` : `Pickup Order\n${notes || ''}`;

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        totalAmount,
        notes: orderNotes.trim(),
        status: 'PENDING',
        orderItems: {
          create: items.map((item: any) => ({
            menuItemId: item.id,
            quantity: item.qty,
            unitPrice: item.price,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (err) {
    console.error('[orders_post]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
