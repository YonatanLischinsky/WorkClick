import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  // Signs out the user on the server, clearing the auth cookie
  await supabase.auth.signOut();

  // Redirects the user to the login page after sign-out
  return NextResponse.redirect(new URL('/login', request.url), {
    status: 303, // See Other: standard for POST -> GET redirect
  });
}