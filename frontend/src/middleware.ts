import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('txunaleads_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Se o utilizador tenta aceder ao dashboard sem token, manda para o login
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // 2. Se o utilizador JÁ tem token e tenta ir ao login ou signup, manda para o dashboard
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup')) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Configurar em quais caminhos o middleware deve ser executado
export const config = {
  matcher: ['/dashboard/:path*', '/auth/login', '/auth/signup'],
};
