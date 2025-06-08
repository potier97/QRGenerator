import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Agregar headers de seguridad básicos
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy para permitir Firebase y recursos necesarios
  response.headers.set(
    'Content-Security-Policy',
    `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' *.firebaseapp.com *.firebase.com *.firebaseio.com *.googleapis.com;
      style-src 'self' 'unsafe-inline' fonts.googleapis.com;
      img-src 'self' blob: data: https:;
      font-src 'self' fonts.gstatic.com;
      connect-src 'self' *.firebaseapp.com *.firebase.com *.firebaseio.com *.googleapis.com;
      frame-src 'self' *.firebaseapp.com;
      object-src 'none';
    `.replace(/\s+/g, ' ').trim()
  );

  return response;
}

export const config = {
  matcher: '/:path*',
}; 