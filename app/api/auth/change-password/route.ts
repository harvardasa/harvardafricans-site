import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { markPasswordSet } from '@/lib/profiles'

// POST { email, current_password, password }. Re-authenticates the user against
// their current password before applying the new one — supabase.auth.updateUser
// will accept a password change without re-auth if the session is fresh, but
// we want defense-in-depth.
export async function POST(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const current_password = (body as { current_password?: unknown })?.current_password
  const password = (body as { password?: unknown })?.password
  if (typeof current_password !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  if (!isStrongPassword(password)) {
    return NextResponse.json({ error: 'New password does not meet the policy' }, { status: 400 })
  }

  // Verify the current password by attempting a sign-in with the admin client
  // (a separate, non-cookie-affecting client so we don't clobber the session).
  const admin = createAdminClient()
  const { error: signinError } = await admin.auth.signInWithPassword({
    email: user.email,
    password: current_password,
  })
  if (signinError) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, { password })
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await markPasswordSet(admin, user.id)

  return NextResponse.json({ ok: true })
}

function isStrongPassword(p: string): boolean {
  return (
    p.length >= 12 &&
    /[a-z]/.test(p) &&
    /[A-Z]/.test(p) &&
    /[0-9]/.test(p) &&
    /[^a-zA-Z0-9]/.test(p)
  )
}
