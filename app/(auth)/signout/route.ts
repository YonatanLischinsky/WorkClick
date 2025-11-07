import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    await supabase.auth.signOut()
    revalidatePath('/', 'layout') // Revalidate all pages
  }

  return NextResponse.redirect(new URL('/login', req.url), {
    status: 302,
  })
}
