import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@repo/database';
import { signToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Check if email is already registered with a password (i.e. a real account, not a guest)
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing && existing.passwordHash) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Upsert: if they were a guest customer before, upgrade them to a full account
    const customer = await prisma.customer.upsert({
      where: { email },
      update: { name, phone: phone || existing?.phone, passwordHash },
      create: { name, email, phone, passwordHash },
    });

    const token = signToken({ customerId: customer.id, email: customer.email });

    return NextResponse.json({
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (err) {
    console.error('[auth/register]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
