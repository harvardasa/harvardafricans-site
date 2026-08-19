import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isNonHarvardEmail } from '@/lib/email-domains'

// POST { recovery_email } — updates the signed-in member's recovery address.
//
// Until this existed the address could only be set once, during signup, and was
// then frozen forever. That is a problem well beyond typos: people change email
// provider, and a graduate whose recovery address has gone stale has no way
// back into their account at all. It is also where two-factor backup codes are
// sent (see app/actions/mfa.ts), so a stale one quietly misroutes those.
//
// Same rules as signup (app/api/auth/account-setup): a valid address, not a
// Harvard one, and not the member's own login email. Validation is repeated
// here rather than trusted from the client, since the client copy is only a
// convenience.
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
  if (typeof recovery_email !== 'string') {
    return NextResponse.json({ error: 'Missing recovery email.' }, { status: 400 })
  }

  // Normalise BEFORE validating. isNonHarvardEmail anchors its pattern and
  // excludes whitespace, so a pasted address with a stray leading space would
  // otherwise be rejected as malformed.
  const normalized = recovery_email.trim().toLowerCase()
  if (!isNonHarvardEmail(normalized)) {
    return NextResponse.json(
      { error: 'Use a valid non-Harvard email, so it still works after you graduate.' },
      { status: 400 },
    )
  }
  if (normalized === user.email.toLowerCase()) {
    return NextResponse.json(
      { error: 'Your recovery email must be different from your Harvard email.' },
      { status: 400 },
    )
  }

  // Service-role write: RLS lets a member update their own profile, but this
  // column gates account recovery, so it goes through the same admin path the
  // rest of the credential flows use rather than relying on policy shape.
  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ recovery_email: normalized })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, recovery_email: normalized })
}
