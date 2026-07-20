import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@repo/database';
import { signToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({ where: { email } });

    if (!customer || !customer.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

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
    console.error('[auth/login]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
