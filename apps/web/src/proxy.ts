import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
  const isAdminApi  = pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/auth/login');

  if (isAdminPage || isAdminApi) {
    // Whitelist POS sync requests
    const posKey = req.headers.get('x-pos-key');
    if (posKey === 'dawat-pos-secret-123') {
      return NextResponse.next();
    }

    const token = req.cookies.get('admin_token')?.value;
    const payload = token ? await verifyAdminToken(token) : null;

    if (!payload) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      } else {
        const loginUrl = new URL('/admin/login', req.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all admin routes and admin API routes
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};
