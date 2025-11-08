// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (req.nextUrl.pathname === '/auth/signout') return NextResponse.next();

  // If there is a user and they try to access login/signup, send to dashboard
  if (user && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // IMPORTANT: do NOT block /dashboard here, because middleware can’t see localStorage sessions
  return res
}

// Optionally restrict middleware to these routes (avoids running everywhere)
export const config = {
  matcher: ['/login', '/signup', '/dashboard', '/auth/signout'],
}
