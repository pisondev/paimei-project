import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const token = request.cookies.get('paimei_session')?.value;
  const { pathname } = request.nextUrl;
  
  const isDev = process.env.NODE_ENV === 'development';

  // Tentukan base URL secara dinamis
  const baseUrl = isDev 
    ? 'http://localhost:3000' 
    : 'https://paimei.tierratie.com';

  // Daftar halaman yang wajib login
  const protectedPaths = ['/hub', '/anniversary', '/coupons', '/birthday'];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  // 1. Jika BELUM LOGIN dan mencoba masuk rute rahasia -> Tendang ke halaman Login (/)
  if (!token && isProtected) {
    return NextResponse.redirect(new URL('/', baseUrl));
  }

  // 2. Jika SUDAH LOGIN dan berada di halaman Login (/) -> Lempar ke Hub
  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/hub', baseUrl));
  }

  // 3. Logika TIME-GATE KHUSUS BIRTHDAY
  if (pathname.startsWith('/birthday')) {
    const now = new Date();
    // Kunci sampai 31 Maret 2026, 00:00:00 WIB
    const unlockDate = new Date("2026-03-31T00:00:00+07:00"); 

    if (now < unlockDate) {
      return NextResponse.redirect(new URL('/hub', baseUrl));
    }
  }

  // 4. Injeksi Header KHUSUS PRODUCTION (VPS/Docker)
  if (!isDev) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-forwarded-host', 'paimei.tierratie.com');
    requestHeaders.set('x-forwarded-proto', 'https');
    requestHeaders.set('host', 'paimei.tierratie.com');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/hub/:path*', '/anniversary/:path*', '/coupons/:path*', '/birthday/:path*'],
};