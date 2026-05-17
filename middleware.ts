import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard-intel', '/osint_hub'];
const COOKIE_NAME = 'mad_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const session = request.cookies.get(COOKIE_NAME);

  // Cookie ausente: bloqueia antes de qualquer render
  if (!session?.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cookie presente: deixa passar — verificação criptográfica completa
  // ocorre via /api/session no cliente (segunda camada de defesa)
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard-intel', '/dashboard-intel/:path*', '/osint_hub', '/osint_hub/:path*'],
};
