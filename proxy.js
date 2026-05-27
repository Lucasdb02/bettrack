import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

const APP_PREFIXES = [
  '/dashboard', '/bets', '/statistieken', '/maandoverzicht',
  '/calculators', '/bookmakers', '/account', '/extension',
  '/asian-lines', '/odds-v2', '/pricing', '/support', '/admin',
];
const AUTH_PAGES = ['/login', '/signup', '/forgot-password'];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/auth/') || pathname === '/reset-password') {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getSession reads the cookie — no network call, no hangs, no redirect loops.
  // The browser client handles token refresh automatically in the background.
  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session?.user;

  const isAppRoute = APP_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'));
  const isAuthPage = AUTH_PAGES.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (isAppRoute && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if ((isAuthPage || pathname === '/') && isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|auth/callback|_next/static|_next/image|favicon\\.ico|icon\\.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
