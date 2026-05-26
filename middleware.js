import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Routes that don't need authentication
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/forgot-password', '/reset-password'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Always allow public routes and API/auth routes
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next({ request });
  }

  // For all app routes: refresh the session cookie and guard access
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
          // Write updated cookies back to both the request and response so the
          // refreshed token propagates to the browser correctly.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() triggers token refresh if the access token is expired.
  // This is the only reliable way to keep sessions alive on Vercel.
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    // Preserve the original destination so we can redirect back after login
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
