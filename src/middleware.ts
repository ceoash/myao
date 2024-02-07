// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname;

  if (hostname === 'admin.localhost:3000') {
    // Rewrite to /admin for this specific subdomain
    return NextResponse.rewrite(new URL('/admin', request.url));
  }

  // Handle other paths or hostnames as needed
  // ...
}
