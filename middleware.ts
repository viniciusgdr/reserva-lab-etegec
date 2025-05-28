import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const publicPaths = ['/', '/api/auth/login'];
  
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  const token = request.cookies.get('auth_token')?.value;

  if (!token && !request.nextUrl.pathname.startsWith('/api/')) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    console.log('Redirecionando para login:', loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  // Aplicar middleware em todas as rotas exceto recursos estáticos
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
