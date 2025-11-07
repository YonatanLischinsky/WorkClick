'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'

type ActionState = { errorKey?: string }

export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState | void> {
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')

  // This helper exists in your version and sets auth cookies for middleware
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const msg = (error.message || '').toLowerCase()
    if (msg.includes('invalid login credentials')) return { errorKey: 'login.errorInvalidCredentials' }
    if (msg.includes('email not confirmed')) return { errorKey: 'login.errorEmailNotConfirmed' }
    return { errorKey: 'login.errorGeneral' }
  }

  if (!data?.user) return { errorKey: 'login.errorGeneral' }

  // Optional: fetch role to route accordingly
  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type')
    .eq('id', data.user.id)
    .single()

  const to = '/dashboard'

  redirect(to)
}

export async function signOutAction() {
  const supabase = createServerActionClient({ cookies })
  await supabase.auth.signOut()  // clears auth cookies
  redirect('/login')
}
