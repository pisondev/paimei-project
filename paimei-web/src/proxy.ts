import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const token = request.cookies.get('paimei_session')?.value;
  const { pathname } = request.nextUrl;
  
  const isDev = process.env.NODE_ENV === 'development';
  const baseUrl = isDev ? 'http://localhost:3000' : 'https://paimei.tierratie.com';

  // ==========================================
  // HACK: DECODE JWT UNTUK MENCARI TAHU ROLE
  // ==========================================
  let isAdmin = false;
  if (token) {
    try {
      // Token JWT terdiri dari 3 bagian yang dipisah titik. Bagian ke-2 adalah payload (data).
      const payloadBase64 = token.split('.')[1];
      // Decode dari Base64 ke teks JSON (atob aman digunakan di Next.js Edge)
      const decodedJson = atob(payloadBase64);
      
      // Jika di dalam data token ada kata 'paisen' atau 'admin', jadikan dia Admin
      if (decodedJson.toLowerCase().includes('paisen') || decodedJson.toLowerCase().includes('admin')) {
        isAdmin = true;
      }
    } catch (e) {
      console.error("Gagal membaca isi token", e);
    }
  }

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

  // 3. Logika TIME-GATE KHUSUS BIRTHDAY DENGAN BYPASS ADMIN
  if (pathname.startsWith('/birthday')) {
    const now = new Date();
    // Kunci sampai 31 Maret 2026, 00:00:00 WIB
    const unlockDate = new Date("2026-03-30T22:29:00+07:00"); 

    // JIKA BUKAN ADMIN DAN WAKTU BELUM TIBA -> TENDANG KE HUB
    if (!isAdmin && now < unlockDate) {
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
  // Pastikan proxy mencegat rute-rute ini
  matcher: ['/', '/hub/:path*', '/anniversary/:path*', '/coupons/:path*', '/birthday/:path*'],
};