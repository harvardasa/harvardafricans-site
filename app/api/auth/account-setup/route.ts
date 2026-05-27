import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isNonHarvardEmail, getDomainConfig } from '@/lib/email-domains'

// Called by /signup/account after the user sets their password. Records the
// recovery email and password_set_at on the profile. Creates a partial profile
// row if one doesn't exist yet (the user might not have completed onboarding).
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

  const recovery_email = (body as { recovery_email?: unknown })?.recovery_email
  if (typeof recovery_email !== 'string' || !isNonHarvardEmail(recovery_email)) {
    return NextResponse.json(
      { error: 'Recovery email must be a valid non-Harvard email' },
      { status: 400 },
    )
  }
  if (recovery_email.toLowerCase() === user.email.toLowerCase()) {
    return NextResponse.json(
      { error: 'Recovery email must differ from your Harvard email' },
      { status: 400 },
    )
  }

  const admin = createAdminClient()
  const email_domain = user.email.split('@')[1].toLowerCase()
  const cfg = getDomainConfig(user.email)
  const now = new Date().toISOString()

  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (existing) {
    const { error } = await admin
      .from('profiles')
      .update({
        recovery_email,
        password_set_at: now,
      })
      .eq('id', user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    // Partial profile — onboarding wizard fills the rest. We must provide all
    // NOT NULL columns from the 0001 schema with sensible placeholders.
    const { error } = await admin.from('profiles').insert({
      id: user.id,
      email: user.email,
      email_domain,
      affiliation_type: cfg?.track ?? 'alumni',
      first_name: '',
      last_name: '',
      harvard_school: cfg?.school ?? 'Harvard University',
      country_of_origin: '',
      approval_status: 'pending',
      role: 'member',
      recovery_email,
      password_set_at: now,
      harvard_school_code: cfg?.school_code ?? null,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
