import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashToken } from '@/lib/tokens'
import { clientIp, rateLimit } from '@/lib/rate-limit'

// POST { token, password }. Validates the custom recovery-email token, updates
// the password via admin.updateUserById, marks the token used.
export async function POST(request: Request) {
  const ip = clientIp(request)
  const limit = rateLimit(`reset:${ip}`, 10, 60_000)
  if (!limit.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const token = (body as { token?: unknown })?.token
  const password = (body as { password?: unknown })?.password
  if (typeof token !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  if (!isStrongPassword(password)) {
    return NextResponse.json(
      { error: 'Password does not meet the policy' },
      { status: 400 },
    )
  }

  const admin = createAdminClient()
  const tokenHash = hashToken(token)

  const { data: row } = await admin
    .from('password_reset_tokens')
    .select('id, user_id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (!row || row.used_at || new Date(row.expires_at) <= new Date()) {
    return NextResponse.json({ error: 'Reset link is invalid or expired' }, { status: 400 })
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(row.user_id, { password })
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await admin
    .from('password_reset_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', row.id)

  await admin
    .from('profiles')
    .update({ password_set_at: new Date().toISOString() })
    .eq('id', row.user_id)

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
