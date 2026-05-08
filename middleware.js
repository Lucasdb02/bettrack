import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Routes inside the app that require authentication
const APP_PREFIXES = [
  '/dashboard', '/bets', '/statistieken', '/maandoverzicht',
  '/calculators', '/bookmakers', '/account', '/extension',
  '/asian-lines', '/odds-v2', '/pricing', '/support',
];

// Auth pages — redirect to dashboard when already logged in
const AUTH_PAGES = ['/login', '/signup', '/forgot-password', '/reset-password'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write refreshed cookies into the request first, then the response
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getSession() reads from the cookie — no network call, more reliable for route protection.
  // Token refresh is handled independently by the browser client.
  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session?.user;

  const isAppRoute = APP_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
  const isAuthPage = AUTH_PAGES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
  const isHomePage = pathname === '/';

  // 1. Protect app routes — send unauthenticated users to /login
  if (isAppRoute && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // 2. Redirect authenticated users away from auth pages and homepage → dashboard
  if ((isAuthPage || isHomePage) && isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on all paths except Next.js internals, static files, and auth callback
    '/((?!api|auth/callback|_next/static|_next/image|favicon\\.ico|icon\\.svg).*)',
  ],
};
