import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Next.js 16 renamed middleware → proxy. Same behavior. See
// node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public paths anyone (logged in or not) can reach.
  const publicAuthPaths = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ]
  const isPublicAuthPath = publicAuthPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  // Protected app paths.
  const protectedPrefixes = ['/directory', '/profile', '/admin', '/pending', '/onboarding', '/account']
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))

  // Logged-out users hitting protected paths → /login.
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Logged-in users hitting login/signup → /directory. We don't bounce them off
  // /forgot-password or /reset-password (they might be helping someone, or
  // completing a reset from an email link while still signed in elsewhere).
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/directory'
    return NextResponse.redirect(url)
  }

  // Legacy magic-link users (no password yet) get force-redirected to
  // /account/set-password until they pick a password. We allow /api/* and
  // the set-password page itself through to avoid a redirect loop.
  if (
    user &&
    isProtected &&
    pathname !== '/account/set-password' &&
    !pathname.startsWith('/api/')
  ) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('password_set_at')
      .eq('id', user.id)
      .maybeSingle()

    if (profile && !profile.password_set_at) {
      const url = request.nextUrl.clone()
      url.pathname = '/account/set-password'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
